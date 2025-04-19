import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { listUisRequestSchema, listUisResponseSchema } from "./schema";

const listUisEndpoint = createEndpoint({
  description: "List UI components",
  path: ["v1", "website-editor", "ui", "list"],
  method: Methods.GET,
  requestSchema: undefinedSchema,
  responseSchema: listUisResponseSchema,
  requestUrlSchema: listUisRequestSchema,
  fieldDescriptions: {
    mode: "The mode to list UIs (latest, most_liked, most_viewed)",
    start: "The start index for pagination",
    limit: "The maximum number of UIs to return",
    timeRange: "The time range to filter UIs (1h, 24h, 7d, 30d, all)",
  },
  apiQueryOptions: {
    queryKey: ["list-uis"],
  },
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: {
      default: {
        mode: "latest",
        start: 0,
        limit: 10,
        timeRange: "all",
      },
    },
    responses: {
      default: {
        uis: [
          {
            id: "ui-id",
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
            forkedFrom: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    },
  },
});

/**
 * Website Editor UI List API endpoints
 */
const definition = {
  ...listUisEndpoint,
};

export default definition;
