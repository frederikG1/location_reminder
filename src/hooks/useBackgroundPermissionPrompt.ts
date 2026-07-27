import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";
import {
  hasBackgroundLocationPermission,
  requestBackgroundLocationPermission,
} from "../services/location";
import { requestNotificationPermissions } from "../services/notifications";

/**
 * Drives the "reminders are off" path on the home screen. Keyed off the real
 * permission state rather than a one-shot flag, so someone who chose "kun når
 * appen er åben" during the first run always has a way back — and the prompt
 * disappears by itself once they grant it.
 */
export function useBackgroundPermissionPrompt() {
  const [isGranted, setIsGranted] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);

  const refresh = useCallback(async () => {
    setIsGranted(await hasBackgroundLocationPermission());
  }, []);

  useEffect(() => {
    refresh();

    // They may have flipped it in Settings while we were backgrounded.
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  async function handleAccept() {
    try {
      const granted = await requestBackgroundLocationPermission();

      if (granted) {
        await requestNotificationPermissions();
        setIsGranted(true);
      } else {
        // Once denied, the OS will not ask again — Settings is the only route.
        await Linking.openSettings();
      }
    } catch {
      await Linking.openSettings();
    } finally {
      setVisible(false);
    }
  }

  return {
    /** Null until the first check resolves, so nothing flashes on mount. */
    needsPermission: isGranted === false,
    visible,
    show: () => setVisible(true),
    handleAccept,
    handleDismiss: () => setVisible(false),
  };
}
