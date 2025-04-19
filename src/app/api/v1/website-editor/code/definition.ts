import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { getCodeRequestSchema, getCodeResponseSchema } from "./schema";

const getCodeEndpoint = createEndpoint({
  description: "Get code by ID",
  path: ["v1", "website-editor", "code"],
  method: Methods.GET,
  requestSchema: undefinedSchema,
  responseSchema: getCodeResponseSchema,
  requestUrlSchema: getCodeRequestSchema,
  fieldDescriptions: {
    id: "The ID of the code",
  },
  apiQueryOptions: {
    queryKey: ["get-code"],
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    401: "Not authenticated",
    404: "Code not found",
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: {
      default: {
        id: "code-id",
      },
    },
    responses: {
      default: {
        id: "code-id",
        code: "<div>Code here</div>",
      },
    },
  },
});

/**
 * Website Editor Code API endpoints
 */
const definition = {
  ...getCodeEndpoint,
};

export default definition;
