import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import type { ExamplesList } from "next-vibe/shared/types/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import type { CategoryUpdateType } from "./schema";
import {
  categoryCreateSchema,
  categoryResponseSchema,
  categoryUpdateSchema,
} from "./schema";

const defaultCategoryExampleId = uuidv4();

export const categoryExamples: ExamplesList<
  CategoryUpdateType,
  "example1" | "example2" | "default"
> = {
  default: {
    id: defaultCategoryExampleId,
    name: "Pizza",
    image: "/placeholder.svg",
    parentCategoryId: null,
    published: true,
  },
  example1: {
    id: uuidv4(),
    name: "Burgers",
    image: "/placeholder.svg",
    parentCategoryId: defaultCategoryExampleId,
    published: true,
  },
  example2: {
    id: defaultCategoryExampleId,
    name: "Kebap",
    image: "/placeholder.svg",
    parentCategoryId: null,
    published: false,
  },
};

const categoryCreateEndpoint = createEndpoint({
  description: "Create a new category",
  requestSchema: categoryCreateSchema,
  responseSchema: categoryResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "category"],
  method: Methods.POST,
  apiQueryOptions: {
    queryKey: ["category-create"],
  },
  fieldDescriptions: {
    name: "Category name",
    image: "Image URL",
    parentCategoryId: "Parent category ID",
    published: "Published status",
  },
  examples: {
    payloads: categoryExamples,
    urlPathVariables: undefined,
    responses: categoryExamples,
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
});

const categoryUpdateEndpoint = createEndpoint({
  description: "Update a category",
  requestSchema: categoryUpdateSchema,
  responseSchema: categoryResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "category"],
  method: Methods.PUT,
  apiQueryOptions: {
    queryKey: ["category-update"],
  },
  fieldDescriptions: {
    id: "Category ID",
    name: "Category name",
    image: "Image URL",
    parentCategoryId: "Parent category ID",
    published: "Published status",
  },
  examples: {
    payloads: categoryExamples,
    urlPathVariables: undefined,
    responses: categoryExamples,
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
});

const categoryGetEndpoint = createEndpoint({
  description: "Get all categories",
  requestSchema: undefinedSchema,
  responseSchema: z.array(categoryResponseSchema),
  requestUrlSchema: undefinedSchema,
  path: ["v1", "restaurant-config"],
  method: Methods.GET,
  apiQueryOptions: {
    queryKey: ["category-get"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  },
  fieldDescriptions: undefined,
  examples: {
    payloads: undefined,
    urlPathVariables: undefined,
    responses: {
      default: [
        {
          id: "category-id-1",
          name: "Pizza",
          image: "/placeholder.svg",
          parentCategoryId: null,
          published: true,
        },
        {
          id: "category-id-2",
          name: "Burgers",
          image: "/placeholder.svg",
          parentCategoryId: "category-id-1",
          published: true,
        },
      ],
    },
  },
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
});

const categoryEndpoints = {
  ...categoryUpdateEndpoint,
  ...categoryCreateEndpoint,
  ...categoryGetEndpoint,
};
export default categoryEndpoints;
