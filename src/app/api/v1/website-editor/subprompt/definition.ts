import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import {
  createSubPromptRequestSchema,
  createSubPromptResponseSchema,
  getSubPromptRequestSchema,
  getSubPromptResponseSchema,
} from "./schema";

const createSubPromptEndpoint = createEndpoint({
  description: "Create a new subprompt for a UI component",
  path: ["v1", "website-editor", "subprompt"],
  method: Methods.POST,
  requestSchema: createSubPromptRequestSchema,
  responseSchema: createSubPromptResponseSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: {
    subPrompt: "The subprompt text",
    UIId: "The ID of the UI component",
    parentSUBId: "The parent subprompt ID",
    code: "The code for the subprompt",
    modelId: "The ID of the model used to generate the code",
  },
  apiQueryOptions: {
    queryKey: ["create-subprompt"],
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
        subPrompt: "Create a responsive navbar",
        UIId: "ui-id",
        parentSUBId: "parent-sub-id-0",
        code: "<div>Code here</div>",
        modelId: "model-id",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        id: "subprompt-id",
        createdAt: new Date().toISOString(),
        subPrompt: "Create a responsive navbar",
        UIId: "ui-id",
        SUBId: "parent-sub-id-1",
        modelId: "model-id",
        code: {
          id: "code-id",
          code: "<div>Code here</div>",
        },
      },
    },
  },
});

const getSubPromptEndpoint = createEndpoint({
  description: "Get a subprompt by ID",
  path: ["v1", "website-editor", "subprompt"],
  method: Methods.GET,
  requestSchema: undefinedSchema,
  responseSchema: getSubPromptResponseSchema,
  requestUrlSchema: getSubPromptRequestSchema,
  fieldDescriptions: {
    id: "The ID of the subprompt",
  },
  apiQueryOptions: {
    queryKey: ["get-subprompt"],
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    401: "Not authenticated",
    404: "Subprompt not found",
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: {
      default: {
        id: "subprompt-id",
      },
    },
    responses: {
      default: {
        id: "subprompt-id",
        createdAt: new Date().toISOString(),
        subPrompt: "Create a responsive navbar",
        UIId: "ui-id",
        SUBId: "parent-sub-id-1",
        modelId: "model-id",
        code: {
          id: "code-id",
          code: "<div>Code here</div>",
        },
      },
    },
  },
});

/**
 * Website Editor Subprompt API endpoints
 */
const definition = {
  ...createSubPromptEndpoint,
  ...getSubPromptEndpoint,
};

export default definition;
