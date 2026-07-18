import { useLocationContext } from "@/src/context/LocationProvider";

export function useLocation() {
  return useLocationContext();
}
