// Brisk walking pace, ~5 km/h.
const METRES_PER_MINUTE = 83;

/**
 * Turns a geofence radius into the walking-distance hint shown next to the
 * radius value, so "400 m" means something before you commit to it.
 */
export function formatWalkTime(radius: number) {
  const minutes = Math.max(1, Math.round(radius / METRES_PER_MINUTE));

  return `~${minutes} min walk`;
}
