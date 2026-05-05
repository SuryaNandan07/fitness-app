import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "react-native";
export default function WorkoutScreen() {
  const { exercise } = useLocalSearchParams();

  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [reps, setReps] = useState(0);
  const [frame, setFrame] = useState("");
  const [stage, setStage] = useState("Ready");
  const [feedback, setFeedback] = useState("Tracking...");
  useEffect(() => {
    if (!permission) return;

    if (!permission.granted) {
      requestPermission();
      return;
    }

    // 🔥 START backend
    fetch("http://192.168.0.117:8000/start");

    // 🔥 POLL backend
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://192.168.0.117:8000/status");
        const data = await res.json();

        console.log(data); // debug

        setReps(data.reps);
        setStage(data.stage);
        setFeedback(data.feedback);
      } catch (err) {
        console.log("Error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [permission]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission required</Text>

        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="front"
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.exercise}>{exercise || "Workout"}</Text>

        <Text style={styles.counter}>Reps: {reps}</Text>

        <Text style={[
          styles.stage,
          { color: stage === "down" ? "yellow" : "green" }
        ]}>
          Stage: {stage}
        </Text>

        <Text style={[
          styles.feedback,
          { color: feedback.includes("Nice") ? "green" : "red" }
        ]}>
          {feedback}
        </Text>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() =>
            setFacing((current) => (current === "back" ? "front" : "back"))
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
  },

  exercise: {
    color: "#22c55e",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  counter: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },

  stage: {
    color: "white",
    fontSize: 18,
    marginBottom: 8,
  },

  feedback: {
    color: "#22c55e",
    fontSize: 18,
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

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 10,
  },
});
