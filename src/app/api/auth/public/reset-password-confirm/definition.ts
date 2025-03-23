import { createEndpoint } from "next-query-portal/client/endpoint";
import { undefinedSchema } from "next-query-portal/shared/types/common.schema";
import { UserRoleValue } from "next-query-portal/shared/types/enums";
import { messageResponseSchema } from "next-query-portal/shared/types/response.schema";

import registerEndpoint from "../register/definition";
import { resetPasswordConfirmSchema } from "./schema";

const resetPasswordConfirmEndpoint = createEndpoint({
  description: "Confirm a password reset request",
  method: "POST",
  dirname: __dirname,
  requestSchema: resetPasswordConfirmSchema,
  responseSchema: messageResponseSchema,
  apiQueryOptions: {
    queryKey: ["resetPasswordConfirm"],
  },
  examples: {
    payloads: {
      default: {
        id: "9bfb43b8-c361-4f3e-b512-ec2ced9bf013",
        email: registerEndpoint.examples.payloads.default.email,
        token: "COPY_FROM_EMAIL",
        password: "newpassword",
        confirmPassword: "newpassword",
      },
      example1: {
        id: "9bfb43b8-c361-4f3e-b512-ec2ced9bf011",
        email: registerEndpoint.examples.payloads["customer"]!["email"],
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
