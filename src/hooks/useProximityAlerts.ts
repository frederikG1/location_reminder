import { useEffect, useRef } from "react";
import { useNearbyPlaces } from "@/src/hooks/useNearbyPlaces";
import { Place } from "../models/Place";


export function useProximityAlerts(onEnterRadius: (place: Place) => void) {
  const nearbyPlaces = useNearbyPlaces();
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentNearbyIds = new Set(nearbyPlaces.map((p) => p.id));

    // Trig kun for steder der er nye i radius
    nearbyPlaces.forEach((place) => {
      if (!notifiedIds.current.has(place.id)) {
        notifiedIds.current.add(place.id);
        onEnterRadius(place);
      }
    });

    // Ryd op: hvis et sted ikke længere er i nærheden, fjern det fra "notified"
    // så brugeren kan blive advaret igen, hvis de forlader og kommer tilbage
    notifiedIds.current.forEach((id) => {
      if (!currentNearbyIds.has(id)) {
        notifiedIds.current.delete(id);
      }
    });
  }, [nearbyPlaces, onEnterRadius]);
}