import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "../util/logger";

const HAS_COMPLETED_ONBOARDING_KEY = "hasCompletedOnboarding";

export async function hasCompletedOnboarding() {
  try {
    const value = await AsyncStorage.getItem(HAS_COMPLETED_ONBOARDING_KEY);
    return value === "true";
  } catch (error) {
    // Kan vi ikke læse flaget, er det bedre at vise introduktionen igen end at
    // efterlade brugeren på en tom skærm.
    log("Kunne ikke læse onboarding-status:", error);
    return false;
  }
}

export async function markOnboardingCompleted() {
  await AsyncStorage.setItem(HAS_COMPLETED_ONBOARDING_KEY, "true");
}

export async function resetOnboarding() {
  await AsyncStorage.removeItem(HAS_COMPLETED_ONBOARDING_KEY);
}
