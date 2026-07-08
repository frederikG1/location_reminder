import AsyncStorage from "@react-native-async-storage/async-storage";
import { Place } from "../models/Place";

const STORAGE_KEY = "places";

//New location, get existing places, add new place, save
export async function savePlace(place: Place) {
  const existing = await getPlaces();

  const updated = [...existing, place];

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getPlaces(): Promise<Place[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  return JSON.parse(data);
}
