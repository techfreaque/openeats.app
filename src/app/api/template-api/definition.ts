import { createEndpoint } from "next-query-portal/client/endpoint";
import { UserRoleValue } from "next-query-portal/shared/types/enums";

import {
  templatePostRequestSchema,
  templatePostRequestUrlParamsSchema,
  templatePostResponseSchema,
} from "./schema";

const templateEndpoint = createEndpoint({
  description: "Register a new user account",
  method: "POST",
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
  allowedRoles: [UserRoleValue.PUBLIC],
  errorCodes: {
    400: "Invalid request data",
    500: "Internal server error",
  },
  dirname: __dirname,
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
