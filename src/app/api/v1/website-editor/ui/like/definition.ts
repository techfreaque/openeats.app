import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { toggleLikeRequestSchema, toggleLikeResponseSchema } from "./schema";

const toggleLikeEndpoint = createEndpoint({
  description: "Toggle like on a UI component",
  path: ["v1", "website-editor", "ui", "like"],
  method: Methods.POST,
  requestSchema: toggleLikeRequestSchema,
  responseSchema: toggleLikeResponseSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: {
    UIId: "The ID of the UI component",
  },
  apiQueryOptions: {
    queryKey: ["toggle-like"],
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    401: "Not authenticated",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        UIId: "ui-id",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        liked: true,
      },
    },
  },
});

/**
 * Website Editor UI Like API endpoints
 */
const definition = {
  ...toggleLikeEndpoint,
};

export default definition;
