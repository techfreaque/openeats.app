import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { loginResponseSchema } from "../public/login/schema";
import { userResponseSchema, userUpdateRequestSchema } from "./schema";

const meEndpoint = createEndpoint({
  description: "Get current authenticated user's information",
  path: ["v1", "auth", "me"],
  method: Methods.GET,
  requestSchema: undefinedSchema,
  responseSchema: loginResponseSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: undefined,
  apiQueryOptions: {
    queryKey: ["user"],
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.COURIER,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    401: "Not authenticated",
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: undefined,
    responses: {
      default: {
        user: {
          id: "user-id",
          email: "user@example.com",
          firstName: "John",
          lastName: "Doe",
          imageUrl: "https://example.com/avatar.jpg",
          userRoles: [
            {
              id: "role-id",
              role: "CUSTOMER",
              partnerId: null,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: "jwt-token-example",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  },
});

const meUpdateEndpoint = createEndpoint({
  description: "Update current authenticated user's information",
  path: ["v1", "auth", "me"],
  method: Methods.POST,
  requestSchema: userUpdateRequestSchema,
  responseSchema: userResponseSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: {
    email: "Email of the user",
    firstName: "First name of the user",
    lastName: "Last name of the user",
    imageUrl: "Image URL of the user",
  },
  apiQueryOptions: {
    queryKey: ["update-user"],
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.COURIER,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    401: "Not authenticated",
    500: "Internal server error",
  },
  examples: {
    urlPathVariables: undefined,
    payloads: {
      default: {
        email: "customer@example.com",
        firstName: "John",
        lastName: "Doe",
        imageUrl: "/placeholder.svg",
      },
    },
    responses: {
      default: {
        id: "user-id",
        email: "user@example.com",
        firstName: "John",
        lastName: "Doe",
        imageUrl: "https://example.com/avatar.jpg",
        userRoles: [
          {
            id: "role-id",
            role: "CUSTOMER",
            partnerId: null,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  },
});

/**
 * Auth API endpoints
 */
const definition = {
  ...meEndpoint,
  ...meUpdateEndpoint,
};

export default definition;
