import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { forkUiRequestSchema, forkUiResponseSchema } from "./schema";

const forkUiEndpoint = createEndpoint({
  description: "Fork a UI component",
  path: ["v1", "website-editor", "ui", "fork"],
  method: Methods.POST,
  requestSchema: forkUiRequestSchema,
  responseSchema: forkUiResponseSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: {
    uiId: "The ID of the UI component to fork",
  },
  apiQueryOptions: {
    queryKey: ["fork-ui"],
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    401: "Not authenticated",
    403: "Cannot fork your own UI",
    404: "UI not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        uiId: "ui-id",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        id: "forked-ui-id",
        uiType: "component",
        user: {
          id: "user-id",
          firstName: "John",
          imageUrl: "https://example.com/avatar.jpg",
        },
        prompt: "Create a responsive navbar",
        public: true,
        img: "https://example.com/image.jpg",
        viewCount: 0,
        likesCount: 0,
        forkedFrom: "original-ui-id",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subPrompts: [
          {
            id: "subprompt-id",
            UIId: "forked-ui-id",
            SUBId: "sub-id-0",
            createdAt: new Date().toISOString(),
            subPrompt: "Create a responsive navbar",
            modelId: "model-id",
            code: {
              id: "code-id",
              code: "<div>Code here</div>",
            },
          },
        ],
      },
    },
  },
});

/**
 * Website Editor UI Fork API endpoints
 */
const definition = {
  ...forkUiEndpoint,
};

export default definition;
