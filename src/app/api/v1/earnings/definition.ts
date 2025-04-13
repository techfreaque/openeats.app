import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import {
  earningCreateSchema,
  earningResponseSchema,
  earningsResponseSchema,
} from "./schema";

/**
 * Earnings API endpoint definitions
 * Provides driver earnings management functionality
 */

// Example data
const exampleEarning = {
  id: "earning-id-1",
  userId: "user-id-1",
  date: new Date().toISOString(),
  amount: 120.5,
  deliveries: 10,
  createdAt: new Date().toISOString(),
};

/**
 * GET endpoint for retrieving driver earnings
 */
const earningsGetEndpoint = createEndpoint({
  description: "Get driver earnings",
  method: Methods.GET,
  requestSchema: undefinedSchema,
  responseSchema: earningsResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "earnings"],
  apiQueryOptions: {
    queryKey: ["earnings"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  },
  fieldDescriptions: undefined,
  allowedRoles: [UserRoleValue.ADMIN, UserRoleValue.COURIER],
  errorCodes: {
    401: "Not authenticated",
    403: "Not authorized",
    404: "Driver profile not found",
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: undefined,
    responses: {
      default: [exampleEarning],
    },
  },
});

/**
 * POST endpoint for creating a new earning record
 */
const earningCreateEndpoint = createEndpoint({
  description: "Create a new earning record",
  method: Methods.POST,
  requestSchema: earningCreateSchema,
  responseSchema: earningResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "earnings"],
  apiQueryOptions: {
    queryKey: ["earning-create"],
  },
  fieldDescriptions: {
    userId: "User ID",
    date: "Earning date",
    amount: "Earning amount",
    deliveries: "Number of deliveries",
  },
  allowedRoles: [UserRoleValue.ADMIN],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    404: "User not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        userId: "user-id-1",
        date: new Date().toISOString(),
        amount: 120.5,
        deliveries: 10,
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: exampleEarning,
    },
  },
});

/**
 * Earnings API endpoints
 */
const earningsEndpoints = {
  ...earningsGetEndpoint,
  ...earningCreateEndpoint,
};

export default earningsEndpoints;
