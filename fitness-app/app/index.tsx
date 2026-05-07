import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Fitness Coach</Text>

      <Text style={styles.subtitle}>
        Train smarter with real-time posture correction
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/bodyparts")}
      >
        <Text style={styles.buttonText}>Start Workout</Text>
      </TouchableOpacity>

      <TouchableOpacity
          style={[styles.button, { marginTop: 16, backgroundColor: "#3b82f6" }]}
          onPress={() => router.push("/yolo-onnx-test")}
      >
        <Text style={styles.buttonText}>Open YOLO ONNX Test</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 40,
  },

  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
