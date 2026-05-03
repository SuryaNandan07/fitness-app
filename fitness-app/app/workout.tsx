import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WorkoutScreen() {
  const { exercise } = useLocalSearchParams();

  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("front");

  useEffect(() => {
    if (!permission) return;

    if (!permission.granted) {
      requestPermission();
    }
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
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.exercise}>{exercise || "Workout"}</Text>

        <Text style={styles.counter}>Reps: 0</Text>
        <Text style={styles.stage}>Stage: Ready</Text>
        <Text style={styles.feedback}>Tracking...</Text>
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
});
