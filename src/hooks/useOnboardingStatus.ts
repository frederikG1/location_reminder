import { hasCompletedOnboarding } from "@/src/services/onboarding";
import { useEffect, useState } from "react";

export type OnboardingStatus = "loading" | "pending" | "done";

export function useOnboardingStatus() {
  const [status, setStatus] = useState<OnboardingStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const completed = await hasCompletedOnboarding();

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
