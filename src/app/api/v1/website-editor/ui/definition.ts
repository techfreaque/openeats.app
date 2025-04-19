import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import {
  deleteUiRequestSchema,
  deleteUiResponseSchema,
  updateUiRequestSchema,
  updateUiResponseSchema,
} from "./schema";

const updateUiEndpoint = createEndpoint({
  description: "Update a UI component",
  path: ["v1", "website-editor", "ui"],
  method: Methods.PUT,
  requestSchema: updateUiRequestSchema,
  responseSchema: updateUiResponseSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: {
    id: "The ID of the UI component",
    img: "The image of the UI component",
    prompt: "The prompt of the UI component",
  },
  apiQueryOptions: {
    queryKey: ["update-ui"],
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    401: "Not authenticated",
    404: "UI component not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        id: "ui-id",
        img: "base64-image",
        prompt: "Create a responsive navbar",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        id: "ui-id",
        img: "base64-image",
        prompt: "Create a responsive navbar",
      },
    },
  },
});

const deleteUiEndpoint = createEndpoint({
  description: "Delete a UI component",
  path: ["v1", "website-editor", "ui"],
  method: Methods.DELETE,
  requestSchema: deleteUiRequestSchema,
  responseSchema: deleteUiResponseSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: {
    id: "The ID of the UI component",
  },
  apiQueryOptions: {
    queryKey: ["delete-ui"],
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    401: "Not authenticated",
    404: "UI component not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        id: "ui-id",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        success: true,
      },
    },
  },
});

/**
 * Website Editor UI API endpoints
 */
const definition = {
  PUT: updateUiEndpoint,
  DELETE: deleteUiEndpoint,
};

export default definition;
