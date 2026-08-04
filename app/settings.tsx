import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import ScreenHeader from "@/src/components/ui/ScreenHeader";
import Toggle from "@/src/components/ui/Toggle";
import { useNotificationPermission } from "@/src/hooks/useNotificationPermission";
import { invalidateGeofenceSync, usePlaces } from "@/src/hooks/usePlaces";
import { stopAllGeofencing, syncGeofences } from "@/src/services/geofencing";
import { hasBackgroundLocationPermission } from "@/src/services/location";
import { resetOnboarding } from "@/src/services/onboarding";
import { clearAllPlaces } from "@/src/services/placeRepository";
import {
  areRemindersPaused,
  setRemindersPaused,
} from "@/src/services/reminderSettings";
import { clearAllVisits } from "@/src/services/visitRepository";
import { theme } from "@/src/theme";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { places, refresh } = usePlaces();
  const [paused, setPaused] = useState<boolean | null>(null);
  const [hasBackground, setHasBackground] = useState<boolean | null>(null);

  const { needsPermission: needsNotifications, refresh: refreshNotifications } =
    useNotificationPermission();

  useEffect(() => {
    (async () => {
      setPaused(await areRemindersPaused());
      setHasBackground(await hasBackgroundLocationPermission());
    })();
  }, []);

  async function handleTogglePause(next: boolean) {
    setPaused(next);
    await setRemindersPaused(next);

    // The switch has to take effect right away, not on the next app launch.
    if (next) {
      await stopAllGeofencing();
    } else {
      await syncGeofences(places);
    }

    invalidateGeofenceSync();
  }

  function handleDeleteEverything() {
    Alert.alert(
      "Delete all data?",
      `Your ${places.length} places and your entire visit history will be deleted. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete everything",
          style: "destructive",
          onPress: async () => {
            await stopAllGeofencing();
            await clearAllPlaces();
            await clearAllVisits();
            invalidateGeofenceSync();
            await refresh();
            router.replace("/");
          },
        },
      ],
    );
  }

  function handleReplayOnboarding() {
    Alert.alert(
      "Show the intro again?",
      "Your saved places won't be touched.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Show again",
          onPress: async () => {
            await resetOnboarding();
            router.replace("/onboarding");
          },
        },
      ],
    );
  }

  async function handleOpenSettings() {
    await Linking.openSettings();
    refreshNotifications();
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader title="Settings" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Reminders</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Pause reminders</Text>
              <Text style={styles.rowSubtitle}>
                Your places stay saved, but you won&apos;t hear anything when
                you&apos;re nearby.
              </Text>
            </View>

            <Toggle
              value={paused ?? false}
              onValueChange={handleTogglePause}
              disabled={paused === null}
              accessibilityLabel="Pause reminders"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Permissions</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Background location</Text>
              <Text style={styles.rowSubtitle}>
                {hasBackground === null
                  ? "Checking …"
                  : hasBackground
                    ? "On"
                    : "Off — reminders only work while the app is open"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Notifications</Text>
              <Text style={styles.rowSubtitle}>
                {needsNotifications ? "Off" : "On"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <AnimatedPressable
            style={styles.action}
            onPress={handleOpenSettings}
            accessibilityRole="button"
            accessibilityLabel="Open Settings"
          >
            <Text style={styles.actionText}>Open Settings</Text>
          </AnimatedPressable>
        </View>

        <Text style={styles.sectionTitle}>Data</Text>

        <View style={styles.card}>
          <AnimatedPressable
            style={styles.action}
            onPress={handleReplayOnboarding}
            accessibilityRole="button"
            accessibilityLabel="Show the intro again"
          >
            <Text style={styles.actionText}>Show the intro again</Text>
          </AnimatedPressable>

          <View style={styles.divider} />

          <AnimatedPressable
            style={styles.action}
            onPress={handleDeleteEverything}
            accessibilityRole="button"
            accessibilityLabel="Delete all data"
          >
            <Text style={[styles.actionText, styles.destructiveText]}>
              Delete all data
            </Text>
          </AnimatedPressable>
        </View>

        <Text style={styles.version}>
          Version {Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // No padding at the top — the header sits outside the ScrollView and has
  // already set the spacing, and the first section title carries its own
  // marginTop.
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 60,
  },

  sectionTitle: {
    ...theme.typography.kicker,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },

  rowText: {
    flex: 1,
  },

  rowTitle: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },

  rowSubtitle: {
    marginTop: theme.spacing.xs,
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  divider: {
    height: theme.borderWidth,
    backgroundColor: theme.colors.border,
  },

  action: {
    padding: theme.spacing.lg,
  },

  actionText: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },

  destructiveText: {
    fontFamily: theme.fonts.black,
    color: theme.colors.primaryStrong,
  },

  version: {
    marginTop: theme.spacing.xl,
    textAlign: "center",
    ...theme.typography.captionStrong,
    color: theme.colors.textSecondary,
  },
});
