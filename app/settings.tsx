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

    // Kontakten skal virke med det samme, ikke først næste gang appen starter.
    if (next) {
      await stopAllGeofencing();
    } else {
      await syncGeofences(places);
    }

    invalidateGeofenceSync();
  }

  function handleDeleteEverything() {
    Alert.alert(
      "Slet alle data?",
      `Dine ${places.length} steder og hele besøgshistorikken slettes. Det kan ikke fortrydes.`,
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Slet alt",
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
      "Vis introduktionen igen?",
      "Dine gemte steder bliver ikke rørt.",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Vis igen",
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
      <ScreenHeader title="Indstillinger" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Påmindelser</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Sæt påmindelser på pause</Text>
              <Text style={styles.rowSubtitle}>
                Dine steder bliver gemt, men du får ingen besked når du er i
                nærheden.
              </Text>
            </View>

            <Toggle
              value={paused ?? false}
              onValueChange={handleTogglePause}
              disabled={paused === null}
              accessibilityLabel="Sæt påmindelser på pause"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tilladelser</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Lokation i baggrunden</Text>
              <Text style={styles.rowSubtitle}>
                {hasBackground === null
                  ? "Tjekker …"
                  : hasBackground
                    ? "Slået til"
                    : "Slået fra — påmindelser virker kun mens appen er åben"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Notifikationer</Text>
              <Text style={styles.rowSubtitle}>
                {needsNotifications ? "Slået fra" : "Slået til"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <AnimatedPressable
            style={styles.action}
            onPress={handleOpenSettings}
            accessibilityRole="button"
            accessibilityLabel="Åbn Indstillinger"
          >
            <Text style={styles.actionText}>Åbn Indstillinger</Text>
          </AnimatedPressable>
        </View>

        <Text style={styles.sectionTitle}>Data</Text>

        <View style={styles.card}>
          <AnimatedPressable
            style={styles.action}
            onPress={handleReplayOnboarding}
            accessibilityRole="button"
            accessibilityLabel="Vis introduktionen igen"
          >
            <Text style={styles.actionText}>Vis introduktionen igen</Text>
          </AnimatedPressable>

          <View style={styles.divider} />

          <AnimatedPressable
            style={styles.action}
            onPress={handleDeleteEverything}
            accessibilityRole="button"
            accessibilityLabel="Slet alle data"
          >
            <Text style={[styles.actionText, styles.destructiveText]}>
              Slet alle data
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

  // Ingen padding foroven — headeren sidder uden for ScrollView'en og har
  // allerede sat afstanden, og den første sektionsoverskrift har sin egen
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
