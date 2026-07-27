import { Place } from "@/src/models/Place";
import { syncGeofences } from "@/src/services/geofencing";
import { hasBackgroundLocationPermission } from "@/src/services/location";
import * as placeRepository from "@/src/services/placeRepository";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";

let geofencesSynced = false;

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const prevPlacesRef = useRef<Place[]>([]);

  const refresh = useCallback(async () => {
    const loadedPlaces = await placeRepository.getPlaces();

    // Only update state if places actually changed
    const placesChanged =
      loadedPlaces.length !== prevPlacesRef.current.length ||
      loadedPlaces.some(
        (place, index) => place.id !== prevPlacesRef.current[index]?.id,
      );

    if (placesChanged) {
      setPlaces(loadedPlaces);
    }

    prevPlacesRef.current = loadedPlaces;
    setHasLoaded(true);
  }, []);

  type CreatePlaceInput = {
    name: string;
    note?: string;
    latitude: number;
    longitude: number;
    radius: number;
  };

  const create = async (input: CreatePlaceInput) => {
    const place: Place = {
      id: Crypto.randomUUID(),
      name: input.name,
      note: input.note,
      latitude: input.latitude,
      longitude: input.longitude,
      radius: input.radius,
      createdAt: new Date().toISOString(),
    };

    await placeRepository.savePlace(place);
    geofencesSynced = false;
    await refresh();
  };

  const remove = async (id: string) => {
    await placeRepository.deletePlace(id);
    geofencesSynced = false;
    await refresh();
  };

  const update = async (updatedPlace: Place) => {
    await placeRepository.updatePlace(updatedPlace);
    geofencesSynced = false;
    await refresh();
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Only sync geofences once on startup, then after manual changes.
  // Waits for the first load — syncing the empty initial state would latch the
  // flag and leave the stored places unarmed.
  useEffect(() => {
    if (!hasLoaded || geofencesSynced) {
      return;
    }

    (async () => {
      const hasPermission = await hasBackgroundLocationPermission();
      if (hasPermission) {
        await syncGeofences(places);
        geofencesSynced = true;
      }
    })();
  }, [places, hasLoaded]);

  return {
    places,
    create,
    update,
    remove,
    refresh,
  };
}
