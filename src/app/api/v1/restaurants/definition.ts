import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { Countries } from "@/translations";

import { DeliveryType } from "../order/delivery.schema";
import { restaurantsResponseSchema, restaurantsSearchSchema } from "./schema";

const restaurantsEndpoint = createEndpoint({
  description: "Get restaurants based on search criteria",
  path: ["v1", "restaurants"],
  method: Methods.POST,
  apiQueryOptions: {
    queryKey: ["restaurants"],
  },
  fieldDescriptions: {
    search: "Search query",
    countryCode: "Country code",
    zip: "ZIP code",
    street: "Street name",
    streetNumber: "Street number",
    radius: "Search radius in km",
    rating: "Minimum rating",
    currentlyOpen: "Only show currently open restaurants",
    page: "Page number",
    limit: "Number of results per page",
    category: "Filter by restaurant category",
    deliveryType: "Filter by delivery type",
    priceRange: "Filter by price range",
    dietary: "Filter by dietary options",
    sortBy: "Sort by criteria",
  },
  requestSchema: restaurantsSearchSchema,
  responseSchema: restaurantsResponseSchema,
  examples: {
    payloads: {
      default: {
        search: "pizza",
        countryCode: Countries.DE,
        zip: "12345",
        street: "Example street",
        streetNumber: "123",
        radius: 10,
        rating: 4,
        currentlyOpen: true,
        page: 1,
        limit: 30,
        category: "Italian",
        deliveryType: DeliveryType.DELIVERY,
        priceRange: ["$", "$$"],
        dietary: ["vegetarian", "vegan"],
        sortBy: "rating",
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
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  requestUrlSchema: undefinedSchema,
  errorCodes: {
    500: "Internal server error",
  },
});
export default restaurantsEndpoint;
