import { Client } from "@googlemaps/google-maps-services-js";

import { errorLogger } from "@/next-portal/utils/logger";

import { env } from "../env/env";

/**
 * Calculate the distance between two geographical coordinates using the Haversine formula
 * @param lat1 Latitude of the first point in decimal degrees
 * @param lon1 Longitude of the first point in decimal degrees
 * @param lat2 Latitude of the second point in decimal degrees
 * @param lon2 Longitude of the second point in decimal degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // Convert degrees to radians
  const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
  const radiusOfEarth = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = radiusOfEarth * c;
  return distance;
}

export async function getCoordinatesFromAddress({
  street,
  streetNumber,
  zip,
  city,
  country,
}: {
  street?: string;
  streetNumber?: string;
  zip?: string;
  city?: string;
  country?: string;
}): Promise<
  | {
      success: true;
      latitude: number;
      longitude: number;
      street?: string;
      streetNumber?: string;
      zip?: string;
      city?: string;
      country?: string;
      error?: never;
    }
  | {
      success: false;
      error: string;
      latitude?: never;
      longitude?: never;
      street?: never;
      streetNumber?: never;
      zip?: never;
      city?: never;
      country?: never;
    }
> {
  const client = new Client({});
  const addressParts = [];
  if (street) {
    addressParts.push(street);
  }
  if (streetNumber) {
    addressParts.push(streetNumber);
  }
  if (zip) {
    addressParts.push(zip);
  }
  if (city) {
    addressParts.push(city);
  }
  if (country) {
    addressParts.push(country);
  }
  const address = addressParts.join(", ");
  if (!address) {
    return { error: "At least one address component is required" };
  }
  try {
    const response = await client.geocode({
      params: {
        address,
        key: env.GOOGLE_MAPS_API_KEY,
      },
    });
    if (response.data.results.length === 0) {
      throw new Error("No results found for the provided address");
    }
    const { lat, lng } = response.data.results[0].geometry.location;
    // Extract specific address components from the response
    const addressComponents = response.data.results[0].address_components;

    // Map components to the exact fields we need
    const street = findAddressComponent(addressComponents, "route");
    const streetNumber = findAddressComponent(
      addressComponents,
      "street_number",
    );
    const zip = findAddressComponent(addressComponents, "postal_code");
    const city = findAddressComponent(addressComponents, "locality");
    const country = findAddressComponent(addressComponents, "country");

    return {
      latitude: lat,
      longitude: lng,
      street,
      streetNumber,
      zip,
      city,
      country,
    };
  } catch (error) {
    errorLogger("Error geocoding address:", error);
    return { error: "Failed to geocode address" };
  }
}

/**
 * Helper function to extract address components by type from Google Geocoding API response
 * @param components Array of address components from Google Geocoding API
 * @param type The type of address component to find
 * @returns The long_name of the component if found, empty string otherwise
 */
function findAddressComponent(
  components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>,
  type: string,
): string {
  const component = components.find((c) => c.types.includes(type));
  return component ? component.long_name : "";
}
