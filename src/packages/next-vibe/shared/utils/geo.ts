/**
 * Geospatial utility functions
 * Provides functions for working with geospatial data
 */

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 - The latitude of the first point
 * @param lon1 - The longitude of the first point
 * @param lat2 - The latitude of the second point
 * @param lon2 - The longitude of the second point
 * @returns The distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

/**
 * Convert degrees to radians
 * @param deg - The degrees
 * @returns The radians
 */
export function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Find points within a radius
 * @param centerLat - The latitude of the center point
 * @param centerLon - The longitude of the center point
 * @param radius - The radius in kilometers
 * @param points - The points to check
 * @returns The points within the radius
 */
export function findPointsWithinRadius<
  T extends { latitude: number | string; longitude: number | string },
>(centerLat: number, centerLon: number, radius: number, points: T[]): T[] {
  return points.filter((point) => {
    const lat =
      typeof point.latitude === "string"
        ? parseFloat(point.latitude)
        : point.latitude;
    const lon =
      typeof point.longitude === "string"
        ? parseFloat(point.longitude)
        : point.longitude;
    const distance = calculateDistance(centerLat, centerLon, lat, lon);
    return distance <= radius;
  });
}

/**
 * Calculate the bounding box for a point and radius
 * @param centerLat - The latitude of the center point
 * @param centerLon - The longitude of the center point
 * @param radius - The radius in kilometers
 * @returns The bounding box as [minLat, minLon, maxLat, maxLon]
 */
export function calculateBoundingBox(
  centerLat: number,
  centerLon: number,
  radius: number,
): [number, number, number, number] {
  const R = 6371; // Radius of the Earth in kilometers
  const latDelta = (radius / R) * (180 / Math.PI);
  const lonDelta =
    ((radius / R) * (180 / Math.PI)) / Math.cos(deg2rad(centerLat));

  const minLat = centerLat - latDelta;
  const maxLat = centerLat + latDelta;
  const minLon = centerLon - lonDelta;
  const maxLon = centerLon + lonDelta;

  return [minLat, minLon, maxLat, maxLon];
}
