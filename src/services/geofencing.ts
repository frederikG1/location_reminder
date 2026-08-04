import { Place } from "@/src/models/Place";
import { calculateDistance } from "@/src/services/distance";
import { GEOFENCING_TASK_NAME } from "@/src/tasks/geofencingTask";
import { log } from "@/src/util/logger";
import * as Location from "expo-location";

// iOS monitors at most 20 regions per app. Regions beyond that are silently
// rejected by the system, so we pick the 20 nearest ourselves rather than
// letting the OS guess.
export const MAX_MONITORED_REGIONS = 20;

let lastSyncedSignature: string | null = null;

// The signature covers the geometry, not just the ids — otherwise an edited
// radius or a moved marker would never reach the armed geofence.
function buildSignature(places: Place[]): string {
  return places
    .map(
      (place) =>
        `${place.id}:${place.latitude}:${place.longitude}:${place.radius}`,
    )
    .sort()
    .join("|");
}

async function pickRegionsToMonitor(places: Place[]): Promise<Place[]> {
  if (places.length <= MAX_MONITORED_REGIONS) {
    return places;
  }

  let origin: Location.LocationObject | null = null;

  try {
    origin = await Location.getLastKnownPositionAsync();
  } catch (error) {
    log("Couldn't get last known position:", error);
  }

  if (!origin) {
    return places.slice(0, MAX_MONITORED_REGIONS);
  }

  const { latitude, longitude } = origin.coords;

  return [...places]
    .sort(
      (a, b) =>
        calculateDistance(latitude, longitude, a.latitude, a.longitude) -
        calculateDistance(latitude, longitude, b.latitude, b.longitude),
    )
    .slice(0, MAX_MONITORED_REGIONS);
}

async function stopIfRunning(): Promise<void> {
  try {
    const isRegistered =
      await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);

    if (isRegistered) {
      await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
    }
  } catch (error) {
    log("Couldn't stop geofencing:", error);
  }
}

/**
 * Arms geofences for the given places. Returns the number of regions that were
 * actually armed, so the caller can speak up when not every place could be
 * monitored.
 */
export async function syncGeofences(places: Place[]): Promise<number> {
  const signature = buildSignature(places);

  if (signature === lastSyncedSignature) {
    return Math.min(places.length, MAX_MONITORED_REGIONS);
  }

  await stopIfRunning();

  if (places.length === 0) {
    lastSyncedSignature = signature;
    return 0;
  }

  const monitored = await pickRegionsToMonitor(places);

  const regions: Location.LocationRegion[] = monitored.map((place) => ({
    identifier: place.id,
    latitude: place.latitude,
    longitude: place.longitude,
    radius: place.radius,
    notifyOnEnter: true,
    notifyOnExit: false,
  }));

  try {
    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
    lastSyncedSignature = signature;
    return regions.length;
  } catch (error) {
    // Don't leave the signature marked as synced — the next attempt has to try
    // again.
    lastSyncedSignature = null;
    log("Couldn't start geofencing:", error);
    return 0;
  }
}

export async function stopAllGeofencing(): Promise<void> {
  await stopIfRunning();
  lastSyncedSignature = null;
}
