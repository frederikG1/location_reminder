import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_COMPLETED_ONBOARDING_KEY = "hasCompletedOnboarding";

export async function hasCompletedOnboarding() {
  const value = await AsyncStorage.getItem(HAS_COMPLETED_ONBOARDING_KEY);
  return value === "true";
}

export async function markOnboardingCompleted() {
  await AsyncStorage.setItem(HAS_COMPLETED_ONBOARDING_KEY, "true");
}
