import { Place } from "@/src/models/Place";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import FadeInView from "@/src/components/ui/FadeInView";
import { theme } from "@/src/theme";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

type Props = {
  places: Place[];
};

export default function NearbyPlacesList({ places }: Props) {
  if (places.length === 0) {
    return null;
  }

  return (
    <FadeInView style={styles.container}>
      <Text style={styles.heading}>I nærheden nu</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {places.map((place, index) => (
          <FadeInView key={place.id} delay={index * 60}>
            <AnimatedPressable
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/places/[id]",
                  params: { id: place.id },
                })
              }
            >
              <Text style={styles.name} numberOfLines={1}>
                {place.name}
              </Text>
              {place.note ? (
                <Text style={styles.note} numberOfLines={1}>
                  {place.note}
                </Text>
              ) : null}
            </AnimatedPressable>
          </FadeInView>
        ))}
      </ScrollView>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 96,
    left: 0,
    right: 0,
    gap: theme.spacing.sm,
  },
  heading: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    letterSpacing: 0.4,
    marginLeft: theme.spacing.lg,
    textTransform: "uppercase",
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: 10,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 140,
    maxWidth: 220,
    ...theme.shadow.card,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  note: {
    marginTop: 2,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
