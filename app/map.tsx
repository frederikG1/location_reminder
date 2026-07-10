import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";
import { usePlaces } from "@/src/hooks/usePlaces";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { calculateDistance } from "@/src/services/distance";
import { useLocation } from "@/src/hooks/useLocation";

export default function MapScreen() {
  const { places } = usePlaces();
  const mapRef = useRef<MapView>(null);

  //get locations from useLocation
  const { location } = useLocation();

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
        const distance = location
          ? calculateDistance(
              location.latitude,
              location.longitude,
              place.latitude,
              place.longitude,
            )
          : null;

        return (
          <Marker
            key={place.id}
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
            onCalloutPress={() => {
              router.navigate(`/places/${place.id}`);
            }}
          />
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
