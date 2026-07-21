type ProximityStatus = {
  label: string;
  emoji: string;
  color: string;
};

export function getProximityStatus(distance: number): ProximityStatus {
  if (distance <= 50) {
    return {
      label: "Fremme",
      emoji: "🟢",
      color: "#34C759",
    };
  }

  if (distance <= 150) {
    return {
      label: "Tæt på",
      emoji: "🚶",
      color: "#FF9500",
    };
  }

  return {
    label: "I nærheden",
    emoji: "📍",
    color: "0A84FF",
  };
}
