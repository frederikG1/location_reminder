import MapView, { Circle, Marker } from "react-native-maps";
import { StyleSheet, Text, View } from "react-native";
import { usePlaces } from "@/src/hooks/usePlaces";
import { router } from "expo-router";
import { Fragment, useEffect, useRef } from "react";
import { calculateDistance } from "@/src/services/distance";
import { useLocation } from "@/src/hooks/useLocation";
import { useProximityAlerts } from "@/src/hooks/useProximityAlerts";
import {
  requestNotificationPermissions,
  sendNotification,
} from "@/src/services/notifications";

export default function MapScreen() {
  const { places } = usePlaces();
  const mapRef = useRef<MapView>(null);

  const { location } = useLocation();

  useProximityAlerts((place) => {
    sendNotification("Du er i nærheden!", `${place.name} er lige i nærheden`);
  });

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!location) {
      return;
    }

    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  }, [location]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {places.map((place) => {
          const distance = location
            ? calculateDistance(
                location.latitude,
                location.longitude,
                place.latitude,
                place.longitude,
              )
            : null;

          const isNearby = distance !== null && distance <= place.radius;

          return (
            <Fragment key={place.id}>
              <Marker
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.name}
                description={
                  distance
                    ? `${Math.round(distance)} meter væk${place.note ? ` - ${place.note}` : ""}`
                    : place.note
                }
                pinColor={isNearby ? colors.primary : colors.danger}
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
                strokeColor={isNearby ? colors.primary : colors.danger}
                fillColor={isNearby ? colors.primaryFill : colors.dangerFill}
                strokeWidth={1}
              />
            </Fragment>
          );
        })}
      </MapView>

      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.primary }]}
          />
          <Text style={styles.legendText}>I nærheden</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.danger }]}
          />
          <Text style={styles.legendText}>Udenfor radius</Text>
        </View>
      </View>
    </View>
  );
}

const colors = {
  primary: "#2F6F4F",
  primaryFill: "rgba(47, 111, 79, 0.12)",
  danger: "#B3261E",
  dangerFill: "rgba(179, 38, 30, 0.1)",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  border: "#E5E5E1",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  legend: {
    position: "absolute",
    bottom: 24,
    left: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
});
