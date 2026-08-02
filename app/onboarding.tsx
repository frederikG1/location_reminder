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

/** Grebets egen højde plus dets marginer — 5 - 6 + 16. */
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

  // Konkrete pixeltal frem for procent. "88%" måler mod hele skærmen — også
  // mens tastaturet dækker halvdelen — så arket blev ved med at være
  // fuldskærmshøjt, mens det blev skubbet op: det er derfor overskriften endte
  // oppe i statuslinjen. Her trækkes tastaturet fra først.
  const formAvailableHeight = windowHeight - keyboardHeight;
  const formSheetMaxHeight = Math.round(formAvailableHeight * 0.9);

  // Uden tastatur skal bundpolstringen rydde home-indikatoren. Med tastatur
  // ville præcis samme polstring bare være dødt rum oven på tasterne.
  const formSheetPaddingBottom =
    keyboardHeight > 0
      ? theme.spacing.lg
      : Math.max(insets.bottom, theme.spacing.xl) + 16;

  // ScrollView'en skal have sin EGEN grænse, fratrukket alt det arket selv
  // fylder — ellers kan de tilsammen blive højere end arket må være, og bunden
  // bliver klippet væk i stedet for at kunne scrolles til.
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
        "Kunne ikke gemme sted",
        "Tjek at lokation er slået til, og prøv igen.",
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
        // Arm it now, so "Holder øje med 1 sted" is true the moment it is shown.
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

  const placeName = name.trim() || "dit sted";
  const displayEmoji = emoji || getPlaceEmoji(name);
  const locationLabel = address ? `${address} — dig` : "Her er du";

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
            <Text style={styles.kickerText}>Tre trin, så aldrig mere</Text>
          </View>

          <Text style={styles.title}>Din telefon ved altid hvor du er.</Text>

          <Text style={styles.body}>
            {permissionDenied
              ? "Uden adgang til din lokation kan appen hverken gemme steder eller minde dig om dem. Du kan give adgang nu — eller senere under Indstillinger."
              : "Lad den bruge det til noget venligt: et prik på skulderen, når du er tæt på det sted, som du synes så interessant ud"}
          </Text>

          <PrimaryButton
            label={permissionDenied ? "Prøv igen" : "Vis mig kortet"}
            onPress={handleShowMap}
            busy={busy}
          />
        </OnboardingSheet>
      ) : null}

      {step === "stand" ? (
        <OnboardingSheet key="stand">
          <Text style={styles.titleSm}>Tryk på gem-knappen nedenunder for at fortsætte.</Text>

          <Text style={styles.body}>
            Ét tryk gemmer det. Navnet, afstanden og påmindelsen kommer
            bagefter.
          </Text>

          <PrimaryButton
            label="Gem dette sted"
            onPress={() => setStep("form")}
          />
        </OnboardingSheet>
      ) : null}

      {step === "form" ? (
        /*
          Ingen KeyboardAvoidingView: arket er absolut placeret, og dens
          padding-adfærd og `bottom: 0` trak i hver sin retning — den gjorde
          arket højere frem for at give det mindre plads. Her lægges arket i
          stedet direkte oven på tastaturet med `bottom`, og højderne er regnet
          ud mod den plads der reelt er tilbage.
        */
        <OnboardingSheet
          key="form"
          handle
          style={{
            bottom: keyboardHeight,
            // Overhænget lægges oven i grænsen, så den SYNLIGE højde stadig er
            // formSheetMaxHeight.
            maxHeight: formSheetMaxHeight + SHEET_OVERHANG,
            paddingBottom: formSheetPaddingBottom + SHEET_OVERHANG,
          }}
        >
          <ScrollView
            style={{ maxHeight: formScrollMaxHeight }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Hvad er her?</Text>

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
            <Text style={styles.heading}>{placeName} er gemt.</Text>
          </View>

          <Text style={styles.body}>
            Det var trin ét og to. Trin tre er hele grunden til at du er her: et
            prik indenfor {radius} m — også med appen lukket og telefonen i
            lommen.
          </Text>

          <PrimaryButton
            label="Sæt påmindelsen op"
            onPress={handleEnableReminders}
            busy={busy}
          />

          <AnimatedPressable
            style={styles.skipButton}
            onPress={handleSkipReminders}
            accessibilityRole="button"
            accessibilityLabel="Kun når appen er åben"
          >
            <Text style={styles.skipButtonText}>Kun når appen er åben</Text>
          </AnimatedPressable>
        </OnboardingSheet>
      ) : null}

      {step === "armed" ? (
        <OnboardingSheet key="armed">
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kickerText}>
              {isWatching ? "Holder øje med 1 sted" : "Gemt, men ikke aktivt"}
            </Text>
          </View>

          <Text style={styles.titleSm}>
            {isWatching ? "Luk så appen.\nHelt seriøst." : "Så er du i gang."}
          </Text>

          <Text style={styles.body}>
            {isWatching
              ? `${note.trim() || "Påmindelsen"} ved ${placeName}, ${radius} m. Du hører fra mig, når det er relevant.`
              : `${placeName} er gemt, men uden lokation i baggrunden kan appen kun minde dig om det, mens den er åben. Du kan slå det til under Indstillinger, når du vil.`}
          </Text>

          <PrimaryButton label="Færdig" onPress={handleFinish} dark />
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
