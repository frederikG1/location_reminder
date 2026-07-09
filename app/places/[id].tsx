import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { usePlaces } from "@/src/hooks/usePlaces";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { places } = usePlaces();

  const place = places.find((item) => item.id === id);

  if (!place) {
    return (
      <View style={styles.container}>
        <Text>Sted ikke fundet</Text>
      </View>
    );
  }

  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{place.name}</Text>

      {place.note && <Text style={styles.note}>{place.note}</Text>}

      <Text>{new Date(place.createdAt).toLocaleDateString()}</Text>
    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  note: {
    marginTop: 8,
    fontSize: 14,
  },
});
