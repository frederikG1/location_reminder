import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as Location from "expo-location";

type LocationCoords = {
  latitude: number;
  longitude: number;
};

type LocationContextValue = {
  location: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
  startWatching: () => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const isMountedRef = useRef(true);

  const refreshLocation = useCallback(async () => {
    try {
      setIsLoading(true);

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't get your location",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Never requests permission itself — the first-run flow asks for it at the
  // moment the user asks to see the map, and calls startWatching() after.
  const startWatching = useCallback(async () => {
    if (subscriptionRef.current) {
      return;
    }

    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        setIsLoading(false);
        return;
      }

      subscriptionRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
        (position) => {
          if (!isMountedRef.current) {
            return;
          }

          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
          setIsLoading(false);
        },
      );
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          err instanceof Error ? err.message : "Couldn't get your location",
        );
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    startWatching();

    return () => {
      isMountedRef.current = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [startWatching]);

  const value = useMemo(
    () => ({ location, isLoading, error, refreshLocation, startWatching }),
    [location, isLoading, error, refreshLocation, startWatching],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocationContext must be used within LocationProvider");
  }
  return context;
}
