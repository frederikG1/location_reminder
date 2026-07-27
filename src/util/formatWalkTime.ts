/**
 * Turns a geofence radius into the walking-distance hint shown next to the
 * radius value, so "400 m" means something before you commit to it.
 */
export function formatWalkTime(radius: number) {
  if (radius <= 120) {
    return "et minuts gang";
  }

  if (radius <= 350) {
    return "et par minutters gang";
  }

  return "en lille spadseretur";
}
