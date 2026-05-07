import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

import { Camera } from "@scottjgilroy/react-native-vision-camera-v4-pose-detection";
import Svg, { Circle, Line } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Point = {
  x: number;
  y: number;
};

const MIN_BODY_HEIGHT = 120;
const PROCESS_DELAY = 1;

function scalePoint(p?: Point) {
  if (!p) return null;

  const MODEL_WIDTH = 480;
  const MODEL_HEIGHT = 640;

  const scale = Math.max(
    SCREEN_WIDTH / MODEL_WIDTH,
    SCREEN_HEIGHT / MODEL_HEIGHT
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

function isGoodPoint(point?: Point) {
  if (!point) return false;
  if (point.x <= 0 || point.y <= 0) return false;
  return true;
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
    data.leftAnklePosition.y - data.leftShoulderPosition.y
  );

  const rightBodyHeight = Math.abs(
    data.rightAnklePosition.y - data.rightShoulderPosition.y
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

function DrawLine({ a, b, color }: { a?: Point; b?: Point; color: string }) {
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
      stroke={color}
      strokeWidth="5"
      strokeLinecap="round"
    />
  );
}

function DrawPoint({ p, color }: { p?: Point; color: string }) {
  if (!isGoodPoint(p)) return null;

  const point = scalePoint(p);
  if (!point) return null;

  return <Circle cx={point.x} cy={point.y} r="6" fill={color} />;
}

export default function WorkoutScreen() {
  const { exercise } = useLocalSearchParams();

  const { hasPermission, requestPermission } = useCameraPermission();
  const [position, setPosition] = useState<"front" | "back">("front");
  const device = useCameraDevice(position);

  const [pose, setPose] = useState<any>(null);
  const [feedback, setFeedback] = useState("Tracking...");
  const [stage, setStage] = useState("checking");
  const [leftKneeAngle, setLeftKneeAngle] = useState(0);
  const [rightKneeAngle, setRightKneeAngle] = useState(0);

  const lastProcessedTime = useRef(0);
  const lastTextUpdateTime = useRef(0);
  const missingPoseCount = useRef(0);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  useEffect(() => {
    return () => {
      setPose(null);
      setFeedback("Tracking stopped");
      setStage("stopped");
      setLeftKneeAngle(0);
      setRightKneeAngle(0);
    };
  }, []);

  function processPose(data: any) {
    const now = Date.now();

    if (now - lastProcessedTime.current < PROCESS_DELAY) return;
    lastProcessedTime.current = now;

    if (!isValidPose(data)) {
      missingPoseCount.current += 1;

      if (missingPoseCount.current >= 3) {
        setPose(null);

        if (now - lastTextUpdateTime.current > 500) {
          lastTextUpdateTime.current = now;
          setFeedback("Show full body");
          setStage("waiting");
          setLeftKneeAngle(0);
          setRightKneeAngle(0);
        }
      }

      return;
    }

    missingPoseCount.current = 0;

    const leftAngle = calculateAngle(
      data.leftHipPosition,
      data.leftKneePosition,
      data.leftAnklePosition
    );

    const rightAngle = calculateAngle(
      data.rightHipPosition,
      data.rightKneePosition,
      data.rightAnklePosition
    );

    setPose(data);
    setLeftKneeAngle(Math.round(leftAngle));
    setRightKneeAngle(Math.round(rightAngle));

    if (now - lastTextUpdateTime.current > 500) {
      lastTextUpdateTime.current = now;
      setStage("tracking");
      setFeedback("Skeleton locked");
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

  const GREEN = "#22c55e";
  const RED = "#ef4444";
  const YELLOW = "#facc15";

  const leftLegColor =
    leftKneeAngle >= 70 && leftKneeAngle <= 170 ? GREEN : RED;

  const rightLegColor =
    rightKneeAngle >= 70 && rightKneeAngle <= 170 ? GREEN : RED;

  return (
    <View style={styles.container}>
      <Camera
        key={position}
        style={styles.camera}
        device={device}
        isActive={true}
        options={{
          mode: "stream",
          performanceMode: "min",
        }}
        callback={(data: any) => processPose(data)}
      />

      {pose ? (
        <Svg style={StyleSheet.absoluteFill}>
          <DrawLine a={pose.leftShoulderPosition} b={pose.rightShoulderPosition} color={GREEN} />
          <DrawLine a={pose.leftShoulderPosition} b={pose.leftHipPosition} color={GREEN} />
          <DrawLine a={pose.rightShoulderPosition} b={pose.rightHipPosition} color={GREEN} />
          <DrawLine a={pose.leftHipPosition} b={pose.rightHipPosition} color={GREEN} />

          <DrawLine a={pose.leftHipPosition} b={pose.leftKneePosition} color={leftLegColor} />
          <DrawLine a={pose.leftKneePosition} b={pose.leftAnklePosition} color={leftLegColor} />
          <DrawLine a={pose.leftShoulderPosition} b={pose.leftElbowPosition} color={YELLOW} />
          <DrawLine a={pose.leftElbowPosition} b={pose.leftWristPosition} color={YELLOW} />
          <DrawLine a={pose.rightHipPosition} b={pose.rightKneePosition} color={rightLegColor} />
          <DrawLine a={pose.rightKneePosition} b={pose.rightAnklePosition} color={rightLegColor} />
          <DrawLine a={pose.rightShoulderPosition} b={pose.rightElbowPosition} color={YELLOW} />
          <DrawLine a={pose.rightElbowPosition} b={pose.rightWristPosition} color={YELLOW} />
          <DrawPoint p={pose.leftShoulderPosition} color={GREEN} />
          <DrawPoint p={pose.rightShoulderPosition} color={GREEN} />
          <DrawPoint p={pose.leftHipPosition} color={GREEN} />
          <DrawPoint p={pose.rightHipPosition} color={GREEN} />
          <DrawPoint p={pose.leftKneePosition} color={leftLegColor} />
          <DrawPoint p={pose.rightKneePosition} color={rightLegColor} />
          <DrawPoint p={pose.leftAnklePosition} color={GREEN} />
          <DrawPoint p={pose.rightAnklePosition} color={GREEN} />
          <DrawPoint p={pose.leftElbowPosition} color={YELLOW} />
          <DrawPoint p={pose.rightElbowPosition} color={YELLOW} />
          <DrawPoint p={pose.leftWristPosition} color={YELLOW} />
          <DrawPoint p={pose.rightWristPosition} color={YELLOW} />
        </Svg>
      ) : null}

      <View style={styles.overlay}>
        <Text style={styles.exercise}>{exercise || "Workout"}</Text>
        <Text style={styles.counter}>Reps: Disabled</Text>
        <Text style={[styles.stage, { color: stage === "tracking" ? GREEN : YELLOW }]}>
          Stage: {stage}
        </Text>
        <Text style={styles.feedback}>{feedback}</Text>
        <Text style={styles.angle}>Left Knee: {leftKneeAngle}</Text>
        <Text style={styles.angle}>Right Knee: {rightKneeAngle}</Text>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() =>
            setPosition((current) => (current === "back" ? "front" : "back"))
          }
        >
          <Text style={styles.buttonText}>Flip</Text>
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
  overlay: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  exercise: {
    color: "#22c55e",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  counter: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  stage: {
    fontSize: 18,
    marginBottom: 8,
  },
  feedback: {
    color: "#22c55e",
    fontSize: 18,
    marginBottom: 8,
  },
  angle: {
    color: "white",
    fontSize: 16,
  },
  bottomBar: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  switchBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 32,
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
    fontWeight: "600",
  },
});