import MapView, { Circle, Marker } from "react-native-maps";
import { StyleSheet } from "react-native";
import { usePlaces } from "@/src/hooks/usePlaces";
import { router } from "expo-router";
import { Fragment, useEffect, useRef } from "react";
import { calculateDistance } from "@/src/services/distance";
import { useLocation } from "@/src/hooks/useLocation";
import { useProximityAlerts } from "@/src/hooks/useProximityAlerts";
import { requestNotificationPermissions, sendNotification} from "@/src/services/notifications";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@react-navigation/elements";

export default function MapScreen() {
  const { places } = usePlaces();
  const mapRef = useRef<MapView>(null);

  //get locations from useLocation
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
    <MapView
      ref={mapRef}
      style={styles.map}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      {places.map((place) => {
        const radius = place.radius ?? 200;

        const distance = location
          ? calculateDistance(
              location.latitude,
              location.longitude,
              place.latitude,
              place.longitude,
            )
          : null;

        const isNearby = distance !== null && distance <= radius;

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
                  ? `${Math.round(distance)} meter væk - ${place.note ?? ""}`
                  : place.note
              }
              pinColor={isNearby ? "green" : "red"}
              onCalloutPress={() => {
                router.navigate(`/places/${place.id}`);
              }}
            />
            <Circle
              center={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              radius={radius}
            />
          </Fragment>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
