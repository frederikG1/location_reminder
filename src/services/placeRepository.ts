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

export async function updatePlace(updatedPlace: Place) {
  const places = await getPlaces();

  const updatedPlaces = places.map((place) =>
    place.id === updatedPlace.id ? updatedPlace : place,
  );

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlaces));
}

export async function deletePlace(id: string) {
  const places = await getPlaces();

  const deletedPlaces = places.filter((place) => place.id !== id);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(deletedPlaces));
}
