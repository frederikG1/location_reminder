import { Place } from "@/src/models/Place";
import { syncGeofences } from "@/src/services/geofencing";
import { hasBackgroundLocationPermission } from "@/src/services/location";
import * as placeRepository from "@/src/services/placeRepository";
import * as visitRepository from "@/src/services/visitRepository";
import { useFocusEffect } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";

let geofencesSynced = false;

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const loadedPlaces = await placeRepository.getPlaces();
    setPlaces(loadedPlaces);
    setHasLoaded(true);
  }, []);

  type CreatePlaceInput = {
    name: string;
    note?: string;
    emoji?: string;
    latitude: number;
    longitude: number;
    radius: number;
  };

  const create = async (input: CreatePlaceInput) => {
    const place: Place = {
      id: Crypto.randomUUID(),
      name: input.name,
      note: input.note,
      emoji: input.emoji,
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
    await visitRepository.deleteVisitsForPlace(id);
    geofencesSynced = false;
    await refresh();
  };

  const update = async (updatedPlace: Place) => {
    await placeRepository.updatePlace(updatedPlace);
    geofencesSynced = false;
    await refresh();
  };

  // Refetch whenever this screen (re)gains focus, not just on mount — a
  // screen further down the stack doesn't remount when you navigate back to
  // it, so without this it would keep showing data from before the edit.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

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
