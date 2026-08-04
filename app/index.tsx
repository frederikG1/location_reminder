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
        "Couldn't save place",
        "Check that location is turned on, then try again.",
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
            title="Reminders are off"
            message="Without background location we can only remind you about your places while the app is open. Tap to turn it on."
            onPress={showPermissionPrompt}
          />
        ) : null}

        {needsNotificationPermission ? (
          <PermissionNotice
            title="Notifications are off"
            message="We still log your visits, but we can't tell you when you're nearby. Tap to open Settings."
            onPress={openNotificationSettings}
            delay={40}
          />
        ) : null}

        {locationError ? (
          <FadeInView delay={80} style={styles.locationError}>
            <Text style={styles.locationErrorText}>
              Can&apos;t find your location right now. Pull down to try again.
            </Text>
          </FadeInView>
        ) : null}

        {places.length > MAX_MONITORED_REGIONS ? (
          <FadeInView delay={80} style={styles.locationError}>
            <Text style={styles.locationErrorText}>
              You have {places.length} places. iOS can only watch{" "}
              {MAX_MONITORED_REGIONS} at a time, so we&apos;re keeping an eye on
              the {MAX_MONITORED_REGIONS} nearest ones.
            </Text>
          </FadeInView>
        ) : null}

        <NearbyPlacesSection nearbyPlaces={nearbyPlaces} />

        <Text style={styles.sectionTitle}>My places</Text>

        {places.length === 0 ? (
          <FadeInView delay={80} style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Save your first place, and we&apos;ll remind you about it the next
              time you&apos;re nearby.
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
          accessibilityLabel="Open map"
        >
          <Text style={styles.secondaryButtonText}>Open map</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.primaryButton}
          onPress={() => setCreateModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Save new place"
        >
          <Text style={styles.primaryButtonText}>+ Save new place</Text>
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

  // Centralised here rather than per section — PlaceCard under "My places"
  // renders directly as a child of the ScrollView and has no outer margin of
  // its own, so without this its border and rounding would run all the way out
  // to the screen edge.
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
