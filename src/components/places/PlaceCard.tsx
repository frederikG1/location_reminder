import { Place } from "@/src/models/Place";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import { theme } from "@/src/theme";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  place: Place;
  onPress: () => void;
};

export default function PlaceCard({ place, onPress }: Props) {
  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {place.name}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{place.radius}m</Text>
        </View>
      </View>

      {place.note ? (
        <Text style={styles.note} numberOfLines={2}>
          {place.note}
        </Text>
      ) : null}

      <Text style={styles.date}>
        Gemt {new Date(place.createdAt).toLocaleDateString("da-DK")}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    ...theme.shadow.card,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  badge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  note: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  date: {
    marginTop: theme.spacing.md,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
