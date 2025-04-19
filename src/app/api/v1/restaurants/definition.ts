import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { restaurantsResponseSchema, restaurantsSearchSchema } from "./schema";

/**
 * Restaurants API endpoint definition
 * Provides restaurant search functionality with filtering
 */
const restaurantsEndpoint = createEndpoint({
  description: "Get restaurants based on search criteria",
  path: ["v1", "restaurants"],
  method: Methods.POST,
  apiQueryOptions: {
    queryKey: ["restaurants"],
  },
  requestSchema: restaurantsSearchSchema,
  responseSchema: restaurantsResponseSchema,
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: {
    search: "Search query",
    page: "Page number for pagination",
    limit: "Number of results per page",
    category: "Filter by category",
    deliveryType: "Filter by delivery type",
    priceRange: "Filter by price range",
    dietary: "Filter by dietary restrictions",
    sortBy: "Sort by",
    countryCode: "Filter by country code",
    zip: "Filter by zip code",
    street: "Filter by street",
    streetNumber: "Filter by street number",
    radius: "Filter by radius",
    rating: "Filter by minimum rating",
    currentlyOpen: "Filter by currently open",
  },
  examples: {
    payloads: {
      default: {
        search: "pizza",
        page: 1,
        limit: 30,
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        restaurants: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        },
      },
    },
  },
  errorCodes: {
    400: "Invalid request data",
    500: "Internal server error",
  },
});

export default restaurantsEndpoint;
