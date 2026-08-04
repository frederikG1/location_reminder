/**
 * Distance in meters → the short form shown in the proximity badge. Below a
 * kilometer it rounds to the nearest ten meters — GPS isn't sharper than that
 * anyway, and "180 m" reads faster than "183 m".
 */
export function formatDistance(meters: number) {
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  }

  return `${Math.round(meters / 10) * 10} m`;
}
