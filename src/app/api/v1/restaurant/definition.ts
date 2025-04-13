import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import type { ExamplesList } from "next-vibe/shared/types/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { z } from "zod";

import { Countries, Currencies } from "@/translations";

import { categoryExamples } from "../category/definition";
import { Day } from "./schema/opening-times.schema";
import type { RestaurantUpdateType } from "./schema/restaurant.schema";
import {
  restaurantCreateSchema,
  restaurantGetSchema,
  restaurantResponseSchema,
  restaurantSearchSchema,
  restaurantUpdateSchema,
} from "./schema/restaurant.schema";

/**
 * Restaurant API endpoint definitions
 * Provides restaurant management functionality
 */

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
    countryId: Countries.DE,
    delivery: true,
    pickup: true,
    dineIn: false,
    priceLevel: 2,
    userRoles: [
      {
        userId: "user-123", // Fixed hardcoded ID instead of unsafe access
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
    countryId: Countries.DE,
    delivery: true,
    pickup: true,
    dineIn: false,
    priceLevel: 2,
    userRoles: [
      {
        userId: "user-123", // Fixed hardcoded ID instead of unsafe access
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
    street: "Verladestraße",
    streetNumber: "13",
    city: "Braunau am Inn",
    zip: "5280",
    countryId: Countries.AT,
    delivery: true,
    pickup: true,
    dineIn: true,
    priceLevel: 3,
    userRoles: [
      {
        userId: "user-123", // Fixed hardcoded ID instead of unsafe access
        role: UserRoleValue.PARTNER_ADMIN,
      },
    ],
  },
};

/**
 * GET endpoint for retrieving all restaurants
 */
export const restaurantGetEndpoint = createEndpoint({
  description: "Get all restaurants",
  path: ["v1", "restaurant"],
  method: Methods.GET,
  fieldDescriptions: {
    restaurantId: "Restaurant ID",
  },
  apiQueryOptions: {
    queryKey: ["restaurants"],
  },
  requestSchema: restaurantGetSchema,
  responseSchema: z.array(restaurantResponseSchema),
  requestUrlSchema: undefinedSchema,
  examples: {
    payloads: {
      default: {
        restaurantId: restaurantExamples.default.id,
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        default: restaurantExamples.default,
        example1: restaurantExamples.example1,
      },
    },
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

/**
 * POST endpoint for creating a restaurant
 */
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
    delivery: "Delivery available",
    pickup: "Pickup available",
    dineIn: "Dine-in available",
    priceLevel: "Price level (1-4)",
  },
  examples: {
    payloads: restaurantExamples,
    urlPathVariables: undefined,
    responses: {
      default: {
        city: restaurantExamples.default.city,
        countryId: restaurantExamples.default.countryId,
        delivery: restaurantExamples.default.delivery,
        dineIn: restaurantExamples.default.dineIn,
        email: restaurantExamples.default.email,
        id: restaurantExamples.default.id,
        description: restaurantExamples.default.description,
        image: restaurantExamples.default.image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderCount: 0,
        rating: 0,
        verified: false,
        openingTimes: [
          {
            day: Day.MONDAY,
            open: 0,
            close: 86400,
            published: true,
            validFrom: null,
            validTo: null,
            id: "opening-time-id-1",
          },
        ],
        userRoles: [
          {
            id: "role-id-1",
            userId: "user-id-1",
            role: UserRoleValue.PARTNER_ADMIN,
          },
        ],
        mainCategory: {
          id: "category-id-1",
          name: "Pizza",
          image: "/placeholder.svg",
        },
        menuItems: [
          {
            price: 10,
            name: "Pizza",
            description: "Delicious pizza",
            image: "/placeholder.svg",
            id: "menu-item-id-1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            taxPercent: 19,
            published: true,
            isAvailable: true,
            availableFrom: null,
            currency: Currencies.EUR,
            availableTo: null,
            category: {
              id: "category-id-1",
              name: "Pizza",
              image: "/placeholder.svg",
            },
          },
        ],
        longitude: 0,
        latitude: 0,
        name: restaurantExamples.default.name,
        phone: restaurantExamples.default.phone,
        pickup: restaurantExamples.default.pickup,
        priceLevel: restaurantExamples.default.priceLevel,
        published: restaurantExamples.default.published,
        street: restaurantExamples.default.street,
        streetNumber: restaurantExamples.default.streetNumber,
        zip: restaurantExamples.default.zip,
      },
      example1: {},
      example2: {},
    },
  },
  allowedRoles: [UserRoleValue.ADMIN, UserRoleValue.PARTNER_ADMIN],
  requestUrlSchema: undefinedSchema,
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
});

/**
 * PUT endpoint for updating a restaurant
 */
const restaurantUpdateEndpoint = createEndpoint({
  description: "Update a restaurant",
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
    delivery: "Delivery available",
    pickup: "Pickup available",
    dineIn: "Dine-in available",
    priceLevel: "Price level (1-4)",
  },
  examples: {
    payloads: restaurantExamples,
    urlPathVariables: undefined,
    responses: {
      default: {
        ...restaurantExamples.default,
        name: "Updated Restaurant",
        description: "Updated description",
      },
      example1: restaurantExamples.example1,
      example2: restaurantExamples.example2,
    },
  },
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  requestUrlSchema: undefinedSchema,
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    404: "Restaurant not found",
    500: "Internal server error",
  },
});
/**
 * POST endpoint for searching restaurants
 */
const restaurantSearchEndpoint = createEndpoint({
  description: "Search restaurants",
  requestSchema: restaurantSearchSchema,
  responseSchema: z.array(restaurantResponseSchema),
  path: ["v1", "restaurant", "search"],
  method: Methods.POST,
  apiQueryOptions: {
    queryKey: ["restaurant-search"],
  },
  fieldDescriptions: {
    name: "Filter by restaurant name",
    city: "Filter by city",
    countryId: "Filter by country",
    published: "Filter by published status",
  },
  examples: {
    payloads: {
      default: {
        name: "Pizza",
        city: "New York",
        published: true,
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: [restaurantExamples.default, restaurantExamples.example1],
    },
  },
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.ADMIN,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  requestUrlSchema: undefinedSchema,
  errorCodes: {
    400: "Invalid request data",
    500: "Internal server error",
  },
});

/**
 * Restaurant API endpoints
 */
const restaurantEndpoint = {
  ...restaurantGetEndpoint,
  ...restaurantCreateEndpoint,
  ...restaurantUpdateEndpoint,
  ...restaurantSearchEndpoint,
};

export default restaurantEndpoint;
