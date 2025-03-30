import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { restaurantsResponseSchema, restaurantsSearchSchema } from "./schema";

const restaurantsEndpoint = createEndpoint({
  description: "Get restaurants based on search criteria",
  path: ["v1", "restaurants"],
  method: Methods.GET,
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
    payloads: {
      default: {
        search: "pizza",
        countryCode: "DE",
        zip: "12345",
        street: "Example street",
        streetNumber: "123",
        radius: 10,
        rating: 4,
        currentlyOpen: true,
        page: 1,
        limit: 30,
      },
    },
    urlPathVariables: undefined,
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
