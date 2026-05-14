import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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

  async function loadProfile() {
    try {
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
      Alert.alert("Profile error", error.message);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>

        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name || "Loading..."}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || "Loading..."}</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Workout Summary</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{summary?.totalWorkouts ?? 0}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{summary?.totalReps ?? 0}</Text>
            <Text style={styles.statLabel}>Total Reps</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{summary?.goodReps ?? 0}</Text>
            <Text style={styles.statLabel}>Good Reps</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{summary?.badReps ?? 0}</Text>
            <Text style={styles.statLabel}>Bad Reps</Text>
          </View>
        </View>

        <View style={styles.accuracyBox}>
          <Text style={styles.accuracyText}>
            Accuracy: {summary?.accuracy ?? 0}%
          </Text>
        </View>
      </View>

      <View style={styles.graphCard}>
        <Text style={styles.sectionTitle}>Performance Tracker</Text>

        <LineChart
          data={{
            labels: graphLabels,
            datasets: [
              {
                data: graphValues,
              },
            ],
          }}
          width={screenWidth - 90}
          height={220}
          fromZero
          withInnerLines={false}
          withOuterLines={true}
          withDots={false}
          withShadow={false}
          bezier
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: () => "#111827",
            labelColor: () => "#111827",
            propsForLabels: {
              fontWeight: "700",
            },
          }}
          style={styles.chart}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.secondaryText}>Back Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 26,
  },
  label: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "700",
    marginTop: 12,
  },
  value: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "800",
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBox: {
    width: "48%",
    backgroundColor: "#f1f5f9",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
    marginTop: 4,
  },
  accuracyBox: {
    backgroundColor: "#dcfce7",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  accuracyText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#15803d",
  },
  graphCard: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    overflow: "hidden",
  },
  chart: {
    borderRadius: 18,
    alignSelf: "center",
    marginLeft: -20,
  },
  button: {
    backgroundColor: "#ef4444",
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryText: {
    color: "#22c55e",
    fontSize: 15,
    fontWeight: "800",
  },
});
