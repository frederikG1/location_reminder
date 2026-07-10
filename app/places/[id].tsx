import CreatePlaceModal from "@/src/components/places/PlaceFormModal";
import { usePlaces } from "@/src/hooks/usePlaces";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { places, remove, update } = usePlaces();
  const [editModalVisible, setEditModalVisible] = useState(false);

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

      <Button
        title="Rediger"
        onPress={() => {
          setEditModalVisible(true);
        }}
      />

      <CreatePlaceModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        initialName={place.name}
        initialNote={place.note}
        onSave={(name, note) =>
          handleUpdatePlace(
            id,
            name,
            note,
            place.latitude,
            place.longitude,
            place.createdAt,
          )
        }
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

          router.back();
        },
      },
    ]);
  }

  async function handleUpdatePlace(
    id: string,
    name: string,
    note: string,
    latitude: number,
    longitude: number,
    createdAt: string,
  ) {
    try {
      await update({
        name,
        note,
        id,
        latitude,
        longitude,
        createdAt,
      });

      setEditModalVisible(false);
      router.back();
    } catch (error) {
      console.log(error);
    }
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
