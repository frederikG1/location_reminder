import { Place } from "@/src/models/Place";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import { theme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/da";

dayjs.extend(relativeTime);
dayjs.locale("da");

type Props = {
  place: Place;
  onPress: () => void;
};

export function getPlaceEmoji(name: string) {
  const lower = name.toLowerCase();

  if (
    lower.includes("netto") ||
    lower.includes("føtex") ||
    lower.includes("super") ||
    lower.includes("butik")
  ) {
    return "🛒";
  }

  if (
    lower.includes("kaffe") ||
    lower.includes("cafe") ||
    lower.includes("coffee")
  ) {
    return "☕";
  }

  if (
    lower.includes("gym") ||
    lower.includes("fitness") ||
    lower.includes("træning")
  ) {
    return "🏋️";
  }

  if (
    lower.includes("hjem") ||
    lower.includes("home") ||
    lower.includes("mor") ||
    lower.includes("far")
  ) {
    return "🏠";
  }

  return "📍";
}

export default function PlaceCard({ place, onPress }: Props) {
  return (
    <AnimatedPressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={place.note ? `${place.name}. ${place.note}` : place.name}
    >
      <View style={styles.mainRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            {place.emoji || getPlaceEmoji(place.name)}
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {place.name}
          </Text>

          {place.note ? (
            <Text style={styles.note} numberOfLines={2}>
              {place.note}
            </Text>
          ) : null}
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>
          {place.createdAt ? dayjs(place.createdAt).fromNow() : ""}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    ...theme.shadow.card,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },

  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 22,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontFamily: theme.fonts.extrabold,
    color: theme.colors.textPrimary,
  },

  note: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.textSecondary,
  },

  footer: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: {
    fontSize: 12,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textSecondary,
  },
});
