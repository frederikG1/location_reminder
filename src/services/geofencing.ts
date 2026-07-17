import * as Location from "expo-location";
import { Place } from "@/src/models/Place";
import { GEOFENCING_TASK_NAME } from "@/src/tasks/geofencingTask";

export async function syncGeofences(places: Place[]): Promise<void> {
  const isRegistered =
    await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);

  if (isRegistered) {
    await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
  }

  if (places.length === 0) {
    return;
  }

  const regions: Location.LocationRegion[] = places.map((place) => ({
    identifier: place.id,
    latitude: place.latitude,
    longitude: place.longitude,
    radius: place.radius,
    notifyOnEnter: true,
    notifyOnExit: false,
  }));

  try {
    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
  } catch (error) {
    console.log("Kunne ikke starte geofencing:", error);
  }
}

export async function stopAllGeofencing(): Promise<void> {
  const isRegistered =
    await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);

  if (isRegistered) {
    await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
  }
}
