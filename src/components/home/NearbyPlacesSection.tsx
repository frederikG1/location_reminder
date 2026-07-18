import { useLocation } from "@/src/hooks/useLocation";
import { useNearbyPlaces } from "@/src/hooks/useNearbyPlaces";
import { StyleSheet, Text, View } from "react-native";
import FadeInView from "../ui/FadeInView";
import { theme } from "@/src/theme";
import { calculateDistance } from "@/src/services/distance";

export default function NearbyPlacesSection() {
  const nearbyPlaces = useNearbyPlaces();
  const { location } = useLocation();

  function formatDistance(distance: number) {
    if (distance < 1000) {
      return `${Math.round(distance)} m væk`;
    }

    return `${(distance / 1000).toFixed(1)} km væk`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Tæt på dig</Text>

      {nearbyPlaces.length === 0 ? (
        <FadeInView style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Intet i nærheden</Text>

          <Text style={styles.emptyText}>
            Du får besked, når du nærmer dig et gemt sted.
          </Text>
        </FadeInView>
      ) : (
        nearbyPlaces.map((place, index) => {
          const distance = location
            ? calculateDistance(
                location.latitude,
                location.longitude,
                place.latitude,
                place.longitude,
              )
            : 0;

          return (
            <FadeInView key={place.id} delay={index * 50} style={styles.card}>
              <Text style={styles.placeName}>{place.name}</Text>

              {place.note && <Text style={styles.note}>{place.note}</Text>}

              <Text style={styles.distance}>{formatDistance(distance)}</Text>
            </FadeInView>
          );
        })
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
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.card,
  },

  placeName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },

  note: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  distance: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "500",
  },

  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
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
    lineHeight: 20,
  },
});
