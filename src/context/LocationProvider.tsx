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
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

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
        err instanceof Error ? err.message : "Kunne ikke hente lokation",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function startWatching() {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") {
          const { status: requested } =
            await Location.requestForegroundPermissionsAsync();
          if (requested !== "granted") {
            throw new Error("Location permission denied");
          }
        }

        subscriptionRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
          (position) => {
            if (isMounted) {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              setIsLoading(false);
            }
          },
        );
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Kunne ikke hente lokation",
          );
          setIsLoading(false);
        }
      }
    }

    startWatching();

    return () => {
      isMounted = false;
      subscriptionRef.current?.remove();
    };
  }, []);

  const value = useMemo(
    () => ({ location, isLoading, error, refreshLocation }),
    [location, isLoading, error, refreshLocation],
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
