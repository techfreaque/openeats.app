import { examples } from "@/client-package/schema/api/examples/data";
import { resetPasswordConfirmSchema } from "@/client-package/schema/schemas";
import { typedEndpoint } from "@/next-portal/api/endpoint";
import { undefinedSchema } from "@/next-portal/types/common.schema";
import { UserRoleValue } from "@/next-portal/types/enums";
import { messageResponseSchema } from "@/next-portal/types/response.schema";

export const resetPasswordConfirmEndpoint = typedEndpoint({
  description: "Confirm a password reset request",
  method: "POST",
  path: ["v1", "auth", "public", "reset-password"],
  requestSchema: resetPasswordConfirmSchema,
  responseSchema: messageResponseSchema,
  apiQueryOptions: {
    queryKey: ["resetPasswordConfirm"],
  },
  examples: {
    payloads: examples.testData.passwordResetConfirmExamples,
    urlPathVariables: undefined,
  },
  fieldDescriptions: {
    token: "Password reset token",
    email: "Email address",
    password: "New password",
    confirmPassword: "Confirm new password",
  },
  errorCodes: {
    500: "Internal server error",
    400: "Invalid request data",
  },
  allowedRoles: [UserRoleValue.PUBLIC],
  requestUrlSchema: undefinedSchema,
});
