import { useEffect, useState } from "react";
import { getCurrentLocation } from "../services/location";

type Location = {
  latitude: number;
  longitude: number;
};

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  
  async function refreshLocation() {
    const currentLocation = await getCurrentLocation();

    setLocation(currentLocation);
  }

  useEffect(() => {
    refreshLocation();
  }, []);

  return {location, refreshLocation};
}
