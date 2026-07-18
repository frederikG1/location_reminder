import { Place } from "@/src/models/Place";
import { GEOFENCING_TASK_NAME } from "@/src/tasks/geofencingTask";
import * as Location from "expo-location";

let lastSyncedPlaceIds: string[] = [];

export async function syncGeofences(places: Place[]): Promise<void> {
  // Only sync if place IDs actually changed
  const currentPlaceIds = places.map((p) => p.id).sort();
  const idsChanged =
    currentPlaceIds.length !== lastSyncedPlaceIds.length ||
    currentPlaceIds.some((id, index) => id !== lastSyncedPlaceIds[index]);

  if (!idsChanged) {
    return;
  }

  lastSyncedPlaceIds = currentPlaceIds;

  try {
    const isRegistered =
      await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);

    if (isRegistered) {
      try {
        await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
      } catch (error) {
        console.log("Error stopping geofencing:", error);
      }
    }
  } catch (error) {
    console.log("Error checking geofencing status:", error);
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
  try {
    const isRegistered =
      await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);

    if (isRegistered) {
      try {
        await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
      } catch (error) {
        console.log("Error stopping geofencing:", error);
      }
    }
  } catch (error) {
    console.log("Error checking geofencing status:", error);
  }
}
