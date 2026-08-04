import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "../util/logger";

const REMINDERS_PAUSED_KEY = "remindersPaused";

export async function areRemindersPaused(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(REMINDERS_PAUSED_KEY);
    return value === "true";
  } catch (error) {
    // If we can't read the setting, reminders working is less surprising than
    // them being silently turned off.
    log("Couldn't read reminder setting:", error);
    return false;
  }
}

export async function setRemindersPaused(paused: boolean): Promise<void> {
  await AsyncStorage.setItem(REMINDERS_PAUSED_KEY, paused ? "true" : "false");
}
