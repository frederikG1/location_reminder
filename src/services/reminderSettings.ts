import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "../util/logger";

const REMINDERS_PAUSED_KEY = "remindersPaused";

export async function areRemindersPaused(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(REMINDERS_PAUSED_KEY);
    return value === "true";
  } catch (error) {
    // Kan vi ikke læse indstillingen, er det mindre overraskende at påmindelser
    // virker end at de tavst er slået fra.
    log("Kunne ikke læse påmindelses-indstilling:", error);
    return false;
  }
}

export async function setRemindersPaused(paused: boolean): Promise<void> {
  await AsyncStorage.setItem(REMINDERS_PAUSED_KEY, paused ? "true" : "false");
}
