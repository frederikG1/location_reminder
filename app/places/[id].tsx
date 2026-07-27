import CreatePlaceModal from "@/src/components/places/PlaceFormModal";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import FadeInView from "@/src/components/ui/FadeInView";
import { usePlaces } from "@/src/hooks/usePlaces";
import { theme } from "@/src/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { places, remove, update } = usePlaces();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const place = places.find((item) => item.id === id);

  if (!place) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Sted ikke fundet</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <FadeInView style={styles.content}>
        <Text style={styles.title}>{place.name}</Text>

        {place.note ? <Text style={styles.note}>{place.note}</Text> : null}
      </FadeInView>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <AnimatedPressable
          style={styles.secondaryButton}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.secondaryButtonText}>Rediger</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.destructiveButton}
          onPress={() => handleDelete(place.id)}
        >
          <Text style={styles.destructiveButtonText}>Slet sted</Text>
        </AnimatedPressable>
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
    } catch {
      Alert.alert("Kunne ikke gemme", "Prøv igen om lidt.");
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  note: {
    ...theme.typography.body,
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  notFound: {
    padding: theme.spacing.xl,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingVertical: 15,
    borderRadius: theme.radius.button,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  destructiveButton: {
    flex: 1,
    backgroundColor: theme.colors.danger,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingVertical: 15,
    borderRadius: theme.radius.button,
    alignItems: "center",
  },
  destructiveButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});
