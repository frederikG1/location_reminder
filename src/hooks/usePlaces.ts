import { useCallback, useEffect, useState } from "react";
import { Place } from "@/src/models/Place";
import * as placeRepository from "@/src/services/placeRepository";
import * as Crypto from "expo-crypto";


export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);

  const refresh = useCallback(async () => {
    const loadedPlaces = await placeRepository.getPlaces();
    setPlaces(loadedPlaces);
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

    try {
      await placeRepository.savePlace(place);
      await refresh();
    } catch (error) {
      console.log("Failed creating place", error);
    }
  };

  const remove = async (id: string) => {
    await placeRepository.deletePlace(id);

    await refresh();
  };

  const update = async (updatedPlace: Place) => {
    await placeRepository.updatePlace(updatedPlace);

    await refresh();
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    places,
    create,
    update,
    remove,
    refresh,
  };
}
