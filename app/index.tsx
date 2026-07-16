import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlaceCard from "@/src/components/places/PlaceCard";
import CreatePlaceModal from "@/src/components/places/PlaceFormModal";
import { usePlaces } from "@/src/hooks/usePlaces";
import { getCurrentLocation } from "@/src/services/location";
import { router, useFocusEffect } from "expo-router";
import { useBackgroundPermissionPrompt } from "@/src/hooks/useBackgroundPermissionPrompt";
import BackgroundPermissionModal from "@/src/components/BackgroundPermissionModal";

export default function HomeScreen() {
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { places, create, refresh } = usePlaces();

  const {
    visible: permissionPromptVisible,
    placeName: permissionPromptPlaceName,
    maybeShowPrompt,
    handleAccept,
    handleDismiss,
  } = useBackgroundPermissionPrompt();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function handleCreatePlace(name: string, note: string, radius: number) {
    try {
      const currentLocation = await getCurrentLocation();
      const wasFirstPlace = places.length === 0;

      await create({
        name,
        note,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radius,
      });

      setCreateModalVisible(false);
      await maybeShowPrompt(wasFirstPlace, name);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Dine steder</Text>
        <Text style={styles.subtitle}>
          {places.length === 0
            ? "Du har ikke gemt nogen steder endnu"
            : `${places.length} sted${places.length === 1 ? "" : "er"} gemt`}
        </Text>
      </View>

      <BackgroundPermissionModal
        visible={permissionPromptVisible}
        placeName={permissionPromptPlaceName}
        onAccept={handleAccept}
        onDismiss={handleDismiss}
      />

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Gem dit første sted, så du kan blive mindet om det, næste gang du
              er i nærheden.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            onPress={() => {
              router.push({
                pathname: "/places/[id]",
                params: { id: item.id },
              });
            }}
          />
        )}
      />

      <View style={styles.actions}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/map")}
        >
          <Text style={styles.secondaryButtonText}>Åbn kort</Text>
        </Pressable>

        <Pressable
          style={styles.primaryButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.primaryButtonText}>+ Gem nyt sted</Text>
        </Pressable>
      </View>

      <CreatePlaceModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={handleCreatePlace}
      />
    </SafeAreaView>
  );
}

const colors = {
  background: "#F7F7F5",
  surface: "#FFFFFF",
  primary: "#2F6F4F",
  primaryText: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  border: "#E5E5E1",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 12,
    flexGrow: 1,
  },
  emptyState: {
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    textAlign: "center",
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: colors.background,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "600",
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
});
