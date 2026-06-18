import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

const exerciseDetails: Record<
  string,
  {
    target: string;
    equipment: string;
    secondary: string;
    instructions: string[];
    supportsCamera: boolean;
    demo?: number;
    fallback?: number;
  }
> = {
  Squats: {
    target: "Legs",
    equipment: "Bodyweight",
    secondary: "Glutes, hamstrings, core",
    instructions: [
      "Stand with feet around shoulder width and toes slightly turned out.",
      "Brace your core, send hips back, and keep knees tracking over toes.",
      "Drive through the full foot to stand tall with control.",
    ],
    supportsCamera: true,
    demo: require("../assets/guides/squat.mp4"),
    fallback: require("../assets/images/2.jpg"),
  },
  Lunges: {
    target: "Legs",
    equipment: "Bodyweight",
    secondary: "Glutes, hamstrings, calves",
    instructions: [
      "Step forward with control and keep your torso upright.",
      "Lower until both knees bend comfortably without collapsing inward.",
      "Push through the front foot to return to standing.",
    ],
    supportsCamera: false,
    demo: require("../assets/guides/lunge.mp4"),
    fallback: require("../assets/images/1.jpg"),
  },
  Pushups: {
    target: "Chest",
    equipment: "Bodyweight",
    secondary: "Shoulders, triceps, core",
    instructions: [
      "Set hands just wider than shoulders and keep a straight body line.",
      "Lower with control until your chest is close to the floor.",
      "Press back up without letting your hips sag.",
    ],
    supportsCamera: false,
    demo: require("../assets/guides/pushup.mp4"),
    fallback: require("../assets/images/4.jpg"),
  },
  "Incline Pushups": {
    target: "Chest",
    equipment: "Bench / Bodyweight",
    secondary: "Shoulders, triceps, core",
    instructions: [
      "Place hands on a stable elevated surface.",
      "Keep your body straight as you lower toward the surface.",
      "Press away smoothly while keeping shoulders controlled.",
    ],
    supportsCamera: false,
    fallback: require("../assets/images/3.jpg"),
  },
  "Bicep Curls": {
    target: "Arms",
    equipment: "Dumbbells",
    secondary: "Forearms",
    instructions: [
      "Stand tall with elbows close to your sides.",
      "Curl the weight without swinging your torso.",
      "Lower slowly until your arms are almost straight.",
    ],
    supportsCamera: false,
    fallback: require("../assets/images/android-icon-monochrome.png"),
  },
  Plank: {
    target: "Core",
    equipment: "Bodyweight",
    secondary: "Shoulders, glutes",
    instructions: [
      "Stack elbows under shoulders and press forearms into the floor.",
      "Squeeze glutes and keep ribs pulled down.",
      "Hold a long line while breathing steadily.",
    ],
    supportsCamera: false,
    fallback: require("../assets/images/android-icon-foreground.png"),
  },
};

const fallbackDemo = require("../assets/guides/squat.mp4");

export default function InstructionsScreen() {
  const { exercise } = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const palette = isDark ? darkPalette : lightPalette;
  const exerciseName = typeof exercise === "string" ? exercise : "Exercise";
  const details = exerciseDetails[exerciseName] ?? {
    target: "Full body",
    equipment: "Bodyweight",
    secondary: "Supporting muscles",
    instructions: ["Move with good form and keep every rep controlled."],
    supportsCamera: false,
    fallback: require("../assets/images/instructions/1.jpg"),
  };

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
  const player = useVideoPlayer(details.demo ?? fallbackDemo, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  // ==================================
  // AUTO PLAY
  // ==================================
  useEffect(() => {
    if (frames.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length);
    }, 700);

    return () => clearInterval(interval);
  }, [exercise, frames.length]);

  const handleFormCorrection = () => {
    router.push({
      pathname: "/workout",
      params: { exercise: exerciseName },
    });
  };

  const fallbackImage = frames.length > 0 ? frames[index] : details.fallback;

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { backgroundColor: palette.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: palette.card }]}
        >
          <Text style={[styles.backIcon, { color: palette.text }]}>‹</Text>
        </Pressable>
      </View>

      <View style={[styles.mediaCard, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
        {details.demo ? (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <Image source={fallbackImage} style={styles.heroImage} resizeMode="contain" />
        )}
        <View style={[styles.mediaBadge, { backgroundColor: palette.accent }]}>
          <Text style={styles.mediaBadgeText}>Demo</Text>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={[styles.kicker, { color: palette.accent }]}>Exercise Detail</Text>
        <Text style={[styles.title, { color: palette.text }]}>{exerciseName}</Text>
        <Text style={[styles.tip, { color: palette.muted }]}>{tip}</Text>
      </View>

      <View style={styles.statsGrid}>
        {[
          ["Target", details.target],
          ["Equipment", details.equipment],
          ["Secondary", details.secondary],
        ].map(([label, value]) => (
          <View
            key={label}
            style={[styles.statCard, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Text style={[styles.statLabel, { color: palette.muted }]}>{label}</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Instructions</Text>
        {details.instructions.map((step, stepIndex) => (
          <View key={step} style={styles.stepRow}>
            <View style={[styles.stepDot, { backgroundColor: palette.accent }]}>
              <Text style={styles.stepNumber}>{stepIndex + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: palette.text }]}>{step}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.button}
        onPress={handleFormCorrection}
      >
        <Text style={styles.buttonText}>Start Form Correction</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const lightPalette = {
  background: "#f8f8fa",
  text: "#141116",
  muted: "#74707a",
  card: "#ffffff",
  border: "#ece8ee",
  accent: "#ff3d63",
  subtle: "#f6f3f6",
  shadow: "#d7cbd3",
};

const darkPalette = {
  background: "#0e0d10",
  text: "#f7f2f5",
  muted: "#a79fa8",
  card: "#19161b",
  border: "#28232b",
  accent: "#ff3d63",
  subtle: "#211d24",
  shadow: "#000000",
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 54,
    paddingBottom: 36,
  },

  header: {
    flexDirection: "row",
    marginBottom: 20,
  },

  backButton: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  backIcon: {
    fontSize: 34,
    fontWeight: "600",
    lineHeight: 38,
    marginTop: -2,
  },

  mediaCard: {
    borderRadius: 30,
    borderWidth: 1,
    elevation: 8,
    height: 330,
    overflow: "hidden",
    padding: 10,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
  },

  video: {
    borderRadius: 22,
    height: "100%",
    width: "100%",
  },

  heroImage: {
    height: "100%",
    width: "100%",
  },

  mediaBadge: {
    borderRadius: 999,
    left: 22,
    paddingHorizontal: 13,
    paddingVertical: 8,
    position: "absolute",
    top: 22,
  },

  mediaBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 15,
  },

  titleBlock: {
    marginTop: 24,
  },

  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },

  title: {
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 42,
    marginTop: 8,
  },

  tip: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  statsGrid: {
    gap: 10,
    marginTop: 22,
  },

  statCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },

  statLabel: {
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
    textTransform: "uppercase",
  },

  statValue: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 4,
  },

  section: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
    marginTop: 16,
    padding: 18,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 25,
  },

  stepRow: {
    flexDirection: "row",
    gap: 12,
  },

  stepDot: {
    alignItems: "center",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },

  stepNumber: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },

  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },

  button: {
    alignItems: "center",
    backgroundColor: "#ff3d63",
    borderRadius: 999,
    marginTop: 18,
    paddingVertical: 16,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  message: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    textAlign: "center",
  },
});
