import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_ASKED_BACKGROUND_PERMISSION_KEY = "hasAskedBackgroundPermission";

export async function hasAskedBackgroundPermission() {
  const value = await AsyncStorage.getItem(HAS_ASKED_BACKGROUND_PERMISSION_KEY);
  return value === "true";
}

export async function markAskedForBackgroundPermission() {
  await AsyncStorage.setItem(HAS_ASKED_BACKGROUND_PERMISSION_KEY, "true");
}
