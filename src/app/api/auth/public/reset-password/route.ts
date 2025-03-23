import "server-only";

import { apiHandler } from "next-query-portal/server/endpoints/core/api-handler";

import resetPasswordEndpoint from "./definition";
import { renderResetPasswordMail } from "./email";

export const POST = apiHandler({
  endpoint: resetPasswordEndpoint,
  // gets handled by the mail template
  handler: () => ({ success: true, data: "Password reset email sent!" }),
  email: {
    afterHandlerEmails: [
      {
        ignoreErrors: true,
        render: renderResetPasswordMail,
      },
    ],
  },
});
