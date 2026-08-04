export function getHomeMessage(
  nearbyPlacesCount: number,
  nearestPlaceName?: string
) {
  if (nearbyPlacesCount === 0) {
    return "No places nearby right now.";
  }

  if (nearbyPlacesCount === 1) {
    return `You're near ${nearestPlaceName}.`;
  }

  return `You have ${nearbyPlacesCount} places nearby.`;
}