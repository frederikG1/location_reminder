import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "../util/logger";
import { Place } from "../models/Place";

const STORAGE_KEY = "places";

//New location, get existing places, add new place, save
export async function savePlace(place: Place) {
  const existing = await getPlaces();

  const updated = [...existing, place];

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// A corrupt or half-written blob must not be able to topple the app. We fall
// back to an empty list rather than letting a SyntaxError bubble up into the UI.
export async function getPlaces(): Promise<Place[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    log("Couldn't read places:", error);
    return [];
  }
}

export async function updatePlace(updatedPlace: Place) {
  const places = await getPlaces();

  const updatedPlaces = places.map((place) =>
    place.id === updatedPlace.id ? updatedPlace : place,
  );

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlaces));
}

export async function clearAllPlaces() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function deletePlace(id: string) {
  const places = await getPlaces();

  const deletedPlaces = places.filter((place) => place.id !== id);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(deletedPlaces));
}
