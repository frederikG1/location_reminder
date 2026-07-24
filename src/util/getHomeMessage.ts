export function getHomeMessage(
  nearbyPlacesCount: number,
  nearestPlaceName?: string
) {
  if (nearbyPlacesCount === 0) {
    return "Ingen steder i nærheden lige nu.";
  }

  if (nearbyPlacesCount === 1) {
    return `Du er nær ${nearestPlaceName}.`;
  }

  return `Du har ${nearbyPlacesCount} steder i nærheden.`;
}