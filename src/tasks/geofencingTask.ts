import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Place } from "@/src/models/Place";
import { sendNotification } from "@/src/services/notifications";

export const GEOFENCING_TASK_NAME = "location-reminder-geofencing";

const STORAGE_KEY = "places";

async function getStoredPlaces(): Promise<Place[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as Place[]) : [];
  } catch (error) {
    console.log("Kunne ikke læse steder i baggrundstask:", error);
    return [];
  }
}

TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.log("Geofencing task fejl:", error.message);
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

  await sendNotification(
    "Du er i nærheden!",
    `${place.name}${place.note ? ` - ${place.note}` : ""} er lige i nærheden`,
  );
});
