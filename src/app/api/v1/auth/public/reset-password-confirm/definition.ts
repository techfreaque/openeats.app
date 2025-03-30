import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { messageResponseSchema } from "next-vibe/shared/types/response.schema";

import { createEndpoint } from "@/packages/next-vibe/client/endpoint";

import registerEndpoint from "../register/definition";
import { resetPasswordConfirmSchema } from "./schema";

const resetPasswordConfirmEndpoint = createEndpoint({
  description: "Confirm a password reset request",
  method: Methods.POST,
  path: ["v1", "auth", "public", "reset-password-confirm"],
  requestSchema: resetPasswordConfirmSchema,
  responseSchema: messageResponseSchema,
  apiQueryOptions: {
    queryKey: ["resetPasswordConfirm"],
  },
  examples: {
    payloads: {
      default: {
        id: "9bfb43b8-c361-4f3e-b512-ec2ced9bf013",
        email: registerEndpoint.POST.examples.payloads.default.email,
        token: "COPY_FROM_EMAIL",
        password: "newpassword",
        confirmPassword: "newpassword",
      },
      example1: {
        id: "9bfb43b8-c361-4f3e-b512-ec2ced9bf011",
        email: registerEndpoint.POST.examples.payloads.customer.email,
        token: "COPY_FROM_EMAIL",
        password: "newpassword",
        confirmPassword: "newpassword",
      },
    },
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

export default resetPasswordConfirmEndpoint;
