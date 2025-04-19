import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { z } from "zod";

import { selectUiSchema } from "../../db";

/**
 * Request schema for getting UI details
 */
export const getUiDetailRequestSchema = z.object({
  id: z.string().describe("The ID of the UI to get"),
});

/**
 * Response schema for getting UI details
 */
export const getUiDetailResponseSchema = selectUiSchema.extend({
  subPrompts: z.array(
    z.object({
      id: z.string(),
      UIId: z.string(),
      SUBId: z.string(),
      createdAt: z.date(),
      subPrompt: z.string(),
      modelId: z.string().nullable().optional(),
      code: z
        .object({
          id: z.string(),
          code: z.string(),
        })
        .nullable()
        .optional(),
    }),
  ),
  user: z.object({
    id: z.string(),
    firstName: z.string(),
    imageUrl: z.string().nullable().optional(),
  }),
  forkedFrom: z.string().nullable().optional(),
});

/**
 * Endpoint for getting UI details
 */
const getUiDetailEndpoint = createEndpoint({
  description: "Get UI details by ID",
  path: ["v1", "website-editor", "ui", "detail"],
  method: Methods.GET,
  requestSchema: undefinedSchema,
  responseSchema: getUiDetailResponseSchema,
  requestUrlSchema: getUiDetailRequestSchema,
  fieldDescriptions: {
    id: "The ID of the UI to get",
  },
  apiQueryOptions: {
    queryKey: ["get-ui-detail"],
  },
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ] as const,
  errorCodes: {
    401: "Not authenticated",
    404: "UI not found",
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
        id: "ui-id",
        uiType: "shadcn-react",
        userId: "user-id",
        prompt: "A beautiful landing page",
        public: true,
        img: "base64-image-data",
        viewCount: 10,
        likesCount: 5,
        forkedFrom: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subPrompts: [
          {
            id: "subprompt-id",
            UIId: "ui-id",
            SUBId: "a-0",
            createdAt: new Date(),
            subPrompt: "A beautiful landing page",
            modelId: "model-id",
            code: {
              id: "code-id",
              code: "<div>Code here</div>",
            },
          },
        ],
        user: {
          id: "user-id",
          firstName: "John",
          imageUrl: "https://example.com/image.jpg",
        },
      },
    },
  },
});

/**
 * Website Editor UI Detail API endpoints
 */
const definition = {
  ...getUiDetailEndpoint,
};

export default definition;
