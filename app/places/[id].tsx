import CreatePlaceModal from "@/src/components/places/PlaceFormModal";
import { usePlaces } from "@/src/hooks/usePlaces";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { places, remove, update } = usePlaces();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const place = places.find((item) => item.id === id);

  if (!place) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Sted ikke fundet</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{place.name}</Text>

        {place.note ? <Text style={styles.note}>{place.note}</Text> : null}

        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{place.radius}m radius</Text>
          </View>
          <Text style={styles.date}>
            Gemt {new Date(place.createdAt).toLocaleDateString("da-DK")}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.secondaryButtonText}>Rediger</Text>
        </Pressable>

        <Pressable
          style={styles.destructiveButton}
          onPress={() => handleDelete(place.id)}
        >
          <Text style={styles.destructiveButtonText}>Slet sted</Text>
        </Pressable>
      </View>

      <CreatePlaceModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        initialName={place.name}
        initialNote={place.note}
        initialRadius={place.radius}
        onSave={(name, note, radius) =>
          handleUpdatePlace(
            id,
            name,
            note,
            place.latitude,
            place.longitude,
            radius,
            place.createdAt,
          )
        }
      />
    </SafeAreaView>
  );

  function handleDelete(placeId: string) {
    Alert.alert("Slet sted", "Er du sikker på, at du vil slette dette sted?", [
      { text: "Annuller", style: "cancel" },
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
    radius: number,
    createdAt: string,
  ) {
    try {
      await update({ name, note, id, latitude, longitude, radius, createdAt });
      setEditModalVisible(false);
      router.back();
    } catch (error) {
      console.log(error);
    }
  }
}

const colors = {
  background: "#F7F7F5",
  surface: "#FFFFFF",
  primary: "#2F6F4F",
  danger: "#B3261E",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  border: "#E5E5E1",
  badgeBg: "#E8F1EC",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  note: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  badge: {
    backgroundColor: colors.badgeBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  date: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  notFound: {
    padding: 20,
    fontSize: 16,
    color: colors.textSecondary,
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  destructiveButton: {
    flex: 1,
    backgroundColor: "#FDECEA",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  destructiveButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "600",
  },
});