import { useState } from "react";
import { requestBackgroundLocationPermission } from "../services/location";
import {
  hasAskedBackgroundPermission,
  markAskedForBackgroundPermission,
} from "../services/onboarding";

export function useBackgroundPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [placeName, setPlaceName] = useState("");

  async function maybeShowPrompt(wasFirstPlace: boolean, name: string) {
    if (!wasFirstPlace) {
      return;
    }
    const alreadyAsked = await hasAskedBackgroundPermission();

    if (alreadyAsked) {
      return;
    }

    setPlaceName(name);
    setVisible(true);
  }

  async function handleAccept() {
    try {
      const granted = await requestBackgroundLocationPermission();
      console.log("Background permission result:", granted);
    } catch (error) {
      console.log("Error in handleAccept:", error);
    } finally {
      await markAskedForBackgroundPermission();
      setVisible(false);
    }
  }

  async function handleDismiss() {
    await markAskedForBackgroundPermission();
    setVisible(false);
  }

  return { visible, placeName, maybeShowPrompt, handleAccept, handleDismiss };
}
