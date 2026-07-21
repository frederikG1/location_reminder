import { useLocation } from "@/src/hooks/useLocation";
import { usePlaces } from "@/src/hooks/usePlaces";
import { calculateDistance } from "@/src/services/distance";
import { useMemo } from "react";
import { getProximityStatus } from "../services/proximity";

export function useNearbyPlaces() {
  const { places } = usePlaces();
  const { location } = useLocation();

  const nearbyPlaces = useMemo(() => {
    if (!location) return [];

    return places
      .map((place) => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          place.latitude,
          place.longitude,
        );

        return {
          place,
          distance,
          status: getProximityStatus(distance),
        };
      })
      .filter(({ place, distance }) => distance <= place.radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [places, location]);

  return nearbyPlaces;
}
