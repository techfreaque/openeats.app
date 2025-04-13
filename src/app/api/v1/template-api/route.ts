import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";

import definitions from "./definition";
import { renderMail } from "./email";
import { createTemplate, getTemplates, updateTemplate } from "./route-handler";

/**
 * Template API route handlers
 * This is a reference implementation for API route handlers
 */

/**
 * POST handler for creating a new template resource
 */
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
  handler: createTemplate,
});

/**
 * GET handler for retrieving template resources
 */
export const GET = apiHandler({
  endpoint: definitions.GET,
  email: {}, // No emails for GET requests
  handler: getTemplates,
});

/**
 * PUT handler for updating template resources
 */
export const PUT = apiHandler({
  endpoint: definitions.PUT,
  email: {
    afterHandlerEmails: [
      {
        render: renderMail,
        ignoreErrors: true, // Ignore email errors for updates
      },
    ],
  },
  handler: updateTemplate,
});
