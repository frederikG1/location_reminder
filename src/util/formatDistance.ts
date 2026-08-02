/**
 * Afstand i meter → den korte form der står i nærheds-badget. Under en
 * kilometer rundes til nærmeste ti meter — GPS'en er alligevel ikke skarpere
 * end det, og "180 m" læses hurtigere end "183 m".
 */
export function formatDistance(meters: number) {
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1).replace(".", ",");
    return `${km} km`;
  }

  return `${Math.round(meters / 10) * 10} m`;
}
