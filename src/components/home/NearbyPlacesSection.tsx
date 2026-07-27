import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/src/theme";
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
        nearbyPlaces.map(({ place, status }, index) => (
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
            >
              <View style={styles.topRow}>
                <Text style={styles.placeName}>{place.name}</Text>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: status.color,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{status.label}</Text>
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
  container: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
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
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  note: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: 14,
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
    fontWeight: "600",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },

  emptyText: {
    marginTop: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: theme.spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
