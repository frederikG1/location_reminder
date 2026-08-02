import { Place } from "@/src/models/Place";
import { calculateDistance } from "@/src/services/distance";
import { GEOFENCING_TASK_NAME } from "@/src/tasks/geofencingTask";
import { log } from "@/src/util/logger";
import * as Location from "expo-location";

// iOS overvåger højst 20 regioner per app. Regioner derudover afvises tavst af
// systemet, så vi vælger selv de 20 nærmeste frem for at lade OS'et gætte.
export const MAX_MONITORED_REGIONS = 20;

let lastSyncedSignature: string | null = null;

// Signaturen dækker geometrien, ikke kun id'erne — ellers ville en redigeret
// radius eller en flyttet markør aldrig nå ud til den armerede geofence.
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
    log("Kunne ikke hente sidst kendte position:", error);
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
    log("Kunne ikke stoppe geofencing:", error);
  }
}

/**
 * Armerer geofences for de givne steder. Returnerer antallet af regioner der
 * faktisk blev armeret, så kalderen kan sige til når ikke alle steder kunne
 * overvåges.
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
    // Lad ikke signaturen stå som synkroniseret — næste forsøg skal prøve igen.
    lastSyncedSignature = null;
    log("Kunne ikke starte geofencing:", error);
    return 0;
  }
}

export async function stopAllGeofencing(): Promise<void> {
  await stopIfRunning();
  lastSyncedSignature = null;
}
