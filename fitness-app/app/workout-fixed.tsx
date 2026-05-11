import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { exercises } from "../exercises";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { Camera } from "@scottjgilroy/react-native-vision-camera-v4-pose-detection";
import Svg, { Circle, Line } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const guideVideos: any = {
  squats: require("../assets/guides/squat.mp4"),
  squat: require("../assets/guides/squat.mp4"),

  pushups: require("../assets/guides/pushup.mp4"),
  pushup: require("../assets/guides/pushup.mp4"),

  lunges: require("../assets/guides/lunge.mp4"),
  lunge: require("../assets/guides/lunge.mp4"),
};

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

function isValidPose(data: any) {
  if (!data) return false;

  const requiredPoints = [
    data.leftShoulderPosition,
    data.rightShoulderPosition,
    data.leftHipPosition,
    data.rightHipPosition,
    data.leftKneePosition,
    data.rightKneePosition,
    data.leftAnklePosition,
    data.rightAnklePosition,
  ];

  for (const point of requiredPoints) {
    if (!isGoodPoint(point)) return false;
  }

  const leftBodyHeight = Math.abs(
      data.leftAnklePosition.y - data.leftShoulderPosition.y,
  );

  const rightBodyHeight = Math.abs(
      data.rightAnklePosition.y - data.rightShoulderPosition.y,
  );

  return Math.max(leftBodyHeight, rightBodyHeight) >= MIN_BODY_HEIGHT;
}

function calculateAngle(a: Point, b: Point, c: Point) {
  const radians =
      Math.atan2(c.y - b.y, c.x - b.x) -
      Math.atan2(a.y - b.y, a.x - b.x);

  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;

  return angle;
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

  const lastProcessedTime = useRef(0);
  const missingPoseCount = useRef(0);

  const [debugInfo, setDebugInfo] = useState("");
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

    setWrongPart(result.wrongPart);
    setFeedback(result.feedback);
    setStage(result.stage);

    if (result.debug) {
      setDebugInfo(result.debug);
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

        {pose && isWrong ? (
            <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
              {wrongPart === "back" && (
                  <>
                    <DrawWrongLine a={pose.leftShoulderPosition} b={pose.leftHipPosition} />
                    <DrawWrongLine a={pose.rightShoulderPosition} b={pose.rightHipPosition} />
                    <DrawWrongPoint p={pose.leftShoulderPosition} />
                    <DrawWrongPoint p={pose.rightShoulderPosition} />
                    <DrawWrongPoint p={pose.leftHipPosition} />
                    <DrawWrongPoint p={pose.rightHipPosition} />
                  </>
              )}

              {wrongPart === "knees" && (
                  <>
                    <DrawWrongLine a={pose.leftHipPosition} b={pose.leftKneePosition} />
                    <DrawWrongLine a={pose.leftKneePosition} b={pose.leftAnklePosition} />
                    <DrawWrongLine a={pose.rightHipPosition} b={pose.rightKneePosition} />
                    <DrawWrongLine a={pose.rightKneePosition} b={pose.rightAnklePosition} />
                    <DrawWrongPoint p={pose.leftKneePosition} />
                    <DrawWrongPoint p={pose.rightKneePosition} />
                  </>
              )}

              {wrongPart === "depth" && (
                  <>
                    <DrawWrongLine a={pose.leftHipPosition} b={pose.leftKneePosition} />
                    <DrawWrongLine a={pose.rightHipPosition} b={pose.rightKneePosition} />
                    <DrawWrongPoint p={pose.leftHipPosition} />
                    <DrawWrongPoint p={pose.rightHipPosition} />
                    <DrawWrongPoint p={pose.leftKneePosition} />
                    <DrawWrongPoint p={pose.rightKneePosition} />
                  </>
              )}

              {wrongPart === "arms" && (
                  <>
                    <DrawWrongLine a={pose.leftShoulderPosition} b={pose.leftElbowPosition} />
                    <DrawWrongLine a={pose.leftElbowPosition} b={pose.leftWristPosition} />
                    <DrawWrongLine a={pose.rightShoulderPosition} b={pose.rightElbowPosition} />
                    <DrawWrongLine a={pose.rightElbowPosition} b={pose.rightWristPosition} />
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

        <View style={[styles.feedbackBox, isWrong ? styles.badBox : styles.goodBox]}>
          <Text style={styles.feedbackText}>{feedback}</Text>
          <Text style={styles.stageText}>Stage: {stage}</Text>
        </View>

        <View style={styles.bottomBar}>
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
  feedbackBox: {
    position: "absolute",
    bottom: 115,
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