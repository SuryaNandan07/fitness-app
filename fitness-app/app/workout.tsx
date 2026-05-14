import { Camera } from "@scottjgilroy/react-native-vision-camera-v4-pose-detection";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import {
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { exercises } from "../exercises";
import { apiRequest } from "../utils/api";
import { getToken } from "../utils/authStorage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Point = {
  x: number;
  y: number;
};

type WrongPart = "none" | "back" | "knees" | "depth" | "arms";

const MIN_BODY_HEIGHT = 120;
const PROCESS_DELAY = 120;

function isGoodPoint(point?: Point) {
  if (!point) return false;
  if (point.x <= 0 || point.y <= 0) return false;
  return true;
}

function scalePoint(p?: Point) {
  if (!p) return null;

  const MODEL_WIDTH = 480;
  const MODEL_HEIGHT = 640;

  const scale = Math.max(
    SCREEN_WIDTH / MODEL_WIDTH,
    SCREEN_HEIGHT / MODEL_HEIGHT,
  );

  const scaledWidth = MODEL_WIDTH * scale;
  const scaledHeight = MODEL_HEIGHT * scale;

  const offsetX = (scaledWidth - SCREEN_WIDTH) / 2;
  const offsetY = (scaledHeight - SCREEN_HEIGHT) / 2;

  return {
    x: SCREEN_WIDTH - (p.x * scale - offsetX),
    y: p.y * scale - offsetY,
  };
}

function DrawWrongLine({ a, b }: { a?: Point; b?: Point }) {
  if (!isGoodPoint(a) || !isGoodPoint(b)) return null;

  const p1 = scalePoint(a);
  const p2 = scalePoint(b);

  if (!p1 || !p2) return null;

  return (
    <Line
      x1={p1.x}
      y1={p1.y}
      x2={p2.x}
      y2={p2.y}
      stroke="#ef4444"
      strokeWidth="7"
      strokeLinecap="round"
    />
  );
}

function DrawWrongPoint({ p }: { p?: Point }) {
  if (!isGoodPoint(p)) return null;

  const point = scalePoint(p);
  if (!point) return null;

  return (
    <Circle
      cx={point.x}
      cy={point.y}
      r="9"
      fill="#ef4444"
      stroke="white"
      strokeWidth="2"
    />
  );
}

export default function WorkoutScreen() {
  const { exercise } = useLocalSearchParams();

  const exerciseName = useMemo(() => {
    if (typeof exercise !== "string") return "squats";
    return exercise.toLowerCase().trim();
  }, [exercise]);

  const [cameraActive, setCameraActive] = useState(true);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [position, setPosition] = useState<"front" | "back">("front");
  const device = useCameraDevice(position);

  const selectedExercise = useMemo(() => {
    return exercises[exerciseName] ?? exercises.squats;
  }, [exerciseName]);

  const [pose, setPose] = useState<any>(null);
  const [wrongPart, setWrongPart] = useState<WrongPart>("none");
  const [feedback, setFeedback] = useState("Show full body");
  const [stage, setStage] = useState("waiting");
  const [debugInfo, setDebugInfo] = useState("");

  const [totalReps, setTotalReps] = useState(0);
  const [goodReps, setGoodReps] = useState(0);
  const [badReps, setBadReps] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const lastProcessedTime = useRef(0);
  const missingPoseCount = useRef(0);
  const previousStage = useRef("waiting");
  const repHadMistake = useRef(false);
  const workoutStartTime = useRef(Date.now());

  const player = useVideoPlayer(selectedExercise.video, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    const timer = setTimeout(() => {
      player.play();
    }, 500);

    return () => clearTimeout(timer);
  }, [player]);

  function detectRep(currentStage: string, currentWrongPart: WrongPart) {
    const previous = previousStage.current;

    if (currentWrongPart !== "none") {
      repHadMistake.current = true;

      setMistakes((oldMistakes) => {
        if (oldMistakes.includes(currentWrongPart)) return oldMistakes;
        return [...oldMistakes, currentWrongPart];
      });
    }

    const wentDown =
      currentStage.toLowerCase().includes("down") ||
      currentStage.toLowerCase().includes("bottom");

    const cameUp =
      currentStage.toLowerCase().includes("up") ||
      currentStage.toLowerCase().includes("top");

    const wasDown =
      previous.toLowerCase().includes("down") ||
      previous.toLowerCase().includes("bottom");

    if (wasDown && cameUp) {
      setTotalReps((value) => value + 1);

      if (repHadMistake.current) {
        setBadReps((value) => value + 1);
      } else {
        setGoodReps((value) => value + 1);
      }

      repHadMistake.current = false;
    }

    if (wentDown || cameUp) {
      previousStage.current = currentStage;
    }
  }

  function processPose(data: any) {
    const now = Date.now();
    if (now - lastProcessedTime.current < PROCESS_DELAY) return;
    lastProcessedTime.current = now;

    if (!data) {
      missingPoseCount.current += 1;

      if (missingPoseCount.current >= 8) {
        setPose(null);
        setWrongPart("none");
        setFeedback("No person detected");
        setStage("waiting");
      }

      return;
    }

    missingPoseCount.current = 0;
    setPose(data);

    const result = selectedExercise.process(data);

    const currentWrongPart = result.wrongPart as WrongPart;

    setWrongPart(currentWrongPart);
    setFeedback(result.feedback);
    setStage(result.stage);

    if (typeof result.reps === "number") {
      setTotalReps(result.reps);
    }

    if (typeof result.goodReps === "number") {
      setGoodReps(result.goodReps);
    }

    if (typeof result.badReps === "number") {
      setBadReps(result.badReps);
    }

    if (result.debug) {
      setDebugInfo(result.debug);
    }
  }

  async function saveWorkoutSession() {
    try {
      setIsSaving(true);
      setCameraActive(false);

      const token = await getToken();

      if (!token) {
        Alert.alert("Login required", "Please login again.");
        router.replace("/login");
        return;
      }

      const duration = Math.floor(
        (Date.now() - workoutStartTime.current) / 1000,
      );

      const accuracy =
        totalReps > 0 ? Math.round((goodReps / totalReps) * 100) : 0;

      await apiRequest(
        "/workouts/save",
        "POST",
        {
          exercise: exerciseName,
          totalReps,
          goodReps,
          badReps,
          accuracy,
          duration,
          mistakes,
        },
        token,
      );

      Alert.alert("Workout saved", "Your progress has been added.", [
        {
          text: "View Profile",
          onPress: () => router.push("/profile"),
        },
      ]);
    } catch (error: any) {
      setCameraActive(true);
      Alert.alert("Save failed", error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No camera found</Text>
      </View>
    );
  }

  const isWrong = wrongPart !== "none";

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={cameraActive}
        enableZoomGesture={false}
        options={{
          mode: "stream",
          performanceMode: "min",
        }}
        callback={(data: any) => processPose(data)}
      />

      <View style={styles.guideBox}>
        <VideoView
          player={player}
          style={styles.guideVideo}
          contentFit="contain"
          nativeControls={false}
          surfaceType="textureView"
        />
        <Text style={styles.guideLabel}>Follow this</Text>
      </View>

      <View style={styles.repBox}>
        <Text style={styles.repNumber}>{totalReps}</Text>
        <Text style={styles.repLabel}>Reps</Text>

        <View style={styles.repRow}>
          <Text style={styles.goodRepText}>Good: {goodReps}</Text>
          <Text style={styles.badRepText}>Bad: {badReps}</Text>
        </View>
      </View>

      {pose && isWrong ? (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {wrongPart === "back" && (
            <>
              <DrawWrongLine
                a={pose.leftShoulderPosition}
                b={pose.leftHipPosition}
              />
              <DrawWrongLine
                a={pose.rightShoulderPosition}
                b={pose.rightHipPosition}
              />
              <DrawWrongPoint p={pose.leftShoulderPosition} />
              <DrawWrongPoint p={pose.rightShoulderPosition} />
              <DrawWrongPoint p={pose.leftHipPosition} />
              <DrawWrongPoint p={pose.rightHipPosition} />
            </>
          )}

          {wrongPart === "knees" && (
            <>
              <DrawWrongLine
                a={pose.leftHipPosition}
                b={pose.leftKneePosition}
              />
              <DrawWrongLine
                a={pose.leftKneePosition}
                b={pose.leftAnklePosition}
              />
              <DrawWrongLine
                a={pose.rightHipPosition}
                b={pose.rightKneePosition}
              />
              <DrawWrongLine
                a={pose.rightKneePosition}
                b={pose.rightAnklePosition}
              />
              <DrawWrongPoint p={pose.leftKneePosition} />
              <DrawWrongPoint p={pose.rightKneePosition} />
            </>
          )}

          {wrongPart === "depth" && (
            <>
              <DrawWrongLine
                a={pose.leftHipPosition}
                b={pose.leftKneePosition}
              />
              <DrawWrongLine
                a={pose.rightHipPosition}
                b={pose.rightKneePosition}
              />
              <DrawWrongPoint p={pose.leftHipPosition} />
              <DrawWrongPoint p={pose.rightHipPosition} />
              <DrawWrongPoint p={pose.leftKneePosition} />
              <DrawWrongPoint p={pose.rightKneePosition} />
            </>
          )}

          {wrongPart === "arms" && (
            <>
              <DrawWrongLine
                a={pose.leftShoulderPosition}
                b={pose.leftElbowPosition}
              />
              <DrawWrongLine
                a={pose.leftElbowPosition}
                b={pose.leftWristPosition}
              />
              <DrawWrongLine
                a={pose.rightShoulderPosition}
                b={pose.rightElbowPosition}
              />
              <DrawWrongLine
                a={pose.rightElbowPosition}
                b={pose.rightWristPosition}
              />
              <DrawWrongPoint p={pose.leftElbowPosition} />
              <DrawWrongPoint p={pose.rightElbowPosition} />
            </>
          )}
        </Svg>
      ) : null}

      {debugInfo ? (
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      ) : null}

      <View
        style={[styles.feedbackBox, isWrong ? styles.badBox : styles.goodBox]}
      >
        <Text style={styles.feedbackText}>{feedback}</Text>
        <Text style={styles.stageText}>Stage: {stage}</Text>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={saveWorkoutSession}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>
            {isSaving ? "Saving..." : "Finish & Save"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => {
            setCameraActive(false);

            setPose(null);
            setWrongPart("none");
            setFeedback("Show full body");
            setStage("waiting");

            setTimeout(() => {
              setPosition((current) => (current === "back" ? "front" : "back"));
              setCameraActive(true);
            }, 300);
          }}
        >
          <Text style={styles.buttonText}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  center: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  camera: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  text: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
  },
  guideBox: {
    position: "absolute",
    top: 45,
    right: 16,
    width: 190,
    height: 115,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  guideVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  guideLabel: {
    position: "absolute",
    bottom: 6,
    alignSelf: "center",
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  repBox: {
    position: "absolute",
    top: 45,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  repNumber: {
    color: "white",
    fontSize: 42,
    fontWeight: "900",
  },
  repLabel: {
    color: "white",
    fontSize: 13,
    fontWeight: "800",
    opacity: 0.85,
  },
  repRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  goodRepText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "900",
  },
  badRepText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "900",
  },
  feedbackBox: {
    position: "absolute",
    bottom: 145,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 18,
    alignItems: "center",
  },
  goodBox: {
    backgroundColor: "rgba(34,197,94,0.9)",
  },
  badBox: {
    backgroundColor: "rgba(239,68,68,0.9)",
  },
  feedbackText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  stageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
    opacity: 0.9,
  },
  bottomBar: {
    position: "absolute",
    bottom: 35,
    width: "100%",
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: "#22c55e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginBottom: 10,
  },
  switchBtn: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  debugBox: {
    position: "absolute",
    top: 175,
    left: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    padding: 10,
    borderRadius: 10,
  },
  debugText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
});
