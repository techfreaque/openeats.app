import { createEndpoint } from "next-query-portal/client/endpoint";
import { undefinedSchema } from "next-query-portal/shared/types/common.schema";
import { Methods } from "next-query-portal/shared/types/endpoint";
import { UserRoleValue } from "next-query-portal/shared/types/enums";

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
    urlPathVariables: undefined,
    payloads: undefined,
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
        firstName: "John",
        lastName: "Doe",
        imageUrl: "/placeholder.svg",
      },
    },
  },
});

export default {
  ...meEndpoint,
  ...meUpdateEndpoint,
};
