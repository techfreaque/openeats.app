import { createEndpoint } from "next-query-portal/client/endpoint";
import { Methods } from "next-query-portal/shared/types/endpoint";
import { UserRoleValue } from "next-query-portal/shared/types/enums";

import {
  templatePostRequestSchema,
  templatePostRequestUrlParamsSchema,
  templatePostResponseSchema,
} from "./schema";

const templateEndpoint = createEndpoint({
  description: "Register a new user account",
  method: Methods.POST,
  requestSchema: templatePostRequestSchema,
  responseSchema: templatePostResponseSchema,
  requestUrlSchema: templatePostRequestUrlParamsSchema,
  apiQueryOptions: {
    // queryKey is used to identify the query in the cache
    queryKey: ["template-key"],
  },
  fieldDescriptions: {
    someInputValue: "Some input value",
    someValueFromTheRouteUrl: "Some value from the route URL",
  },
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.ADMIN,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
  ],
  errorCodes: {
    400: "Invalid request data",
    500: "Internal server error",
  },
  path: ["template-api"],
  examples: {
    payloads: {
      default: {
        someInputValue: "Some input value",
      },
    },
    urlPathVariables: {
      default: {
        someValueFromTheRouteUrl: "route-url-value",
      },
    },
  },
});

export default templateEndpoint;
