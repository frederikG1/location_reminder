import { Visit } from "@/src/models/Visit";
import * as visitRepository from "@/src/services/visitRepository";
import { useCallback, useEffect, useState } from "react";

export function useVisits(placeId: string) {
  const [visits, setVisits] = useState<Visit[]>([]);

  const refresh = useCallback(async () => {
    const loaded = await visitRepository.getVisitsForPlace(placeId);
    setVisits(loaded);
  }, [placeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { visits, refresh };
}
