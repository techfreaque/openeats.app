import "server-only";

import { debugLogger } from "next-vibe/shared/utils/logger";

import { searchRestaurants as searchRestaurantsRepo } from "./repository";
import type { RestaurantsSearchOutputType } from "./schema";

/**
 * Gets restaurants based on search criteria with pagination and filtering
 * @param props - API handler props
 * @returns List of restaurants matching search criteria with pagination
 */
export const getRestaurants = async ({
  data,
}: {
  data: RestaurantsSearchOutputType;
}) => {
  try {
    debugLogger("Getting restaurants with search criteria", { data });

    // Use the repository function to search for restaurants
    const result = await searchRestaurantsRepo(data);

    // Return the result in the expected format
    return {
      success: true,
      data: result,
    };
  } catch (err) {
    const error = err as Error;
    debugLogger("Error fetching restaurants", { error: error.message });
    return {
      success: false,
      message: `Error fetching restaurants: ${error.message}`,
      errorCode: 500,
    };
  }
};
