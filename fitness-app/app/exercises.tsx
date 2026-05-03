import { router, useLocalSearchParams } from "expo-router";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ExercisesScreen() {
  const { part } = useLocalSearchParams();

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
    <View style={styles.container}>
      <Text style={styles.title}>{part} Exercises</Text>

      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/instructions",
                params: { exercise: item.name },
              })
            }
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.label}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 60,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    flex: 1,
    backgroundColor: "#1e293b",
    margin: 8,
    borderRadius: 18,
    alignItems: "center",
    padding: 18,
  },

  image: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: 12,
  },

  label: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
