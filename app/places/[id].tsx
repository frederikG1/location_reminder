import { getPlaceEmoji } from "@/src/components/places/PlaceCard";
import CreatePlaceModal from "@/src/components/places/PlaceFormModal";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import FadeInView from "@/src/components/ui/FadeInView";
import ScreenHeader from "@/src/components/ui/ScreenHeader";
import { useVisits } from "@/src/hooks/useVisits";
import { usePlaces } from "@/src/hooks/usePlaces";
import { openDirections } from "@/src/services/directions";
import { theme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Circle, Marker } from "react-native-maps";

dayjs.extend(relativeTime);

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { places, remove, update } = usePlaces();
  const { visits } = useVisits(id);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const place = places.find((item) => item.id === id);

  if (!place) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <ScreenHeader />
        <Text style={styles.notFound}>Place not found</Text>
      </SafeAreaView>
    );
  }

  const recentVisits = visits.slice(0, 5);

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      {/* No title — the place's own name sits large right below, and "Place"
          above it would only say the same thing in a flatter word. */}
      <ScreenHeader />

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

        <FadeInView delay={100} style={styles.mapActions}>
          <AnimatedPressable
            style={styles.routeButton}
            onPress={() =>
              openDirections({
                latitude: place.latitude,
                longitude: place.longitude,
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Show directions to ${place.name}`}
          >
            <Ionicons
              name="navigate-outline"
              size={17}
              color={theme.colors.primaryStrong}
            />
            <Text style={styles.routeButtonText}>Directions</Text>
          </AnimatedPressable>
        </FadeInView>

        <FadeInView delay={130} style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Created</Text>
            <Text style={styles.statValue}>
              {place.createdAt ? dayjs(place.createdAt).fromNow() : "—"}
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={140} style={styles.historySection}>
          <Text style={styles.sectionTitle}>
            {visits.length === 0
              ? "No reminders yet"
              : `Reminded about this place ${visits.length} ${visits.length === 1 ? "time" : "times"}`}
          </Text>

          {visits.length === 0 ? (
            <Text style={styles.historyEmpty}>
              The next time you&apos;re nearby, it&apos;ll show up here.
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
          accessibilityRole="button"
          accessibilityLabel={`Edit ${place.name}`}
        >
          <Text style={styles.secondaryButtonText}>Edit</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.destructiveButton}
          onPress={() => handleDelete(place.id)}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${place.name}`}
        >
          <Text style={styles.destructiveButtonText}>Delete place</Text>
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
    Alert.alert("Delete place", "Are you sure you want to delete this place?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
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
      Alert.alert("Couldn't save", "Try again in a moment.");
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    // Less at the top than at the sides — the header has already set aside room.
    paddingTop: theme.spacing.md,
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
    ...theme.typography.body,
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
  mapActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  routeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.button,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingVertical: 13,
  },
  routeButtonText: {
    ...theme.typography.button,
    color: theme.colors.primaryStrong,
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
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  historyText: {
    fontSize: 15,
    fontFamily: theme.fonts.bold,
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
    ...theme.typography.button,
    color: theme.colors.textPrimary,
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
    ...theme.typography.button,
    color: theme.colors.surface,
  },
});
