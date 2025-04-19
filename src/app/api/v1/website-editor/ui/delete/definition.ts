import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { deleteUiRequestSchema, deleteUiResponseSchema } from "./schema";

const deleteUiEndpoint = createEndpoint({
  description: "Delete a UI component",
  path: ["v1", "website-editor", "ui", "delete"],
  method: Methods.DELETE,
  requestSchema: undefinedSchema,
  responseSchema: deleteUiResponseSchema,
  requestUrlSchema: deleteUiRequestSchema,
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
    403: "Unauthorized",
    404: "UI component not found",
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: {
      default: {
        id: "ui-id",
      },
    },
    responses: {
      default: {
        success: true,
      },
    },
  },
});

/**
 * Website Editor UI Delete API endpoints
 */
const definition = {
  ...deleteUiEndpoint,
};

export default definition;
