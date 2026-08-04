import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";
import { hasNotificationPermission } from "../services/notifications";

/**
 * Background location without notification permission makes for a completely
 * silent app: we log visits, but the user never hears anything. This hook
 * watches the real status, so the home screen can say so out loud.
 */
export function useNotificationPermission() {
  const [isGranted, setIsGranted] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    setIsGranted(await hasNotificationPermission());
  }, []);

  useEffect(() => {
    refresh();

    // The permission may have changed in Settings while we were backgrounded.
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  return {
    /** Null until the first check resolves, so nothing flashes on mount. */
    needsPermission: isGranted === false,
    openSettings: () => Linking.openSettings(),
    refresh,
  };
}
