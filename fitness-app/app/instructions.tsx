import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function InstructionsScreen() {
  const { exercise } = useLocalSearchParams();

  const [index, setIndex] = useState(0);

  // ==================================
  // FRAMES FOR EACH EXERCISE
  // ==================================
  const animations: any = {
    Squats: [
      require("../assets/images/instructions/1.jpg"),
      require("../assets/images/instructions/2.jpg"),
      require("../assets/images/instructions/3.jpg"),
      require("../assets/images/instructions/4.jpg"),
    ],

    Lunges: [
      require("../assets/images/instructions/1.jpg"),
      require("../assets/images/instructions/2.jpg"),
      require("../assets/images/instructions/3.jpg"),
      require("../assets/images/instructions/4.jpg"),
    ],

    Pushups: [
      require("../assets/images/instructions/1.jpg"),
      require("../assets/images/instructions/2.jpg"),
      require("../assets/images/instructions/3.jpg"),
      require("../assets/images/instructions/4.jpg"),
    ],
  };

  const tips: any = {
    Squats: "Keep chest up and drive through heels",
    Lunges: "Keep torso upright and step with control",
    Pushups: "Keep body straight and lower with control",
  };

  const frames = animations[exercise as string] || [];
  const tip = tips[exercise as string] || "Move with good form";

  // ==================================
  // AUTO PLAY
  // ==================================
  useEffect(() => {
    if (frames.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length);
    }, 700);

    return () => clearInterval(interval);
  }, [exercise]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise}</Text>

      <Text style={styles.subtitle}>How To Perform</Text>

      <View style={styles.card}>
        {frames.length > 0 && (
          <Image
            source={frames[index]}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>

      <Text style={styles.tip}>{tip}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/workout",
            params: { exercise },
          })
        }
      >
        <Text style={styles.buttonText}>Start Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 24,
    paddingTop: 70,
    alignItems: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 20,
    color: "white",
    marginBottom: 20,
  },

  card: {
    width: "100%",
    height: 320,
    backgroundColor: "#1e293b",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    padding: 20,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  tip: {
    color: "#cbd5e1",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },

  button: {
    backgroundColor: "#22c55e",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
