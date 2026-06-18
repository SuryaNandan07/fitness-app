import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { apiRequest } from "../utils/api";
import { getToken, removeToken } from "../utils/authStorage";

const screenWidth = Dimensions.get("window").width;

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [graph, setGraph] = useState<any>({
    labels: [],
    values: [],
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const palette = useColorScheme() === "dark" ? darkPalette : lightPalette;

  async function loadProfile() {
    try {
      setLoading(true);
      setErrorMessage("");

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const profileData = await apiRequest("/auth/me", "GET", undefined, token);
      setUser(profileData.user);

      const summaryData = await apiRequest(
        "/workouts/summary",
        "GET",
        undefined,
        token,
      );
      setSummary(summaryData);

      const graphData = await apiRequest(
        "/workouts/graph",
        "GET",
        undefined,
        token,
      );
      setGraph(graphData);
    } catch (error: any) {
      setErrorMessage(error.message);
      Alert.alert("Profile error", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await removeToken();
    router.replace("/login");
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const graphLabels = graph?.labels?.length > 0 ? graph.labels : ["No", "Data"];

  const graphValues = graph?.values?.length > 0 ? graph.values : [0, 0];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, { backgroundColor: palette.hero }]}>
        <View style={styles.heroGlow} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "A"}</Text>
        </View>
        <Text style={styles.title}>Profile</Text>
        <Text style={[styles.heroName, { color: palette.heroMuted }]}>
          {user?.name || (loading ? "Loading athlete..." : "Athlete")}
        </Text>
      </View>

      {loading ? (
        <View style={[styles.stateCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.stateTitle, { color: palette.text }]}>Loading your profile...</Text>
          <Text style={[styles.stateText, { color: palette.muted }]}>Fetching your account, workout summary, and progress graph.</Text>
        </View>
      ) : null}

      {!loading && errorMessage ? (
        <View style={[styles.stateCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.stateTitle, { color: palette.text }]}>Could not load profile</Text>
          <Text style={[styles.stateText, { color: palette.muted }]}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>User Info</Text>

        <Text style={[styles.label, { color: palette.muted }]}>Name</Text>
        <Text style={[styles.value, { color: palette.text }]}>{user?.name || "Loading..."}</Text>

        <Text style={[styles.label, { color: palette.muted }]}>Email</Text>
        <Text style={[styles.value, { color: palette.text }]}>{user?.email || "Loading..."}</Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Workout Summary</Text>

        <View style={styles.statsGrid}>
          <StatBox label="Workouts" value={summary?.totalWorkouts ?? 0} palette={palette} />
          <StatBox label="Total Reps" value={summary?.totalReps ?? 0} palette={palette} />
          <StatBox label="Good Reps" value={summary?.goodReps ?? 0} palette={palette} />
          <StatBox label="Bad Reps" value={summary?.badReps ?? 0} palette={palette} />
        </View>

        <View style={[styles.accuracyBox, { backgroundColor: palette.softAccent }]}>
          <Text style={[styles.accuracyText, { color: palette.accent }]}>
            Accuracy: {summary?.accuracy ?? 0}%
          </Text>
        </View>
      </View>

      <View style={[styles.graphCard, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Performance Tracker</Text>

        {graph?.values?.length > 0 ? (
          <LineChart
            data={{
              labels: graphLabels,
              datasets: [
                {
                  data: graphValues,
                },
              ],
            }}
            width={screenWidth - 74}
            height={220}
            fromZero
            withInnerLines={false}
            withOuterLines={true}
            withDots={false}
            withShadow={false}
            bezier
            chartConfig={{
              backgroundColor: palette.card,
              backgroundGradientFrom: palette.card,
              backgroundGradientTo: palette.card,
              decimalPlaces: 0,
              color: () => palette.text,
              labelColor: () => palette.muted,
              propsForLabels: {
                fontWeight: "700",
              },
            }}
            style={styles.chart}
          />
        ) : (
          <View style={[styles.emptyGraph, { backgroundColor: palette.subtle }]}>
            <Text style={[styles.stateTitle, { color: palette.text }]}>No graph data yet</Text>
            <Text style={[styles.stateText, { color: palette.muted }]}>Finish and save a workout to start tracking performance.</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/")}>
        <Text style={[styles.secondaryText, { color: palette.accent }]}>Back Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  palette,
}: {
  label: string;
  value: number;
  palette: typeof lightPalette;
}) {
  return (
    <View style={[styles.statBox, { backgroundColor: palette.subtle }]}>
      <Text style={[styles.statNumber, { color: palette.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: palette.muted }]}>{label}</Text>
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
  hero: "#21151a",
  heroMuted: "#f2c8d3",
  subtle: "#f6f3f6",
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
  hero: "#2a121a",
  heroMuted: "#f0b8c8",
  subtle: "#211d24",
  softAccent: "rgba(255, 61, 99, 0.16)",
  shadow: "#000000",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    alignItems: "center",
    borderRadius: 30,
    minHeight: 250,
    overflow: "hidden",
    padding: 24,
  },
  heroGlow: {
    backgroundColor: "rgba(255, 61, 99, 0.46)",
    borderRadius: 120,
    height: 220,
    position: "absolute",
    right: -70,
    top: -70,
    width: 220,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#ff3d63",
    borderRadius: 38,
    height: 76,
    justifyContent: "center",
    marginTop: 18,
    width: 76,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
  },
  title: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38,
    marginTop: 16,
  },
  heroName: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 6,
  },
  stateCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  stateTitle: {
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 23,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ff3d63",
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    elevation: 8,
    padding: 22,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  statsCard: {
    borderRadius: 28,
    borderWidth: 1,
    elevation: 8,
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  graphCard: {
    borderRadius: 28,
    borderWidth: 1,
    elevation: 8,
    overflow: "hidden",
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 25,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
    marginTop: 12,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 18,
    width: "48%",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 17,
    marginTop: 4,
  },
  accuracyBox: {
    alignItems: "center",
    borderRadius: 18,
    marginTop: 12,
    paddingVertical: 14,
  },
  accuracyText: {
    fontSize: 18,
    fontWeight: "900",
  },
  chart: {
    alignSelf: "center",
    borderRadius: 18,
    marginLeft: -10,
  },
  emptyGraph: {
    borderRadius: 20,
    padding: 18,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ff3d63",
    borderRadius: 999,
    marginTop: 4,
    paddingVertical: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 14,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: "900",
  },
});
