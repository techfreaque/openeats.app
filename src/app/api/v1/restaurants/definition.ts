import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { restaurantsResponseSchema, restaurantsSearchSchema } from "./schema";
import type { RestaurantsResponseType, RestaurantsSearchType } from "./schema";

/**
 * Restaurants API endpoint definition
 * Provides restaurant search functionality with filtering
 */
const restaurantsEndpoint = createEndpoint<
  RestaurantsSearchType,
  RestaurantsResponseType,
  Record<string, never>,
  Methods.POST,
  "default"
>({
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
  fieldDescriptions: {},
  examples: {
    payloads: {
      default: {
        search: "pizza",
        page: 1,
        limit: 30,
      }
    },
    urlPathVariables: {
      default: {}
    },
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
