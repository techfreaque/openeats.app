import "next-vibe/server/utils/server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger } from "next-vibe/shared/utils/logger";

import definitions from "./definition";
import { renderMail } from "./email";

export const POST = apiHandler({
  endpoint: definitions.POST,
  email: {
    afterHandlerEmails: [
      {
        render: renderMail,
        // you can ignore errors even if the email fails to send
        ignoreErrors: false,
      },
    ],
  },
  handler: ({ data, urlVariables, user }) => {
    // you can get validated data from the request body
    debugLogger("data", data);
    // you can get validated data from the URL
    debugLogger("urlVariables", urlVariables);
    // you can get the user object if the user is authenticated
    debugLogger("user", user);
    return {
      success: true,
      data: {
        someOutputValue: "This comes from the server",
      },
    };
  },
});
