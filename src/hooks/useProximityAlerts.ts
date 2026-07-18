import { useEffect, useRef } from "react";
import { useNearbyPlaces } from "@/src/hooks/useNearbyPlaces";
import { Place } from "../models/Place";

export function useProximityAlerts(onEnterRadius: (place: Place) => void) {
  const nearbyPlaces = useNearbyPlaces();
  const notifiedIds = useRef<Set<string>>(new Set());
  const onEnterRadiusRef = useRef(onEnterRadius);

  // Keep the ref in sync with the callback
  useEffect(() => {
    onEnterRadiusRef.current = onEnterRadius;
  }, [onEnterRadius]);

  useEffect(() => {
    // Only notify for newly nearby places (not previously notified)
    nearbyPlaces.forEach((place) => {
      if (!notifiedIds.current.has(place.id)) {
        notifiedIds.current.add(place.id);
        onEnterRadiusRef.current(place);
      }
    });
  }, [nearbyPlaces]);
}
