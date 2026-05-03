import { router } from "expo-router";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const data = [
  {
    name: "Chest",
    image: require("../assets/images/1.jpg"),
  },
  {
    name: "Legs",
    image: require("../assets/images/2.jpg"),
  },
  {
    name: "Arms",
    image: require("../assets/images/3.jpg"),
  },
  {
    name: "Core",
    image: require("../assets/images/4.jpg"),
  },
];

export default function BodyParts() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Body Part</Text>

      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/exercises",
                params: { part: item.name },
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
    fontSize: 18,
    fontWeight: "600",
  },
});
