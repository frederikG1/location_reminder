import { Text, StyleSheet, Pressable } from "react-native";
import { Place } from "@/src/models/Place";

type Props = {
  place: Place;
  onPress: () => void;
};

export default function PlaceCard({ place, onPress }: Props) {
  const formatDist = (value?: number) =>
    typeof value === "number" ? value.toFixed(5) : "-";
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{place.name}</Text>

      {place.note && (
        <Text style={styles.note}>
          Lille note om stedet:
          {"\n"}
          {place.note}
        </Text>
      )}
      <Text>{"\n"}</Text>

      <Text style={styles.date}>
        {new Date(place.createdAt).toLocaleDateString()}
      </Text>

      <Text>Lat: {formatDist(place.latitude)}</Text>
      <Text>Long:{formatDist(place.longitude)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    backgroundColor: "#f4f4f4",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
  },

  note: {
    marginTop: 8,
    fontSize: 14,
  },

  date: {
    marginTop: 8,
    fontSize: 12,
  },
});
