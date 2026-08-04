type ProximityStatus = {
  label: string;
  color: string;
};

export function getProximityStatus(distance: number): ProximityStatus {
  if (distance <= 50) {
    return {
      label: "Arrived",
      color: "#34C759",
    };
  }

  if (distance <= 150) {
    return {
      label: "Close by",
      color: "#FF9500",
    };
  }

  return {
    label: "Nearby",
    color: "#0A84FF",
  };
}
