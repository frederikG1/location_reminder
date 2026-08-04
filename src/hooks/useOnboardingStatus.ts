import { hasCompletedOnboarding } from "@/src/services/onboarding";
import { log } from "@/src/util/logger";
import { useEffect, useState } from "react";

export type OnboardingStatus = "loading" | "pending" | "done";

export function useOnboardingStatus() {
  const [status, setStatus] = useState<OnboardingStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let completed = false;

      try {
        completed = await hasCompletedOnboarding();
      } catch (error) {
        // Without this, status would stay on "loading" and the home screen
        // would render null forever — a white screen with no way out.
        log("Couldn't determine onboarding status:", error);
      }

      if (!cancelled) {
        setStatus(completed ? "done" : "pending");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
