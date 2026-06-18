import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
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
  const [errorMessage, setErrorMessage] = useState("");
  const palette = useColorScheme() === "dark" ? darkPalette : lightPalette;

  async function handleGetRecommendations() {
    try {
      setLoading(true);
      setErrorMessage("");

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
      setErrorMessage(error.message);
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
        activeOpacity={0.86}
        style={[
          styles.option,
          { backgroundColor: active ? palette.accent : palette.subtle },
        ]}
        onPress={() => onPress(value)}
      >
        <Text style={[styles.optionText, { color: active ? "#ffffff" : palette.text }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  const recommendations = result?.recommendations;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: palette.hero }]}>
        <View style={styles.heroGlow} />
        <Text style={styles.kicker}>AI Fitness Coach</Text>
        <Text style={styles.title}>Build your adaptive plan</Text>
        <Text style={[styles.subtitle, { color: palette.heroMuted }]}>
          Tell the coach your goal, schedule, and preferences. Your workout and nutrition plan stays personalized.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Goal Profile</Text>

        <View style={styles.inputGrid}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: palette.muted }]}>Age</Text>
            <TextInput
              style={[styles.input, { backgroundColor: palette.input, color: palette.text, borderColor: palette.border }]}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholderTextColor={palette.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: palette.muted }]}>Gender</Text>
            <TextInput
              style={[styles.input, { backgroundColor: palette.input, color: palette.text, borderColor: palette.border }]}
              value={gender}
              onChangeText={setGender}
              placeholderTextColor={palette.muted}
            />
          </View>
        </View>

        <View style={styles.inputGrid}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: palette.muted }]}>Height cm</Text>
            <TextInput
              style={[styles.input, { backgroundColor: palette.input, color: palette.text, borderColor: palette.border }]}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholderTextColor={palette.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: palette.muted }]}>Weight kg</Text>
            <TextInput
              style={[styles.input, { backgroundColor: palette.input, color: palette.text, borderColor: palette.border }]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholderTextColor={palette.muted}
            />
          </View>
        </View>

        <Text style={[styles.label, { color: palette.muted }]}>Body Type</Text>
        <View style={styles.optionWrap}>
          <OptionButton label="Skinny" value="skinny" selected={bodyType} onPress={setBodyType} />
          <OptionButton label="Belly Fat" value="belly_fat" selected={bodyType} onPress={setBodyType} />
          <OptionButton label="Overweight" value="overweight" selected={bodyType} onPress={setBodyType} />
          <OptionButton label="Normal" value="normal" selected={bodyType} onPress={setBodyType} />
          <OptionButton label="Athletic" value="athletic" selected={bodyType} onPress={setBodyType} />
        </View>

        <Text style={[styles.label, { color: palette.muted }]}>Goal</Text>
        <View style={styles.optionWrap}>
          <OptionButton label="Weight Loss" value="weight_loss" selected={goal} onPress={setGoal} />
          <OptionButton label="Muscle Gain" value="muscle_gain" selected={goal} onPress={setGoal} />
          <OptionButton label="Strength" value="strength" selected={goal} onPress={setGoal} />
          <OptionButton label="Endurance" value="endurance" selected={goal} onPress={setGoal} />
          <OptionButton label="Fitness" value="general_fitness" selected={goal} onPress={setGoal} />
          <OptionButton label="Sport" value="sport_performance" selected={goal} onPress={setGoal} />
        </View>

        <Text style={[styles.label, { color: palette.muted }]}>Food Preference</Text>
        <View style={styles.optionWrap}>
          <OptionButton label="Veg" value="veg" selected={foodPreference} onPress={setFoodPreference} />
          <OptionButton label="Non Veg" value="non_veg" selected={foodPreference} onPress={setFoodPreference} />
          <OptionButton label="Eggetarian" value="eggetarian" selected={foodPreference} onPress={setFoodPreference} />
          <OptionButton label="Vegan" value="vegan" selected={foodPreference} onPress={setFoodPreference} />
        </View>

        <Text style={[styles.label, { color: palette.muted }]}>Activity Level</Text>
        <View style={styles.optionWrap}>
          <OptionButton label="Low" value="low" selected={activityLevel} onPress={setActivityLevel} />
          <OptionButton label="Medium" value="medium" selected={activityLevel} onPress={setActivityLevel} />
          <OptionButton label="High" value="high" selected={activityLevel} onPress={setActivityLevel} />
        </View>

        <Text style={[styles.label, { color: palette.muted }]}>Sport</Text>
        <TextInput
          style={[styles.input, { backgroundColor: palette.input, color: palette.text, borderColor: palette.border }]}
          value={sport}
          onChangeText={setSport}
          placeholderTextColor={palette.muted}
        />

        <Text style={[styles.label, { color: palette.muted }]}>Available Time minutes</Text>
        <TextInput
          style={[styles.input, { backgroundColor: palette.input, color: palette.text, borderColor: palette.border }]}
          value={availableTime}
          onChangeText={setAvailableTime}
          keyboardType="numeric"
          placeholderTextColor={palette.muted}
        />

        <Text style={[styles.label, { color: palette.muted }]}>Equipment</Text>
        <TextInput
          style={[styles.input, { backgroundColor: palette.input, color: palette.text, borderColor: palette.border }]}
          value={equipment}
          onChangeText={setEquipment}
          placeholderTextColor={palette.muted}
        />

        <Text style={[styles.label, { color: palette.muted }]}>Injury</Text>
        <TextInput
          style={[styles.input, { backgroundColor: palette.input, color: palette.text, borderColor: palette.border }]}
          value={injury}
          onChangeText={setInjury}
          placeholderTextColor={palette.muted}
        />

        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleGetRecommendations}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Generating..." : "Get My Plan"}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={[styles.stateCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.stateTitle, { color: palette.text }]}>Building your plan...</Text>
          <Text style={[styles.stateText, { color: palette.muted }]}>The AI coach is matching training, diet, and safety notes to your profile.</Text>
        </View>
      ) : null}

      {!loading && errorMessage ? (
        <View style={[styles.stateCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.stateTitle, { color: palette.text }]}>Could not generate recommendations</Text>
          <Text style={[styles.stateText, { color: palette.muted }]}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleGetRecommendations}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!loading && !errorMessage && !result ? (
        <View style={[styles.stateCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.stateTitle, { color: palette.text }]}>No plan yet</Text>
          <Text style={[styles.stateText, { color: palette.muted }]}>Complete your profile and tap Get My Plan to generate your AI fitness recommendation.</Text>
        </View>
      ) : null}

      {recommendations ? (
        <View style={styles.resultsWrap}>
          <ResultSection title="Goal" palette={palette}>
            <Text style={[styles.reason, { color: palette.muted }]}>{recommendations.reason}</Text>
          </ResultSection>

          <ResultSection title="Workout Plan" palette={palette}>
            {recommendations.exercises.map((item: string, index: number) => (
              <Text key={index} style={[styles.item, { color: palette.text }]}>
                • {item}
              </Text>
            ))}
            {recommendations.weeklyPlan.map((day: any, index: number) => (
              <View key={index} style={[styles.dayBox, { backgroundColor: palette.subtle }]}>
                <Text style={[styles.dayTitle, { color: palette.text }]}>{day.day}</Text>
                <Text style={[styles.item, { color: palette.muted }]}>Workout: {day.workout.join(", ")}</Text>
                <Text style={[styles.item, { color: palette.muted }]}>Sets: {day.sets}</Text>
                <Text style={[styles.item, { color: palette.muted }]}>Note: {day.note}</Text>
              </View>
            ))}
          </ResultSection>

          <ResultSection title="Diet / Nutrition Tips" palette={palette}>
            {recommendations.foods.map((item: string, index: number) => (
              <Text key={index} style={[styles.item, { color: palette.text }]}>
                • {item}
              </Text>
            ))}
          </ResultSection>

          <ResultSection title="Notes / Safety" palette={palette}>
            <Text style={[styles.reason, { color: palette.muted }]}>
              Adjust intensity if pain appears, respect your injury field, and keep form quality ahead of volume.
            </Text>
          </ResultSection>
        </View>
      ) : null}

      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
        <Text style={[styles.backText, { color: palette.accent }]}>Back Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ResultSection({
  title,
  children,
  palette,
}: {
  title: string;
  children: React.ReactNode;
  palette: typeof lightPalette;
}) {
  return (
    <View style={[styles.resultCard, { backgroundColor: palette.card, borderColor: palette.border, shadowColor: palette.shadow }]}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      {children}
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
  input: "#f6f3f6",
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
  hero: "#2a121a",
  heroMuted: "#f0b8c8",
  input: "#211d24",
  subtle: "#211d24",
  shadow: "#000000",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },
  hero: {
    borderRadius: 30,
    minHeight: 240,
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
  kicker: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40,
    marginTop: 44,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    elevation: 8,
    padding: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26,
    marginBottom: 6,
  },
  inputGrid: {
    flexDirection: "row",
    gap: 10,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
    marginBottom: 8,
    marginTop: 14,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 15,
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    borderRadius: 999,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "900",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#ff3d63",
    borderRadius: 999,
    marginTop: 22,
    paddingVertical: 16,
  },
  disabledButton: {
    opacity: 0.72,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
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
  resultsWrap: {
    gap: 14,
  },
  resultCard: {
    borderRadius: 24,
    borderWidth: 1,
    elevation: 5,
    padding: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 25,
    marginBottom: 10,
  },
  reason: {
    fontSize: 15,
    lineHeight: 22,
  },
  item: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  dayBox: {
    borderRadius: 18,
    marginTop: 8,
    padding: 14,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 20,
    marginBottom: 6,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: "900",
  },
});
