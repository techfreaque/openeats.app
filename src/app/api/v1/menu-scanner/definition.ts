import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { menuScannerResponseSchema } from "./schema";

/**
 * Menu Scanner API endpoint definitions
 * Provides menu scanning functionality using AI
 */

/**
 * POST endpoint for scanning menu images
 * Note: This endpoint uses FormData, not JSON
 */
const menuScannerEndpoint = createEndpoint({
  description: "Scan a menu image using AI",
  method: Methods.POST,
  // We can't use the schema directly because this endpoint uses FormData
  requestSchema: undefinedSchema,
  responseSchema: menuScannerResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "menu-scanner"],
  apiQueryOptions: {
    queryKey: ["menu-scanner"],
  },
  fieldDescriptions: undefined, // FormData can't be represented in the standard way
  /* Actual fields would be:
  {
    image: "Menu image file",
    restaurantId: "Restaurant ID",
  },
  */
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: undefined,
    responses: {
      default: {
        menuItems: [
          {
            name: "Margherita Pizza",
            description:
              "Classic pizza with tomato sauce, mozzarella, and basil",
            price: 12.99,
            category: "Pizza",
          },
          {
            name: "Pepperoni Pizza",
            description: "Pizza with tomato sauce, mozzarella, and pepperoni",
            price: 14.99,
            category: "Pizza",
          },
        ],
      },
    },
  },
});

/**
 * Menu Scanner API endpoints
 */
const menuScannerEndpoints = {
  ...menuScannerEndpoint,
};

export default menuScannerEndpoints;
