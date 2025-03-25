import { examples } from "@/client-package/schema/api/examples/data";
import { resetPasswordRequestSchema } from "@/client-package/schema/schemas";
import { typedEndpoint } from "@/next-portal/api/endpoint";
import { undefinedSchema } from "@/next-portal/types/common.schema";
import { UserRoleValue } from "@/next-portal/types/enums";
import { messageResponseSchema } from "@/next-portal/types/response.schema";

export const resetPasswordEndpoint = typedEndpoint({
  description: "Send a password reset email",
  method: "POST",
  path: ["v1", "auth", "public", "reset-password"],
  requestSchema: resetPasswordRequestSchema,
  responseSchema: messageResponseSchema,

  examples: {
    payloads: examples.testData.passwordResetExamples,
    urlPathVariables: undefined,
  },
  apiQueryOptions: {
    queryKey: ["reset-password"],
  },
  fieldDescriptions: {
    email: "Email address",
  },
  errorCodes: {
    500: "Internal server error",
    400: "Invalid request data",
  },
  allowedRoles: [UserRoleValue.PUBLIC],
  requestUrlSchema: undefinedSchema,
});
