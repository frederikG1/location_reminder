import { useEffect, useState } from "react";
import { getCurrentLocation } from "../services/location";

type Location = {
  latitude: number;
  longitude: number;
};

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function refreshLocation() {
    setIsLoading(true);
    setError(null);

    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Kunne ikke hente lokation",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshLocation();
  }, []);

  return { location, refreshLocation, isLoading, error };
}
