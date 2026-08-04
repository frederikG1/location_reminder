import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "../util/logger";

const HAS_COMPLETED_ONBOARDING_KEY = "hasCompletedOnboarding";

export async function hasCompletedOnboarding() {
  try {
    const value = await AsyncStorage.getItem(HAS_COMPLETED_ONBOARDING_KEY);
    return value === "true";
  } catch (error) {
    // If we can't read the flag, showing the intro again beats leaving the
    // user on an empty screen.
    log("Couldn't read onboarding status:", error);
    return false;
  }
}

export async function markOnboardingCompleted() {
  await AsyncStorage.setItem(HAS_COMPLETED_ONBOARDING_KEY, "true");
}

export async function resetOnboarding() {
  await AsyncStorage.removeItem(HAS_COMPLETED_ONBOARDING_KEY);
}
