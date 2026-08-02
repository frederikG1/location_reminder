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
        // Uden dette ville status blive stående på "loading", og hjemmeskærmen
        // ville rendere null for evigt — en hvid skærm uden vej ud.
        log("Kunne ikke afgøre onboarding-status:", error);
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
