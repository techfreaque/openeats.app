import { examples } from "@/client-package/schema/api/examples/data";
import { registerBaseSchema } from "@/client-package/schema/schemas";
import { typedEndpoint } from "@/next-portal/api/endpoint";
import { undefinedSchema } from "@/next-portal/types/common.schema";
import { UserRoleValue } from "@/next-portal/types/enums";

import { loginResponseSchema } from "./login.schema";

export const registerEndpoint = typedEndpoint({
  description: "Register a new user account",
  requestSchema: registerBaseSchema,
  responseSchema: loginResponseSchema,
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["register"],
  },
  fieldDescriptions: {
    firstName: "User's first name",
    lastName: "User's last name",
    email: "User's email address",
    imageUrl: "URL to user's profile image",
    password: "User's password (min 8 characters)",
    confirmPassword: "Confirm password (must match password)",
  },
  allowedRoles: [UserRoleValue.PUBLIC],
  errorCodes: {
    400: "Invalid request data",
    409: "Email already in use",
    500: "Internal server error",
  },
  path: ["v1", "auth", "public", "register"],
  method: "POST",
  examples: {
    payloads: examples.testData.userExamples,
    urlPathVariables: undefined,
  },
});
