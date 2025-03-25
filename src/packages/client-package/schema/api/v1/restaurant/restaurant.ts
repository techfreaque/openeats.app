import {
  restaurantCreateSchema,
  restaurantResponseSchema,
  restaurantUpdateSchema,
} from "@/client-package/schema/schemas";
import { typedEndpoint } from "@/next-portal/api/endpoint";
import { undefinedSchema } from "@/next-portal/types/common.schema";
import { UserRoleValue } from "@/next-portal/types/enums";

import { examples } from "../../examples/data";
import { restaurantGetSchema } from "./restaurants.schema";

export const restaurantGetEndpoint = typedEndpoint({
  description: "Get restaurant by ID",
  path: ["v1", "restaurant"],
  method: "GET",
  fieldDescriptions: {
    restaurantId: "Restaurant ID",
  },
  apiQueryOptions: {
    queryKey: ["restaurant", "{restaurantId}"],
  },
  requestSchema: undefinedSchema,
  responseSchema: restaurantResponseSchema,
  examples: {
    urlPathVariables: examples.testData.restaurantGetExamples,
    payloads: undefined,
  },
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.CUSTOMER,
    UserRoleValue.DRIVER,
    UserRoleValue.ADMIN,
    UserRoleValue.RESTAURANT_ADMIN,
    UserRoleValue.RESTAURANT_EMPLOYEE,
  ],
  requestUrlSchema: restaurantGetSchema,
  errorCodes: {
    404: "Restaurant not found",
    401: "Not authenticated",
    500: "Internal server error",
  },
});

export const restaurantCreateEndpoint = typedEndpoint({
  description: "Create a new restaurant",
  requestSchema: restaurantCreateSchema,
  responseSchema: restaurantResponseSchema,
  path: ["v1", "restaurant"],
  method: "POST",
  apiQueryOptions: {
    queryKey: ["restaurant-create"],
  },
  fieldDescriptions: {
    name: "Restaurant name",
    description: "Restaurant description",
    street: "Street name",
    streetNumber: "Street number",
    zip: "ZIP code",
    city: "City",
    phone: "Phone number",
    email: "Email address",
    image: "Image URL",
    published: "Published status",
    countryId: "Country ID",
    mainCategoryId: "Main category ID",
    userRoles: "User roles",
  },
  examples: {
    payloads: examples.testData.restaurantExamples,
    urlPathVariables: undefined,
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.DRIVER,
    UserRoleValue.ADMIN,
    UserRoleValue.RESTAURANT_ADMIN,
    UserRoleValue.RESTAURANT_EMPLOYEE,
  ],
  requestUrlSchema: undefinedSchema,
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
});

export const restaurantUpdateEndpoint = typedEndpoint({
  description: "Update a new restaurant",
  requestSchema: restaurantUpdateSchema,
  responseSchema: restaurantResponseSchema,
  path: ["v1", "restaurant"],
  method: "PUT",
  apiQueryOptions: {
    queryKey: ["restaurant-update"],
  },
  fieldDescriptions: {
    name: "Restaurant name",
    description: "Restaurant description",
    street: "Street name",
    streetNumber: "Street number",
    zip: "ZIP code",
    city: "City",
    phone: "Phone number",
    email: "Email address",
    image: "Image URL",
    published: "Published status",
    countryId: "Country ID",
    mainCategoryId: "Main category ID",
    userRoles: "User roles",
  },
  examples: {
    payloads: examples.testData.restaurantExamples,
    urlPathVariables: undefined,
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.DRIVER,
    UserRoleValue.ADMIN,
    UserRoleValue.RESTAURANT_ADMIN,
    UserRoleValue.RESTAURANT_EMPLOYEE,
  ],
  requestUrlSchema: undefinedSchema,
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
});
