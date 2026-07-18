import { useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import PlaceCard from "@/src/components/places/PlaceCard";
import CreatePlaceModal from "@/src/components/places/PlaceFormModal";
import FadeInView from "@/src/components/ui/FadeInView";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import { usePlaces } from "@/src/hooks/usePlaces";
import { getCurrentLocation } from "@/src/services/location";
import { router } from "expo-router";
import { useBackgroundPermissionPrompt } from "@/src/hooks/useBackgroundPermissionPrompt";
import BackgroundPermissionModal from "@/src/components/BackgroundPermissionModal";
import { theme } from "@/src/theme";
import HomeHeader from "@/src/components/home/HomeHeader";
import NearbyPlacesSection from "@/src/components/home/NearbyPlacesSection";
import { useLocation } from "@/src/hooks/useLocation";

export default function HomeScreen() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const { places, create } = usePlaces();
  const { refreshLocation } = useLocation();

  const [refreshing, setRefreshing] = useState(false);

  const {
    visible: permissionPromptVisible,
    placeName: permissionPromptPlaceName,
    maybeShowPrompt,
    handleAccept,
    handleDismiss,
  } = useBackgroundPermissionPrompt();


  async function handleRefresh() {
    setRefreshing(true);

    try {
      await refreshLocation();
    } finally {
      setRefreshing(false)
    }

  }

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
    } catch {
      Alert.alert(
        "Kunne ikke gemme sted",
        "Tjek at lokation er slået til, og prøv igen.",
      );
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <HomeHeader placeCount={places.length} />

      <BackgroundPermissionModal
        visible={permissionPromptVisible}
        placeName={permissionPromptPlaceName}
        onAccept={handleAccept}
        onDismiss={handleDismiss}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh} 
          />
        }
      >
        <NearbyPlacesSection />

        <Text style={styles.sectionTitle}>
          Mine steder
        </Text>

        {places.length === 0 ? (
          <FadeInView
            delay={80}
            style={styles.emptyState}
          >
            <Text style={styles.emptyStateText}>
              Gem dit første sted, så du kan blive mindet om det,
              næste gang du er i nærheden.
            </Text>
          </FadeInView>
        ) : (
          places.map((item, index) => (
            <FadeInView
              key={item.id}
              delay={index * 50}
            >
              <PlaceCard
                place={item}
                onPress={() => {
                  router.push({
                    pathname: "/places/[id]",
                    params: { id: item.id },
                  });
                }}
              />
            </FadeInView>
          ))
        )}
      </ScrollView>

      <View
        style={[
          styles.actions,
          {
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <AnimatedPressable
          style={styles.secondaryButton}
          onPress={() => router.push("/map")}
        >
          <Text style={styles.secondaryButtonText}>
            Åbn kort
          </Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.primaryButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.primaryButtonText}>
            + Gem nu sted
          </Text>
        </AnimatedPressable>
      </View>

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
    backgroundColor: theme.colors.background,
  },

  scrollContent: {
    paddingBottom: 140,
  },

  sectionTitle: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },

  emptyState: {
    marginTop: 40,
    paddingHorizontal: theme.spacing.xl,
  },

  emptyStateText: {
    textAlign: "center",
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
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
    backgroundColor: theme.colors.background,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: theme.radius.md,
    alignItems: "center",
    ...theme.shadow.card,
  },

  primaryButtonText: {
    color: theme.colors.primaryText,
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 15,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});