import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/src/theme";
import { formatDistance } from "@/src/util/formatDistance";
import type { NearbyPlace } from "@/src/hooks/useNearbyPlaces";
import FadeInView from "../ui/FadeInView";
import { router } from "expo-router";
import AnimatedPressable from "../ui/AnimatedPressable";

type Props = {
  nearbyPlaces: NearbyPlace[];
};

export default function NearbyPlacesSection({ nearbyPlaces }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>I nærheden</Text>

      {nearbyPlaces.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Intet i nærheden</Text>

          <Text style={styles.emptyText}>
            Du får besked, når du nærmer dig et gemt sted.
          </Text>
        </View>
      ) : (
        nearbyPlaces.map(({ place, status, distance }, index) => (
          <FadeInView key={place.id} delay={index * 70}>
            <AnimatedPressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/places/[id]",
                  params: {
                    id: place.id,
                  },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`${place.name}, ${formatDistance(distance)} væk, ${status.label}${place.note ? `. ${place.note}` : ""}`}
            >
              <View style={styles.topRow}>
                <Text style={styles.placeName}>{place.name}</Text>

                {/* Afstanden er mere brugbar end nærhedsgraden på skærmen;
                    selve statusordet lever videre i accessibilityLabel. */}
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    {formatDistance(distance)}
                  </Text>
                </View>
              </View>
              {place.note && <Text style={styles.note}>{place.note}</Text>}
            </AnimatedPressable>
          </FadeInView>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Ingen paddingHorizontal her — den horisontale indrykning kommer nu fra
  // app/index.tsx's scrollContent, så "I nærheden" og "Mine steder" flugter.
  container: {
    marginTop: theme.spacing.md,
  },

  title: {
    fontSize: 18,
    fontFamily: theme.fonts.black,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.card,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },

  placeName: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fonts.extrabold,
    color: theme.colors.textPrimary,
  },
  note: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
  },

  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.extrabold,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },

  emptyText: {
    marginTop: theme.spacing.xs,
    fontSize: 14,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  distanceBadge: {
    backgroundColor: theme.colors.primary,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  distanceText: {
    fontSize: 13,
    fontFamily: theme.fonts.black,
    color: theme.colors.textPrimary,
  },
});
