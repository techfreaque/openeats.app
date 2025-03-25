import { typedEndpoint } from "@/next-portal/api/endpoint";
import { undefinedSchema } from "@/next-portal/types/common.schema";
import { UserRoleValue } from "@/next-portal/types/enums";

import { examples } from "../../examples/data";
import {
  restaurantsResponseSchema,
  restaurantsSearchSchema,
} from "./restaurants.schema";

export const restaurantsEndpoint = typedEndpoint({
  description: "Get restaurants based on search criteria",
  path: ["v1", "restaurants"],
  method: "GET",
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
  },
  requestSchema: restaurantsSearchSchema,
  responseSchema: restaurantsResponseSchema,
  examples: {
    payloads: examples.testData.restaurantSearchExamples,
    urlPathVariables: undefined,
  },
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.CUSTOMER,
    UserRoleValue.DRIVER,
    UserRoleValue.ADMIN,
    UserRoleValue.RESTAURANT_ADMIN,
    UserRoleValue.RESTAURANT_EMPLOYEE,
  ],
  requestUrlSchema: undefinedSchema,
  errorCodes: {
    500: "Internal server error",
  },
});
