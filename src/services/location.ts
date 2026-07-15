import * as Location from "expo-location";

export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Location permission denied");
  }

  const location = await Location.getCurrentPositionAsync({});

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export async function requestBackgroundLocationPermission() {
  const { status: foregroundStatus } =
    await Location.getForegroundPermissionsAsync();

  if (foregroundStatus !== "granted") {
    throw new Error(
      "Foreground permission require before requesting background permission",
    );
  }

  const { status } = await Location.requestBackgroundPermissionsAsync();

  return status === "granted";
}

export async function hasBackgroundLocationPermission() {
  const { status } = await Location.getBackgroundPermissionsAsync();
  return status === "granted";
}
