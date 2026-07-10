import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { usePlaces } from "@/src/hooks/usePlaces";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { places, remove } = usePlaces();

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
      <Text style={styles.title}>{place?.name}</Text>

      {place.note && <Text style={styles.note}>{place?.note}</Text>}

      <Text>{new Date(place.createdAt).toLocaleDateString()}</Text>

      <Button
        title="Slet sted"
        onPress={() => {
          handleDelete(place.id);
        }}
      />
    </View>
  );

  function handleDelete(placeId: string) {
    Alert.alert("Slet sted", "Er du sikker på, at du vil slette dette sted?", [
      {
        text: "Annuller",
        style: "cancel",
      },
      {
        text: "Slet",
        style: "destructive",
        onPress: async () => {
          await remove(placeId);

          router.replace("/");
        },
      },
    ]);
  }
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
