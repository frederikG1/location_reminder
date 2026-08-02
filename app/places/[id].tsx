import { getPlaceEmoji } from "@/src/components/places/PlaceCard";
import CreatePlaceModal from "@/src/components/places/PlaceFormModal";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import FadeInView from "@/src/components/ui/FadeInView";
import { useVisits } from "@/src/hooks/useVisits";
import { usePlaces } from "@/src/hooks/usePlaces";
import { openDirections } from "@/src/services/directions";
import { theme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/da";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Circle, Marker } from "react-native-maps";

dayjs.extend(relativeTime);
dayjs.locale("da");

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { places, remove, update } = usePlaces();
  const { visits } = useVisits(id);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const place = places.find((item) => item.id === id);

  if (!place) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Sted ikke fundet</Text>
      </SafeAreaView>
    );
  }

  const recentVisits = visits.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 84 },
        ]}
      >
        <FadeInView style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>
              {place.emoji || getPlaceEmoji(place.name)}
            </Text>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>{place.name}</Text>
            {place.note ? <Text style={styles.note}>{place.note}</Text> : null}
          </View>
        </FadeInView>

        <FadeInView delay={60} style={styles.mapCard}>
          <MapView
            style={styles.map}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            initialRegion={{
              latitude: place.latitude,
              longitude: place.longitude,
              latitudeDelta: Math.max(place.radius / 40000, 0.01),
              longitudeDelta: Math.max(place.radius / 40000, 0.01),
            }}
          >
            <Marker
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              pinColor={theme.colors.primary}
            />
            <Circle
              center={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              radius={place.radius}
              strokeColor={theme.colors.primary}
              fillColor={theme.colors.primaryFill}
              strokeWidth={1}
            />
          </MapView>
        </FadeInView>

        <FadeInView delay={100}>
          <AnimatedPressable
            style={styles.routeButton}
            onPress={() =>
              openDirections({
                latitude: place.latitude,
                longitude: place.longitude,
              })
            }
          >
            <Ionicons
              name="navigate-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.routeButtonText}>Vis rute</Text>
          </AnimatedPressable>
        </FadeInView>

        <FadeInView delay={130} style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Oprettet</Text>
            <Text style={styles.statValue}>
              {place.createdAt ? dayjs(place.createdAt).fromNow() : "—"}
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={140} style={styles.historySection}>
          <Text style={styles.sectionTitle}>
            {visits.length === 0
              ? "Ingen påmindelser endnu"
              : `Mindet om dette sted ${visits.length} ${visits.length === 1 ? "gang" : "gange"}`}
          </Text>

          {visits.length === 0 ? (
            <Text style={styles.historyEmpty}>
              Næste gang du er i nærheden, dukker det op her.
            </Text>
          ) : (
            <View style={styles.historyList}>
              {recentVisits.map((visit) => (
                <View key={visit.id} style={styles.historyRow}>
                  <View style={styles.historyDot} />
                  <Text style={styles.historyText}>
                    {dayjs(visit.timestamp).fromNow()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </FadeInView>
      </ScrollView>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <AnimatedPressable
          style={styles.secondaryButton}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.secondaryButtonText}>Rediger</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.destructiveButton}
          onPress={() => handleDelete(place.id)}
        >
          <Text style={styles.destructiveButtonText}>Slet sted</Text>
        </AnimatedPressable>
      </View>

      <CreatePlaceModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        initialName={place.name}
        initialNote={place.note}
        initialRadius={place.radius}
        initialEmoji={place.emoji}
        onSave={(name, note, radius, emoji) =>
          handleUpdatePlace(
            id,
            name,
            note,
            place.latitude,
            place.longitude,
            radius,
            emoji,
            place.createdAt,
          )
        }
      />
    </SafeAreaView>
  );

  function handleDelete(placeId: string) {
    Alert.alert("Slet sted", "Er du sikker på, at du vil slette dette sted?", [
      { text: "Annuller", style: "cancel" },
      {
        text: "Slet",
        style: "destructive",
        onPress: async () => {
          await remove(placeId);
          router.back();
        },
      },
    ]);
  }

  async function handleUpdatePlace(
    id: string,
    name: string,
    note: string,
    latitude: number,
    longitude: number,
    radius: number,
    emoji: string,
    createdAt: string,
  ) {
    try {
      await update({
        name,
        note,
        emoji: emoji || undefined,
        id,
        latitude,
        longitude,
        radius,
        createdAt,
      });
      setEditModalVisible(false);
    } catch {
      Alert.alert("Kunne ikke gemme", "Prøv igen om lidt.");
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 26,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  note: {
    ...theme.typography.body,
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  notFound: {
    padding: theme.spacing.xl,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  mapCard: {
    marginTop: theme.spacing.xl,
    height: 180,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    overflow: "hidden",
    ...theme.shadow.card,
  },
  map: {
    flex: 1,
  },
  routeButton: {
    marginTop: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.button,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingVertical: 13,
  },
  routeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statBlock: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    ...theme.shadow.card,
  },
  statLabel: {
    ...theme.typography.kicker,
    color: theme.colors.textMuted,
  },
  statValue: {
    ...theme.typography.sectionTitle,
    marginTop: theme.spacing.xs,
    color: theme.colors.textPrimary,
  },
  historySection: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
  },
  historyEmpty: {
    ...theme.typography.body,
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  historyList: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  historyText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingVertical: 15,
    borderRadius: theme.radius.button,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  destructiveButton: {
    flex: 1,
    backgroundColor: theme.colors.danger,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingVertical: 15,
    borderRadius: theme.radius.button,
    alignItems: "center",
  },
  destructiveButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});
