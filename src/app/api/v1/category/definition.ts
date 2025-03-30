import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import type { ExamplesList } from "next-vibe/shared/types/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { v4 as uuidv4 } from "uuid";

import type { CategoryUpdateType } from "./schema";
import {
  categoryCreateSchema,
  categoryResponseSchema,
  categoryUpdateSchema,
} from "./schema";

const categoryExamples: ExamplesList<CategoryUpdateType, "example1"> = {
  default: {
    id: uuidv4(),
    name: "Pizza",
    image: "https://www.example.com/pizza.jpg",
  },
  example1: {
    id: uuidv4(),
    name: "Burgers",
    image: "https://www.example.com/burgers.jpg",
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
  },
  examples: {
    payloads: categoryExamples,
    urlPathVariables: undefined,
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
  },
  examples: {
    payloads: categoryExamples,
    urlPathVariables: undefined,
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
export default {
  ...categoryUpdateEndpoint,
  ...categoryCreateEndpoint,
};
