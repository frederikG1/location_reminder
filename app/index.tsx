import { useState, useCallback } from "react";
import { Button, FlatList, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlaceCard from "@/src/components/places/PlaceCard";
import CreatePlaceModal from "@/src/components/places/PlaceFormModal";
import { usePlaces } from "@/src/hooks/usePlaces";
import { getCurrentLocation } from "@/src/services/location";
import { router, useFocusEffect } from "expo-router";

export default function HomeScreen() {
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { places, create, refresh } = usePlaces();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function handleCreatePlace(name: string, note: string) {
    try {
      const currentLocation = await getCurrentLocation();

      await create({
        name,
        note,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radius: 220,
      });

      setCreateModalVisible(false);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text>Location Reminder 🚀</Text>

      {/* <Button title="Find min position" onPress={handleGetLocation} />
      <Button title="Gem dette sted" onPress={handleSavePlace} /> */}
      <Button
        title="Gem nyt sted"
        onPress={() => setCreateModalVisible(true)}
      />

      <Button title="Åbn kort" onPress={() => router.push("/map")} />

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            onPress={() => {
              console.log(item);

              router.push({
                pathname: "/places/[id]",
                params: { id: item.id },
              });
            }}
          />
        )}
      />

      <CreatePlaceModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={handleCreatePlace}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "stretch",
    gap: 20,
  },
});
