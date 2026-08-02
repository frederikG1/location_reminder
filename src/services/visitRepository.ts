import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "../util/logger";
import { Visit } from "../models/Visit";

const STORAGE_KEY = "visits";
const MAX_VISITS = 300;

export async function getVisits(): Promise<Visit[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    log("Kunne ikke læse besøg:", error);
    return [];
  }
}

export async function getVisitsForPlace(placeId: string): Promise<Visit[]> {
  const visits = await getVisits();

  return visits.filter((visit) => visit.placeId === placeId);
}

export async function addVisit(visit: Visit) {
  const existing = await getVisits();

  const updated = [visit, ...existing].slice(0, MAX_VISITS);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function clearAllVisits() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function deleteVisitsForPlace(placeId: string) {
  const existing = await getVisits();

  const updated = existing.filter((visit) => visit.placeId !== placeId);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
