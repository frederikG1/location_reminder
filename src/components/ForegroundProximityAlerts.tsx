import { useProximityAlerts } from "@/src/hooks/useProximityAlerts";
import { Place } from "@/src/models/Place";
import { hasBackgroundLocationPermission } from "@/src/services/location";
import { sendNotification } from "@/src/services/notifications";
import { useCallback, useEffect, useState } from "react";

const noop = () => {};

export default function ForegroundProximityAlerts() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    hasBackgroundLocationPermission().then((granted) => {
      setEnabled(!granted);
    });
  }, []);

  const handleEnterRadius = useCallback((place: Place) => {
    void sendNotification(
      "Du er i nærheden!",
      `${place.name}${place.note ? ` - ${place.note}` : ""} er lige i nærheden`,
    );
  }, []);

  useProximityAlerts(enabled ? handleEnterRadius : noop);

  return null;
}
