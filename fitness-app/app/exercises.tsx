import { router, useLocalSearchParams } from "expo-router";
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

const exerciseMeta: Record<string, { target: string; equipment: string; level: string }> = {
  Pushups: { target: "Chest", equipment: "Bodyweight", level: "Beginner" },
  "Incline Pushups": { target: "Chest", equipment: "Bench / Bodyweight", level: "Beginner" },
  Squats: { target: "Legs", equipment: "Bodyweight", level: "Beginner" },
  Lunges: { target: "Legs", equipment: "Bodyweight", level: "Intermediate" },
  "Bicep Curls": { target: "Arms", equipment: "Dumbbells", level: "Beginner" },
  Plank: { target: "Core", equipment: "Bodyweight", level: "Beginner" },
};

export default function ExercisesScreen() {
  const { part } = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const palette = isDark ? darkPalette : lightPalette;

  const exerciseData: any = {
    Chest: [
      {
        name: "Pushups",
        image: require("../assets/images/4.jpg"),
      },
      {
        name: "Incline Pushups",
        image: require("../assets/images/3.jpg"),
      },
    ],

    Legs: [
      {
        name: "Squats",
        image: require("../assets/images/2.jpg"),
      },
      {
        name: "Lunges",
        image: require("../assets/images/1.jpg"),
      },
    ],

    Arms: [
      {
        name: "Bicep Curls",
        image: require("../assets/images/android-icon-monochrome.png"),
      },
    ],

    Core: [
      {
        name: "Plank",
        image: require("../assets/images/android-icon-foreground.png"),
      },
    ],
  };

  const data = exerciseData[part as string] || [];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
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

      <View style={styles.titleBlock}>
        <Text style={[styles.kicker, { color: palette.accent }]}>Exercise Library</Text>
        <Text style={[styles.title, { color: palette.text }]}>{part} Exercises</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Pick a movement and review form cues before training.
        </Text>
      </View>

      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.name}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const meta = exerciseMeta[item.name] ?? {
            target: part as string,
            equipment: "Bodyweight",
            level: "Beginner",
          };

          return (
            <TouchableOpacity
              activeOpacity={0.86}
              style={[
                styles.card,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                  shadowColor: palette.shadow,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/instructions",
                  params: { exercise: item.name },
                })
              }
            >
              <View style={[styles.accentWash, { backgroundColor: palette.accent }]} />
              <View style={[styles.imageWrap, { backgroundColor: palette.softAccent }]}>
                <Image source={item.image} style={styles.image} />
              </View>

              <Text style={[styles.label, { color: palette.text }]}>{item.name}</Text>
              <Text style={[styles.metaText, { color: palette.muted }]}>{meta.target}</Text>

              <View style={styles.footer}>
                <View style={[styles.pill, { backgroundColor: palette.subtle }]}>
                  <Text style={[styles.pillText, { color: palette.text }]}>{meta.equipment}</Text>
                </View>
                <Text style={[styles.level, { color: palette.accent }]}>{meta.level}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const lightPalette = {
  background: "#f8f8fa",
  text: "#141116",
  muted: "#74707a",
  card: "#ffffff",
  border: "#ece8ee",
  accent: "#ff3d63",
  softAccent: "#ffe8ee",
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
  softAccent: "rgba(255, 61, 99, 0.16)",
  subtle: "#211d24",
  shadow: "#000000",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 54,
  },

  header: {
    flexDirection: "row",
    marginBottom: 26,
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

  titleBlock: {
    marginBottom: 24,
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

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  listContent: {
    paddingBottom: 32,
  },

  row: {
    gap: 12,
  },

  card: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    elevation: 8,
    marginBottom: 12,
    minHeight: 248,
    overflow: "hidden",
    padding: 14,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
  },

  accentWash: {
    borderRadius: 90,
    height: 120,
    opacity: 0.13,
    position: "absolute",
    right: -46,
    top: -44,
    width: 120,
  },

  imageWrap: {
    alignItems: "center",
    borderRadius: 24,
    height: 118,
    justifyContent: "center",
    marginBottom: 15,
    width: "100%",
  },

  image: {
    height: 88,
    resizeMode: "contain",
    width: 88,
  },

  label: {
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
  },

  metaText: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 4,
  },

  footer: {
    gap: 10,
    marginTop: 14,
  },

  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  pillText: {
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
  },

  level: {
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
  },
});
