import { GOOGLE_MAPS_API_KEY } from "../../config/apiKeys";

// Function to get address from coordinates using Google Maps API
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      // Fallback to coordinates if geocoding fails
      return `Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
    }
  } catch (error) {
    console.error("Error geocoding:", error);
    // Fallback to coordinates
    return `Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
  }
};
