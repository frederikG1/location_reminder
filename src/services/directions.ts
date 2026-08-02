import { Linking, Platform } from "react-native";

type Coords = { latitude: number; longitude: number };

export async function openDirections({ latitude, longitude }: Coords) {
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;

  const nativeUrl = Platform.select({
    ios: `maps://?daddr=${latitude},${longitude}&dirflg=w`,
    android: `google.navigation:q=${latitude},${longitude}&mode=w`,
  });

  try {
    if (nativeUrl && (await Linking.canOpenURL(nativeUrl))) {
      await Linking.openURL(nativeUrl);
      return;
    }
  } catch {
    // Fall through to the web URL below.
  }

  await Linking.openURL(webUrl);
}
