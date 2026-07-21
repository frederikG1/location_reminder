import NearbyPlacesList from "@/src/components/places/NearbyPlacesMapList";
import FadeInView from "@/src/components/ui/FadeInView";
import { useLocation } from "@/src/hooks/useLocation";
import { usePlaces } from "@/src/hooks/usePlaces";
import { Place } from "@/src/models/Place";
import { calculateDistance } from "@/src/services/distance";
import { requestNotificationPermissions } from "@/src/services/notifications";
import { theme } from "@/src/theme";
import { router } from "expo-router";
import { Fragment, useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

export default function MapScreen() {
  const { places } = usePlaces();
  const mapRef = useRef<MapView>(null);
  const hasCenteredRef = useRef(false);

  const { location } = useLocation();

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!location || hasCenteredRef.current) {
      return;
    }

    hasCenteredRef.current = true;
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      600,
    );
  }, [location]);

  const placesWithDistance = useMemo(() => {
    return places.map((place) => {
      const distance = location
        ? calculateDistance(
            location.latitude,
            location.longitude,
            place.latitude,
            place.longitude,
          )
        : null;

      const isNearby = distance !== null && distance <= place.radius;

      return { place, distance, isNearby };
    });
  }, [places, location]);

  const nearbyPlaces: Place[] = useMemo(
    () =>
      placesWithDistance
        .filter((entry) => entry.isNearby)
        .map((entry) => entry.place),
    [placesWithDistance],
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton
      >
        {placesWithDistance.map(({ place, distance, isNearby }) => (
          <Fragment key={place.id}>
            <Marker
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              description={
                distance !== null
                  ? `${Math.round(distance)} meter væk${place.note ? ` - ${place.note}` : ""}`
                  : place.note
              }
              pinColor={isNearby ? theme.colors.primary : theme.colors.danger}
              onCalloutPress={() => {
                router.navigate(`/places/${place.id}`);
              }}
            />
            <Circle
              center={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              radius={place.radius}
              strokeColor={
                isNearby ? theme.colors.primary : theme.colors.danger
              }
              fillColor={
                isNearby ? theme.colors.primaryFill : theme.colors.dangerFill
              }
              strokeWidth={1}
            />
          </Fragment>
        ))}
      </MapView>

      <NearbyPlacesList places={nearbyPlaces} />

      <FadeInView delay={200} style={styles.legend}>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.colors.primary },
            ]}
          />
          <Text style={styles.legendText}>I nærheden</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendDot, { backgroundColor: theme.colors.danger }]}
          />
          <Text style={styles.legendText}>Udenfor radius</Text>
        </View>
      </FadeInView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  legend: {
    position: "absolute",
    bottom: 24,
    left: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 6,
    ...theme.shadow.floating,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
});
