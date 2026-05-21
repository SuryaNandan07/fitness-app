import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { apiRequest } from "../utils/api";
import { getToken } from "../utils/authStorage";

export default function RecommendationsScreen() {
  const [age, setAge] = useState("20");
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("60");

  const [bodyType, setBodyType] = useState("skinny");
  const [goal, setGoal] = useState("muscle_gain");
  const [sport, setSport] = useState("cricket");
  const [activityLevel, setActivityLevel] = useState("low");
  const [foodPreference, setFoodPreference] = useState("non_veg");
  const [availableTime, setAvailableTime] = useState("20");
  const [equipment, setEquipment] = useState("none");
  const [injury, setInjury] = useState("none");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleGetRecommendations() {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        Alert.alert("Login required", "Please login first.");
        router.replace("/login");
        return;
      }

      const profileData = {
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        bodyType,
        goal,
        sport,
        activityLevel,
        foodPreference,
        availableTime: Number(availableTime),
        equipment,
        injury,
      };

      await apiRequest("/recommendations/profile", "POST", profileData, token);

      const recommendationData = await apiRequest(
        "/recommendations",
        "GET",
        undefined,
        token,
      );

      console.log(
        "RECOMMENDATION DATA:",
        JSON.stringify(recommendationData, null, 2),
      );

      setResult(recommendationData);
    } catch (error: any) {
      Alert.alert("Recommendation failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  function OptionButton({
    label,
    value,
    selected,
    onPress,
  }: {
    label: string;
    value: string;
    selected: string;
    onPress: (value: string) => void;
  }) {
    const active = selected === value;

    return (
      <TouchableOpacity
        style={[styles.option, active && styles.activeOption]}
        onPress={() => onPress(value)}
      >
        <Text style={[styles.optionText, active && styles.activeOptionText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Recommendations</Text>
      <Text style={styles.subtitle}>Create your fitness profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={styles.input}
          value={gender}
          onChangeText={setGender}
        />

        <Text style={styles.label}>Height cm</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Weight kg</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Body Type</Text>
        <View style={styles.optionWrap}>
          <OptionButton
            label="Skinny"
            value="skinny"
            selected={bodyType}
            onPress={setBodyType}
          />
          <OptionButton
            label="Belly Fat"
            value="belly_fat"
            selected={bodyType}
            onPress={setBodyType}
          />
          <OptionButton
            label="Overweight"
            value="overweight"
            selected={bodyType}
            onPress={setBodyType}
          />
          <OptionButton
            label="Normal"
            value="normal"
            selected={bodyType}
            onPress={setBodyType}
          />
          <OptionButton
            label="Athletic"
            value="athletic"
            selected={bodyType}
            onPress={setBodyType}
          />
        </View>

        <Text style={styles.label}>Goal</Text>
        <View style={styles.optionWrap}>
          <OptionButton
            label="Weight Loss"
            value="weight_loss"
            selected={goal}
            onPress={setGoal}
          />
          <OptionButton
            label="Muscle Gain"
            value="muscle_gain"
            selected={goal}
            onPress={setGoal}
          />
          <OptionButton
            label="Strength"
            value="strength"
            selected={goal}
            onPress={setGoal}
          />
          <OptionButton
            label="Endurance"
            value="endurance"
            selected={goal}
            onPress={setGoal}
          />
          <OptionButton
            label="Fitness"
            value="general_fitness"
            selected={goal}
            onPress={setGoal}
          />
          <OptionButton
            label="Sport"
            value="sport_performance"
            selected={goal}
            onPress={setGoal}
          />
        </View>

        <Text style={styles.label}>Food Preference</Text>
        <View style={styles.optionWrap}>
          <OptionButton
            label="Veg"
            value="veg"
            selected={foodPreference}
            onPress={setFoodPreference}
          />
          <OptionButton
            label="Non Veg"
            value="non_veg"
            selected={foodPreference}
            onPress={setFoodPreference}
          />
          <OptionButton
            label="Eggetarian"
            value="eggetarian"
            selected={foodPreference}
            onPress={setFoodPreference}
          />
          <OptionButton
            label="Vegan"
            value="vegan"
            selected={foodPreference}
            onPress={setFoodPreference}
          />
        </View>

        <Text style={styles.label}>Activity Level</Text>
        <View style={styles.optionWrap}>
          <OptionButton
            label="Low"
            value="low"
            selected={activityLevel}
            onPress={setActivityLevel}
          />
          <OptionButton
            label="Medium"
            value="medium"
            selected={activityLevel}
            onPress={setActivityLevel}
          />
          <OptionButton
            label="High"
            value="high"
            selected={activityLevel}
            onPress={setActivityLevel}
          />
        </View>

        <Text style={styles.label}>Sport</Text>
        <TextInput style={styles.input} value={sport} onChangeText={setSport} />

        <Text style={styles.label}>Available Time minutes</Text>
        <TextInput
          style={styles.input}
          value={availableTime}
          onChangeText={setAvailableTime}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Equipment</Text>
        <TextInput
          style={styles.input}
          value={equipment}
          onChangeText={setEquipment}
        />

        <Text style={styles.label}>Injury</Text>
        <TextInput
          style={styles.input}
          value={injury}
          onChangeText={setInjury}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleGetRecommendations}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Generating..." : "Get My Plan"}
          </Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.sectionTitle}>Why this plan?</Text>
          <Text style={styles.reason}>{result.recommendations.reason}</Text>

          <Text style={styles.sectionTitle}>Exercises</Text>
          {result.recommendations.exercises.map(
            (item: string, index: number) => (
              <Text key={index} style={styles.item}>
                • {item}
              </Text>
            ),
          )}

          <Text style={styles.sectionTitle}>Foods</Text>
          {result.recommendations.foods.map((item: string, index: number) => (
            <Text key={index} style={styles.item}>
              • {item}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Weekly Plan</Text>
          {result.recommendations.weeklyPlan.map((day: any, index: number) => (
            <View key={index} style={styles.dayBox}>
              <Text style={styles.dayTitle}>{day.day}</Text>
              <Text style={styles.item}>Workout: {day.workout.join(", ")}</Text>
              <Text style={styles.item}>Sets: {day.sets}</Text>
              <Text style={styles.item}>Note: {day.note}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.backText}>Back Home</Text>
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
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#22c55e",
    textAlign: "center",
    marginTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: "#111827",
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  activeOption: {
    backgroundColor: "#22c55e",
  },
  optionText: {
    color: "#334155",
    fontWeight: "800",
  },
  activeOptionText: {
    color: "white",
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 22,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "900",
  },
  resultCard: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  reason: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  item: {
    fontSize: 15,
    color: "#334155",
    marginBottom: 6,
    lineHeight: 22,
  },
  dayBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  backButton: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  backText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "900",
  },
});
