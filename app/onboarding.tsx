import OnboardingSheet, {
  SHEET_OVERHANG,
} from "@/src/components/onboarding/OnboardingSheet";
import PlaceFormFields, {
  RADIUS_DEFAULT,
} from "@/src/components/places/PlaceFormFields";
import { getPlaceEmoji } from "@/src/components/places/PlaceCard";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import { useKeyboardHeight } from "@/src/hooks/useKeyboardHeight";
import { useLocation } from "@/src/hooks/useLocation";
import { usePlaces } from "@/src/hooks/usePlaces";
import { syncGeofences } from "@/src/services/geofencing";
import {
  getCurrentLocation,
  requestBackgroundLocationPermission,
  requestForegroundLocationPermission,
} from "@/src/services/location";
import { requestNotificationPermissions } from "@/src/services/notifications";
import { markOnboardingCompleted } from "@/src/services/onboarding";
import { theme } from "@/src/theme";
import * as Location from "expo-location";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step =
  /** Intro, over a dimmed placeholder — the map is not mounted yet. */
  | "intro"
  /** Live map, "stand somewhere you'll come back to". */
  | "stand"
  /** The save form. */
  | "form"
  /** Pin dropped, ask for the background permission. */
  | "pinned"
  /** Confirmation of what is now being watched. */
  | "armed";

type Coords = { latitude: number; longitude: number };

/** The grabber's own height plus its margins — 5 - 6 + 16. */
const HANDLE_ROW_HEIGHT = 15;

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>("intro");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [radius, setRadius] = useState(RADIUS_DEFAULT);
  const [emoji, setEmoji] = useState("");

  const [pinnedCoords, setPinnedCoords] = useState<Coords | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const { location, startWatching } = useLocation();
  const { places, create } = usePlaces();

  const mapRef = useRef<MapView>(null);
  const hasCenteredRef = useRef(false);
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const { height: windowHeight } = useWindowDimensions();

  // Concrete pixel values rather than percentages. "88%" measures against the
  // whole screen — including while the keyboard covers half of it — so the
  // sheet stayed full-screen tall while being pushed up: that is how the
  // heading ended up in the status bar. Here the keyboard is subtracted first.
  const formAvailableHeight = windowHeight - keyboardHeight;
  const formSheetMaxHeight = Math.round(formAvailableHeight * 0.9);

  // Without a keyboard the bottom padding has to clear the home indicator.
  // With one, that exact same padding would just be dead space on top of the
  // keys.
  const formSheetPaddingBottom =
    keyboardHeight > 0
      ? theme.spacing.lg
      : Math.max(insets.bottom, theme.spacing.xl) + 16;

  // The ScrollView needs its OWN limit, minus everything the sheet itself
  // takes up — otherwise the two together can exceed the sheet's allowed
  // height, and the bottom gets clipped away instead of being scrollable to.
  const formScrollMaxHeight =
    formSheetMaxHeight -
    formSheetPaddingBottom -
    HANDLE_ROW_HEIGHT -
    theme.spacing.xxl;

  const showMap = step !== "intro";
  const ringCenter = pinnedCoords ?? location;

  useEffect(() => {
    if (!location || !showMap || hasCenteredRef.current) {
      return;
    }

    hasCenteredRef.current = true;
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      600,
    );
  }, [location, showMap]);

  useEffect(() => {
    if (!location || address) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [result] = await Location.reverseGeocodeAsync(location);
        const label = [result?.street, result?.streetNumber]
          .filter(Boolean)
          .join(" ");

        if (!cancelled && label) {
          setAddress(label);
        }
      } catch {
        // A missing street name is not worth surfacing — the fallback reads fine.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location, address]);

  async function handleShowMap() {
    setBusy(true);

    try {
      const granted = await requestForegroundLocationPermission();

      if (!granted) {
        setPermissionDenied(true);
        return;
      }

      await startWatching();
      setPermissionDenied(false);
      setStep("stand");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    setBusy(true);

    try {
      const coords = await getCurrentLocation();

      await create({
        name: name.trim(),
        note: note.trim() || undefined,
        emoji: emoji || undefined,
        latitude: coords.latitude,
        longitude: coords.longitude,
        radius,
      });

      setPinnedCoords(coords);
      setStep("pinned");
    } catch {
      Alert.alert(
        "Couldn't save place",
        "Check that location is turned on, then try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleEnableReminders() {
    setBusy(true);

    try {
      const granted = await requestBackgroundLocationPermission();

      if (granted) {
        await requestNotificationPermissions();
        // Arm it now, so "Watching 1 place" is true the moment it is shown.
        await syncGeofences(places);
      }

      setIsWatching(granted);
    } catch {
      setIsWatching(false);
    } finally {
      setBusy(false);
      setStep("armed");
    }
  }

  function handleSkipReminders() {
    setIsWatching(false);
    setStep("armed");
  }

  async function handleFinish() {
    await markOnboardingCompleted();
    router.replace("/");
  }

  const placeName = name.trim() || "your place";
  const displayEmoji = emoji || getPlaceEmoji(name);
  const locationLabel = address ? `${address} — you` : "You are here";

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {showMap ? (
        <MapView ref={mapRef} style={StyleSheet.absoluteFill} showsUserLocation>
          {ringCenter ? (
            <Circle
              center={ringCenter}
              radius={step === "stand" ? 40 : radius}
              strokeColor={theme.colors.primary}
              fillColor={theme.colors.ringFill}
              strokeWidth={2}
            />
          ) : null}

          {pinnedCoords ? (
            <Marker
              coordinate={pinnedCoords}
              title={placeName}
              description={note}
            >
              <View style={styles.pin}>
                <Text style={styles.pinEmoji}>{displayEmoji}</Text>
              </View>
            </Marker>
          ) : null}
        </MapView>
      ) : (
        <View style={styles.placeholder}>
          <View style={styles.placeholderRing} />
        </View>
      )}

      {showMap ? (
        <View style={[styles.locationPill, { top: insets.top + 12 }]}>
          <View style={styles.locationDot} />
          <Text style={styles.locationLabel} numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>
      ) : null}

      {step === "intro" ? (
        <OnboardingSheet key="intro">
          <View style={styles.kickerPill}>
            <View style={styles.kickerDot} />
            <Text style={styles.kickerText}>Three steps, then never again</Text>
          </View>

          <Text style={styles.title}>Your phone always knows where you are.</Text>

          <Text style={styles.body}>
            {permissionDenied
              ? "Without access to your location, the app can neither save places nor remind you about them. You can allow it now — or later under Settings."
              : "Let it use that for something kind: a tap on the shoulder when you're close to the place that looked so interesting"}
          </Text>

          <PrimaryButton
            label={permissionDenied ? "Try again" : "Show me the map"}
            onPress={handleShowMap}
            busy={busy}
          />
        </OnboardingSheet>
      ) : null}

      {step === "stand" ? (
        <OnboardingSheet key="stand">
          <Text style={styles.titleSm}>Tap the save button below to continue.</Text>

          <Text style={styles.body}>
            One tap saves it. The name, the distance and the reminder come
            afterwards.
          </Text>

          <PrimaryButton
            label="Save this place"
            onPress={() => setStep("form")}
          />
        </OnboardingSheet>
      ) : null}

      {step === "form" ? (
        /*
          No KeyboardAvoidingView: the sheet is absolutely positioned, and its
          padding behaviour and `bottom: 0` pulled in opposite directions — it
          made the sheet taller instead of giving it less room. Here the sheet
          is placed directly on top of the keyboard with `bottom` instead, and
          the heights are calculated against the space that is actually left.
        */
        <OnboardingSheet
          key="form"
          handle
          style={{
            bottom: keyboardHeight,
            // The overhang is added on top of the limit, so the VISIBLE height
            // is still formSheetMaxHeight.
            maxHeight: formSheetMaxHeight + SHEET_OVERHANG,
            paddingBottom: formSheetPaddingBottom + SHEET_OVERHANG,
          }}
        >
          <ScrollView
            style={{ maxHeight: formScrollMaxHeight }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>What&apos;s here?</Text>

            <View style={styles.formFields}>
              <PlaceFormFields
                name={name}
                note={note}
                radius={radius}
                emoji={emoji}
                onChangeName={setName}
                onChangeNote={setNote}
                onChangeRadius={setRadius}
                onChangeEmoji={setEmoji}
                onSave={handleSave}
                showSuggestions
              />
            </View>
          </ScrollView>
        </OnboardingSheet>
      ) : null}

      {step === "pinned" ? (
        <OnboardingSheet key="pinned">
          <View style={styles.pinnedHeader}>
            <View style={styles.pinnedAvatar}>
              <Text style={styles.pinnedAvatarText}>{displayEmoji}</Text>
            </View>
            <Text style={styles.heading}>{placeName} is saved.</Text>
          </View>

          <Text style={styles.body}>
            That was step one and two. Step three is the whole reason
            you&apos;re here: a nudge within {radius} m — even with the app
            closed and the phone in your pocket.
          </Text>

          <PrimaryButton
            label="Set up the reminder"
            onPress={handleEnableReminders}
            busy={busy}
          />

          <AnimatedPressable
            style={styles.skipButton}
            onPress={handleSkipReminders}
            accessibilityRole="button"
            accessibilityLabel="Only when the app is open"
          >
            <Text style={styles.skipButtonText}>Only when the app is open</Text>
          </AnimatedPressable>
        </OnboardingSheet>
      ) : null}

      {step === "armed" ? (
        <OnboardingSheet key="armed">
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kickerText}>
              {isWatching ? "Watching 1 place" : "Saved, but not active"}
            </Text>
          </View>

          <Text style={styles.titleSm}>
            {isWatching ? "Now close the app.\nSeriously." : "You're all set."}
          </Text>

          <Text style={styles.body}>
            {isWatching
              ? `${note.trim() || "The reminder"} at ${placeName}, ${radius} m. You'll hear from me when it matters.`
              : `${placeName} is saved, but without background location the app can only remind you while it's open. You can turn it on under Settings whenever you like.`}
          </Text>

          <PrimaryButton label="Done" onPress={handleFinish} dark />
        </OnboardingSheet>
      ) : null}
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  busy,
  dark,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  dark?: boolean;
}) {
  return (
    <AnimatedPressable
      style={[styles.primaryButton, dark && styles.primaryButtonDark]}
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: busy, busy }}
    >
      {busy ? (
        <ActivityIndicator
          color={dark ? theme.colors.surface : theme.colors.primaryText}
        />
      ) : (
        <Text
          style={[
            styles.primaryButtonText,
            dark && styles.primaryButtonTextDark,
          ]}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginTop: -120,
    backgroundColor: theme.colors.primaryFill,
    borderWidth: 2,
    borderColor: theme.colors.primaryMuted,
  },

  pin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.card,
  },

  pinEmoji: {
    fontSize: 17,
  },

  locationPill: {
    position: "absolute",
    left: theme.spacing.xl,
    maxWidth: "70%",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingVertical: 7,
    paddingLeft: 10,
    paddingRight: 13,
    ...theme.shadow.card,
  },

  locationDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: theme.colors.locationDot,
  },

  locationLabel: {
    ...theme.typography.captionStrong,
    color: theme.colors.textPrimary,
  },

  kickerPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    marginBottom: theme.spacing.lg,
  },

  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },

  kickerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },

  kickerText: {
    ...theme.typography.kicker,
    color: theme.colors.primary,
  },

  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },

  titleSm: {
    ...theme.typography.titleSm,
    color: theme.colors.textPrimary,
  },

  heading: {
    ...theme.typography.heading,
    flex: 1,
    color: theme.colors.textPrimary,
  },

  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
  },

  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 10,
    maxWidth: 320,
  },

  formFields: {
    marginTop: theme.spacing.md,
  },

  pinnedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  pinnedAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  pinnedAvatarText: {
    fontSize: 17,
  },

  primaryButton: {
    marginTop: theme.spacing.xxl,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radius.button,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    alignItems: "center",
    ...theme.shadow.primaryButton,
  },

  primaryButtonDark: {
    backgroundColor: theme.colors.textPrimary,
    shadowOpacity: 0,
    elevation: 2,
  },

  primaryButtonText: {
    fontSize: 17,
    fontFamily: theme.fonts.black,
    color: theme.colors.primaryText,
  },

  // The dark variant swaps the fill to ink — primaryText is ink too now, so
  // it needs its own light text or it disappears against its own background.
  primaryButtonTextDark: {
    color: theme.colors.surface,
  },

  skipButton: {
    paddingTop: theme.spacing.lg,
    alignItems: "center",
  },

  skipButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
