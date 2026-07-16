import { useLocation } from "@/src/hooks/useLocation";
import { usePlaces } from "@/src/hooks/usePlaces";
import { calculateDistance } from "@/src/services/distance";
import { useMemo } from "react";

export function useNearbyPlaces() {
  const { places } = usePlaces();
  const { location } = useLocation();

  const nearbyPlaces = useMemo(() => {
    if (!location) return [];

    return places.filter((place) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        place.latitude,
        place.longitude,
      );

      return distance < place.radius;
    });
  }, [places, location]);

  return nearbyPlaces;
}
