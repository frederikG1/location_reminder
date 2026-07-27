type ProximityStatus = {
  label: string;
  color: string;
};

export function getProximityStatus(distance: number): ProximityStatus {
  if (distance <= 50) {
    return {
      label: "Fremme",
      color: "#34C759",
    };
  }

  if (distance <= 150) {
    return {
      label: "Tæt på",
      color: "#FF9500",
    };
  }

  return {
    label: "I nærheden",
    color: "#0A84FF",
  };
}
