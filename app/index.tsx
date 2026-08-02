import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
import { MAX_MONITORED_REGIONS } from "@/src/services/geofencing";
import { Redirect, router } from "expo-router";
import { useBackgroundPermissionPrompt } from "@/src/hooks/useBackgroundPermissionPrompt";
import BackgroundPermissionModal from "@/src/components/BackgroundPermissionModal";
import { theme } from "@/src/theme";
import HomeHeader from "@/src/components/home/HomeHeader";
import NearbyPlacesSection from "@/src/components/home/NearbyPlacesSection";
import PermissionNotice from "@/src/components/home/PermissionNotice";
import { useLocation } from "@/src/hooks/useLocation";
import { useNearbyPlaces } from "@/src/hooks/useNearbyPlaces";
import { useNotificationPermission } from "@/src/hooks/useNotificationPermission";
import { useOnboardingStatus } from "@/src/hooks/useOnboardingStatus";

export default function HomeScreen() {
  const onboardingStatus = useOnboardingStatus();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const { places, create, refresh } = usePlaces();
  const { refreshLocation, error: locationError } = useLocation();
  const nearbyPlaces = useNearbyPlaces();

  const [refreshing, setRefreshing] = useState(false);

  const {
    needsPermission,
    visible: permissionPromptVisible,
    show: showPermissionPrompt,
    handleAccept,
    handleDismiss,
  } = useBackgroundPermissionPrompt();

  const {
    needsPermission: needsNotificationPermission,
    openSettings: openNotificationSettings,
  } = useNotificationPermission();

  if (onboardingStatus === "loading") {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (onboardingStatus === "pending") {
    return <Redirect href="/onboarding" />;
  }

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await Promise.all([refreshLocation(), refresh()]);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreatePlace(
    name: string,
    note: string,
    radius: number,
    emoji: string,
  ) {
    try {
      const currentLocation = await getCurrentLocation();

      await create({
        name,
        note,
        emoji: emoji || undefined,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radius,
      });

      setCreateModalVisible(false);
    } catch {
      Alert.alert(
        "Kunne ikke gemme sted",
        "Tjek at lokation er slået til, og prøv igen.",
      );
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <HomeHeader
        nearbyPlacesCount={nearbyPlaces.length}
        nearestPlaceName={nearbyPlaces[0]?.place.name}
        onOpenSettings={() => router.push("/settings")}
      />

      <BackgroundPermissionModal
        visible={permissionPromptVisible}
        onAccept={handleAccept}
        onDismiss={handleDismiss}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {needsPermission ? (
          <PermissionNotice
            title="Påmindelser er slået fra"
            message="Uden lokation i baggrunden kan vi kun minde dig om dine steder, mens appen er åben. Tryk for at slå det til."
            onPress={showPermissionPrompt}
          />
        ) : null}

        {needsNotificationPermission ? (
          <PermissionNotice
            title="Notifikationer er slået fra"
            message="Vi registrerer dine besøg, men kan ikke sige til når du er i nærheden. Tryk for at åbne Indstillinger."
            onPress={openNotificationSettings}
            delay={40}
          />
        ) : null}

        {locationError ? (
          <FadeInView delay={80} style={styles.locationError}>
            <Text style={styles.locationErrorText}>
              Kan ikke finde din position lige nu. Træk ned for at prøve igen.
            </Text>
          </FadeInView>
        ) : null}

        {places.length > MAX_MONITORED_REGIONS ? (
          <FadeInView delay={80} style={styles.locationError}>
            <Text style={styles.locationErrorText}>
              Du har {places.length} steder. iOS kan kun overvåge{" "}
              {MAX_MONITORED_REGIONS} ad gangen, så vi holder øje med de{" "}
              {MAX_MONITORED_REGIONS} nærmeste.
            </Text>
          </FadeInView>
        ) : null}

        <NearbyPlacesSection nearbyPlaces={nearbyPlaces} />

        <Text style={styles.sectionTitle}>Mine steder</Text>

        {places.length === 0 ? (
          <FadeInView delay={80} style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Gem dit første sted, så du kan blive mindet om det, næste gang du
              er i nærheden.
            </Text>
          </FadeInView>
        ) : (
          places.map((item, index) => (
            <FadeInView key={item.id} delay={index * 50}>
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
          accessibilityRole="button"
          accessibilityLabel="Åbn kort"
        >
          <Text style={styles.secondaryButtonText}>Åbn kort</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.primaryButton}
          onPress={() => setCreateModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Gem nyt sted"
        >
          <Text style={styles.primaryButtonText}>+ Gem nyt sted</Text>
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

  // Centraliseret her i stedet for per sektion — PlaceCard i "Mine steder"
  // rendere direkte som barn af ScrollView'en og har selv ingen ydre margin,
  // så uden denne ville dens kant og runding gå helt ud til skærmkanten.
  scrollContent: {
    paddingBottom: 140,
    paddingHorizontal: theme.spacing.xl,
  },

  centered: {
    alignItems: "center",
    justifyContent: "center",
  },

  locationError: {
    marginTop: theme.spacing.md,
  },

  locationErrorText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.textSecondary,
  },

  sectionTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontSize: 18,
    fontFamily: theme.fonts.black,
    color: theme.colors.textPrimary,
  },

  emptyState: {
    marginTop: 40,
  },

  emptyStateText: {
    ...theme.typography.body,
    textAlign: "center",
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
    backgroundColor: theme.colors.background,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: theme.radius.button,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    alignItems: "center",
    ...theme.shadow.card,
  },

  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.primaryText,
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
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
});
