import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Place } from "@/src/models/Place";
import { sendNotification } from "@/src/services/notifications";
import { addVisit, getVisitsForPlace } from "@/src/services/visitRepository";
import { log } from "@/src/util/logger";

export const GEOFENCING_TASK_NAME = "location-reminder-geofencing";

const STORAGE_KEY = "places";

// Står man på kanten af en region, fyrer OS'et Enter igen og igen. Uden en
// karensperiode bliver det til en byge af notifikationer og besøg.
const NOTIFICATION_COOLDOWN_MS = 30 * 60 * 1000;

async function getStoredPlaces(): Promise<Place[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? (parsed as Place[]) : [];
  } catch (error) {
    log("Kunne ikke læse steder i baggrundstask:", error);
    return [];
  }
}

async function isWithinCooldown(placeId: string): Promise<boolean> {
  // addVisit lægger nyeste forrest, så det første element er seneste besøg.
  const [lastVisit] = await getVisitsForPlace(placeId);

  if (!lastVisit) {
    return false;
  }

  const elapsed = Date.now() - new Date(lastVisit.timestamp).getTime();

  return Number.isFinite(elapsed) && elapsed < NOTIFICATION_COOLDOWN_MS;
}

TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data, error }) => {
  if (error) {
    log("Geofencing task fejl:", error.message);
    return;
  }

  const { eventType, region } = data as {
    eventType: Location.GeofencingEventType;
    region: Location.LocationRegion;
  };

  if (eventType !== Location.GeofencingEventType.Enter) {
    return;
  }

  const places = await getStoredPlaces();
  const place = places.find((p) => p.id === region.identifier);

  if (!place) {
    return;
  }

  if (await isWithinCooldown(place.id)) {
    return;
  }

  await addVisit({
    id: `${Date.now()}-${place.id}`,
    placeId: place.id,
    placeName: place.name,
    timestamp: new Date().toISOString(),
  });

  await sendNotification(
    `Du er tæt på ${place.name}`,
    place.note || "Du har gemt en påmindelse her.",
    { placeId: place.id },
  );
});
