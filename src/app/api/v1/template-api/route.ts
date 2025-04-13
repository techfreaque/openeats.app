import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger } from "next-vibe/shared/utils/logger";

import definitions from "./definition";
import { renderMail } from "./email";

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
  handler: async ({ data, urlVariables, user }) => {
    try {
      // Log request data for debugging
      debugLogger("Template create request", { data, urlVariables, user });

      // In a real implementation, you would create a resource in the database
      // const newResource = await db.template.create({
      //   data: {
      //     ...data,
      //     createdBy: user.id,
      //   },
      // });

      // Return success response
      return {
        success: true,
        data: {
          someOutputValue: "This comes from the server",
        },
      };
    } catch (error) {
      // Log and return error
      debugLogger("Error creating template resource", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        errorCode: 500,
      };
    }
  },
});

/**
 * GET handler for retrieving template resources
 */
export const GET = apiHandler({
  endpoint: definitions.GET,
  email: {}, // No emails for GET requests
  handler: async ({ data, urlVariables, user }) => {
    try {
      // Log request data for debugging
      debugLogger("Template get request", { data, urlVariables, user });

      // In a real implementation, you would fetch resources from the database
      // const resources = await db.template.findMany({
      //   where: {
      //     ...data,
      //     ...urlVariables,
      //   },
      // });

      // Return success response
      return {
        success: true,
        data: {
          someOutputValue: "This comes from the server",
        },
      };
    } catch (error) {
      // Log and return error
      debugLogger("Error retrieving template resources", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        errorCode: 500,
      };
    }
  },
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
  handler: async ({ data, urlVariables, user }) => {
    try {
      // Log request data for debugging
      debugLogger("Template update request", { data, urlVariables, user });

      // In a real implementation, you would update a resource in the database
      // const updatedResource = await db.template.update({
      //   where: {
      //     id: urlVariables.someValueFromTheRouteUrl,
      //   },
      //   data: {
      //     ...data,
      //     updatedBy: user.id,
      //   },
      // });

      // Return success response
      return {
        success: true,
        data: {
          someOutputValue: "This comes from the server",
        },
      };
    } catch (error) {
      // Log and return error
      debugLogger("Error updating template resource", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        errorCode: 500,
      };
    }
  },
});
