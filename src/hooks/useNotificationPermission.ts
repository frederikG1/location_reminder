import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";
import { hasNotificationPermission } from "../services/notifications";

/**
 * Baggrundslokation uden notifikationstilladelse giver en helt tavs app: vi
 * registrerer besøg, men brugeren hører aldrig noget. Denne hook holder øje med
 * den reelle status, så hjemmeskærmen kan sige det højt.
 */
export function useNotificationPermission() {
  const [isGranted, setIsGranted] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    setIsGranted(await hasNotificationPermission());
  }, []);

  useEffect(() => {
    refresh();

    // Tilladelsen kan være ændret i Indstillinger mens vi lå i baggrunden.
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  return {
    /** Null indtil første tjek er færdigt, så intet blinker ved mount. */
    needsPermission: isGranted === false,
    openSettings: () => Linking.openSettings(),
    refresh,
  };
}
