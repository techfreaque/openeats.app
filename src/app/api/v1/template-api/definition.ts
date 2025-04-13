import { createEndpoint } from "next-vibe/client/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import {
  templatePostRequestSchema,
  templatePostRequestUrlParamsSchema,
  templatePostResponseSchema,
} from "./schema";

/**
 * Template API endpoints
 * This is a reference implementation for API endpoints
 */

/**
 * Create endpoint for template API
 */
const templateCreateEndpoint = createEndpoint({
  description: "Create a new template resource",
  method: Methods.POST,
  requestSchema: templatePostRequestSchema,
  responseSchema: templatePostResponseSchema,
  requestUrlSchema: templatePostRequestUrlParamsSchema,
  apiQueryOptions: {
    // queryKey is used to identify the query in the cache
    queryKey: ["template-key"],
    // Don't cache mutations
    staleTime: 0,
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
    401: "Not authenticated",
    403: "Insufficient permissions",
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
    responses: {
      default: {
        someOutputValue: "This comes from the server",
      },
    },
  },
});

/**
 * Get endpoint for template API
 */
const templateGetEndpoint = createEndpoint({
  description: "Get template resource",
  method: Methods.GET,
  requestSchema: templatePostRequestSchema,
  responseSchema: templatePostResponseSchema,
  requestUrlSchema: templatePostRequestUrlParamsSchema,
  apiQueryOptions: {
    // queryKey is used to identify the query in the cache
    queryKey: ["template-key"],
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
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
    401: "Not authenticated",
    403: "Insufficient permissions",
    404: "Resource not found",
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
    responses: {
      default: {
        someOutputValue: "This comes from the server",
      },
    },
  },
});

/**
 * Update endpoint for template API
 */
const templateUpdateEndpoint = createEndpoint({
  description: "Update template resource",
  method: Methods.PUT,
  requestSchema: templatePostRequestSchema,
  responseSchema: templatePostResponseSchema,
  requestUrlSchema: templatePostRequestUrlParamsSchema,
  apiQueryOptions: {
    // queryKey is used to identify the query in the cache
    queryKey: ["template-key"],
    // Don't cache mutations
    staleTime: 0,
  },
  fieldDescriptions: {
    someInputValue: "Some input value",
    someValueFromTheRouteUrl: "Some value from the route URL",
  },
  allowedRoles: [UserRoleValue.ADMIN, UserRoleValue.CUSTOMER],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Insufficient permissions",
    404: "Resource not found",
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
    responses: {
      default: {
        someOutputValue: "This comes from the server",
      },
    },
  },
});

const templateEndpoints = {
  ...templateCreateEndpoint,
  ...templateUpdateEndpoint,
  ...templateGetEndpoint,
};

export default templateEndpoints;
