import { router } from "expo-router";
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

const data = [
  {
    name: "Chest",
    image: require("../assets/images/chest.png"),
    count: "12 workouts",
  },
  {
    name: "Legs",
    image: require("../assets/images/upperLegs.png"),
    count: "16 workouts",
  },
  {
    name: "Arms",
    image: require("../assets/images/upperArms.png"),
    count: "10 workouts",
  },
  {
    name: "Core",
    image: require("../assets/images/waist.png"),
    count: "14 workouts",
  },
];

export default function BodyParts() {
  const isDark = useColorScheme() === "dark";
  const palette = isDark ? darkPalette : lightPalette;

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
        <Text style={[styles.kicker, { color: palette.accent }]}>Workout Library</Text>
        <Text style={[styles.title, { color: palette.text }]}>Choose Body Part</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Choose the muscle group you want to train
        </Text>
      </View>

      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.name}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
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
                pathname: "/exercises",
                params: { part: item.name },
              })
            }
          >
            <View style={[styles.accentWash, { backgroundColor: palette.accent }]} />
            <View style={[styles.imageWrap, { backgroundColor: palette.softAccent }]}>
              <Image source={item.image} style={styles.image} />
            </View>
            <View style={styles.cardFooter}>
              <View>
                <Text style={[styles.label, { color: palette.text }]}>{item.name}</Text>
                <Text style={[styles.cardMeta, { color: palette.muted }]}>{item.count}</Text>
              </View>
              <View style={[styles.arrowBadge, { backgroundColor: palette.softAccent }]}>
                <Text style={[styles.arrow, { color: palette.accent }]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
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

  kicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },

  titleBlock: {
    marginBottom: 24,
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
    minHeight: 218,
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
    height: 126,
    justifyContent: "center",
    marginBottom: 17,
    width: "100%",
  },

  image: {
    width: 92,
    height: 92,
    resizeMode: "contain",
  },

  label: {
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24,
  },

  cardMeta: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 4,
  },

  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  arrowBadge: {
    alignItems: "center",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  arrow: {
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 28,
    marginTop: -2,
  },
});
