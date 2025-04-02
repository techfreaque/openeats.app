import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import type { ExamplesList } from "next-vibe/shared/types/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import registerEndpoint from "../auth/public/register/definition";
import { categoryExamples } from "../category/definition";
import type { RestaurantUpdateType } from "./schema/restaurant.schema";
import {
  restaurantCreateSchema,
  restaurantGetSchema,
  restaurantResponseSchema,
  restaurantUpdateSchema,
} from "./schema/restaurant.schema";

export const restaurantExamples: ExamplesList<
  RestaurantUpdateType,
  "default" | "example1" | "example2"
> = {
  default: {
    id: "a50e2a24-bca7-4a98-aa59-79c6c11c2533",
    name: "Restaurant Test",
    description: "Best pizza in town!",
    image: "/placeholder.svg",
    phone: "+1234567890",
    email: `restaurant${Math.random()}@example.com`,
    published: true,
    mainCategoryId: categoryExamples.example1.id,
    street: "Antersdorf",
    streetNumber: "38",
    city: "Simbach am Inn",
    zip: "84359",
    countryId: "DE",
    userRoles: [
      {
        userId: registerEndpoint.POST.examples.payloads.restaurantAdmin.id!,
        role: UserRoleValue.PARTNER_ADMIN,
      },
    ],
  },
  example1: {
    id: "a50e2a24-bca7-4a98-aa59-79c6c11c2547",
    name: "Da Murauer",
    description: "Best pizza in town!",
    image: "/placeholder.svg",
    phone: "+1234567890",
    email: "contact@pizzapalace.com",
    published: true,
    mainCategoryId: categoryExamples.example1.id,
    street: "Antersdorf",
    streetNumber: "38",
    city: "Simbach am Inn",
    zip: "84359",
    countryId: "DE",
    userRoles: [
      {
        userId: registerEndpoint.POST.examples.payloads.restaurantAdmin.id!,
        role: UserRoleValue.PARTNER_ADMIN,
      },
    ],
  },
  example2: {
    id: "e74ce4c1-418d-4df1-ae06-419c703f61dd",
    name: "Burger Barn",
    description: "Juicy burgers and great fries!",
    image: "/placeholder.svg",
    phone: "+1234567891",
    email: "contact@burgerbarn.com",
    published: true,
    mainCategoryId: categoryExamples.example2.id,
    userRoles: [
      {
        userId: registerEndpoint.POST.examples.payloads.restaurantAdmin.id!,
        role: UserRoleValue.PARTNER_ADMIN,
      },
    ],
    street: "Verladestraße",
    streetNumber: "13",
    city: "Braunau am Inn",
    zip: "5280",
    countryId: "AT",
  },
};

export const restaurantGetEndpoint = createEndpoint({
  description: "Get restaurant by ID",
  path: ["v1", "restaurant"],
  method: Methods.GET,
  fieldDescriptions: {
    restaurantId: "Restaurant ID",
  },
  apiQueryOptions: {
    queryKey: ["restaurant", "{restaurantId}"],
  },
  requestSchema: restaurantGetSchema,
  responseSchema: restaurantResponseSchema,
  requestUrlSchema: undefinedSchema,
  examples: {
    payloads: {
      default: {
        restaurantId: restaurantExamples.default.id,
      },
    },
    urlPathVariables: undefined,
  },
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    404: "Restaurant not found",
    401: "Not authenticated",
    500: "Internal server error",
  },
});

export const restaurantCreateEndpoint = createEndpoint({
  description: "Create a new restaurant",
  requestSchema: restaurantCreateSchema,
  responseSchema: restaurantResponseSchema,
  path: ["v1", "restaurant"],
  method: Methods.POST,
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
    countryId: "Country ID",
    mainCategoryId: "Main category ID",
    userRoles: "User roles",
  },
  examples: {
    payloads: restaurantExamples,
    urlPathVariables: undefined,
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  requestUrlSchema: undefinedSchema,
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
});

const restaurantUpdateEndpoint = createEndpoint({
  description: "Update a new restaurant",
  requestSchema: restaurantUpdateSchema,
  responseSchema: restaurantResponseSchema,
  path: ["v1", "restaurant"],
  method: Methods.PUT,
  apiQueryOptions: {
    queryKey: ["restaurant-update"],
  },
  fieldDescriptions: {
    id: "Restaurant ID",
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
    payloads: restaurantExamples,
    urlPathVariables: undefined,
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  requestUrlSchema: undefinedSchema,
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
});
const restaurantEndpoint = {
  ...restaurantGetEndpoint,
  ...restaurantCreateEndpoint,
  ...restaurantUpdateEndpoint,
};
export default restaurantEndpoint;
