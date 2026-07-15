import { Place } from "@/src/models/Place";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  place: Place;
  onPress: () => void;
};

export default function PlaceCard({ place, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
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
    </Pressable>
  );
}

const colors = {
  surface: "#FFFFFF",
  border: "#E5E5E1",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textMuted: "#9B9B95",
  badgeBg: "#E8F1EC",
  badgeText: "#1D6B4B",
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
  },
  cardPressed: {
    backgroundColor: "#FAFAF8",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.badgeBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.badgeText,
  },
  note: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  date: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textMuted,
  },
});