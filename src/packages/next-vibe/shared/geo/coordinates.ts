/**
 * Types and utilities for geographic coordinates
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Check if coordinates are valid
 * @param coords - The coordinates to validate
 * @returns True if coordinates are valid
 */
export function isValidCoordinates(
  coords: Coordinates | null | undefined,
): boolean {
  if (!coords) {
    return false;
  }

  const { latitude, longitude } = coords;

  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Extract coordinates from a string in format "lat,lng"
 * @param coordsString - String containing coordinates
 * @returns Coordinates object or null if invalid
 */
export function parseCoordinatesString(
  coordsString: string,
): Coordinates | null {
  try {
    const [latStr, lngStr] = coordsString.split(",").map((s) => s.trim());
    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lngStr);

    const coords = { latitude, longitude };
    return isValidCoordinates(coords) ? coords : null;
  } catch (error) {
    return null;
  }
}
