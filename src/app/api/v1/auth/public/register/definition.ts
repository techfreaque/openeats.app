import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import type { ExamplesList } from "next-vibe/shared/types/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { loginResponseSchema } from "../login/schema";
import type { RegisterType } from "./schema";
import { registerSchema } from "./schema";

/**
 * Register API endpoint definition
 * Provides user registration functionality
 */

export const userExamples: ExamplesList<
  RegisterType,
  "default" | "customer" | "restaurantAdmin" | "restaurantEmployee" | "driver"
> = {
  default: {
    id: "88111873-5dc8-4c4b-93ff-82c2377f5f08",
    firstName: "Customer",
    lastName: "User",
    imageUrl: undefined,
    email: `customer${Math.random()}@example.com`,
    password: "password",
    confirmPassword: "password",
  },
  customer: {
    id: "88111873-5dc8-4c4b-93ff-82c2377f5f02",
    firstName: "Customer",
    lastName: "User",
    imageUrl: undefined,
    email: "customer@example.com",
    password: "password",
    confirmPassword: "password",
  },
  restaurantAdmin: {
    id: "b2f74947-41dc-4e67-995d-97de70f8644e",
    firstName: "Restaurant",
    lastName: "Owner",
    imageUrl: undefined,
    email: "restaurant@example.com",
    password: "password",
    confirmPassword: "password",
  },
  restaurantEmployee: {
    id: "0ad1148e-6114-4194-a51c-dc991ae0fb0e",
    firstName: "Restaurant",
    lastName: "Employee",
    imageUrl: undefined,
    email: "restaurant.employee@example.com",
    password: "password",
    confirmPassword: "password",
  },
  driver: {
    id: "87f23e96-1d90-4d63-98d3-2ad207ad65a7",
    firstName: "Delivery",
    lastName: "Driver",
    imageUrl: undefined,
    email: "driver@example.com",
    password: "password",
    confirmPassword: "password",
  },
};

/**
 * Register endpoint definition
 */
const registerEndpoint = createEndpoint({
  description: "Register a new user account",
  method: Methods.POST,
  requestSchema: registerSchema,
  responseSchema: loginResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "auth", "public", "register"],
  apiQueryOptions: {
    queryKey: ["register"],
    // Don't cache registration requests
    staleTime: 0,
  },
  fieldDescriptions: {
    firstName: "User's first name",
    lastName: "User's last name",
    email: "User's email address",
    password: "User's password (min 8 characters)",
    confirmPassword: "Confirm password (must match password)",
    imageUrl: "User's profile image URL",
  },
  allowedRoles: [UserRoleValue.PUBLIC],
  errorCodes: {
    400: "Invalid request data",
    409: "Email already in use",
    500: "Internal server error",
  },
  examples: {
    payloads: userExamples,
    urlPathVariables: undefined,
    responses: {
      default: {
        user: {
          id: "user-123",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userRoles: [{ id: "role-123", role: "CUSTOMER" }],
        },
        token: "jwt-token-example",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      customer: {
        user: {
          id: "user-456",
          firstName: "Customer",
          lastName: "User",
          email: "customer@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userRoles: [{ id: "role-456", role: "CUSTOMER" }],
        },
        token: "jwt-token-example",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      restaurantAdmin: {
        user: {
          id: "user-789",
          firstName: "Restaurant",
          lastName: "Owner",
          email: "restaurant@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userRoles: [{ id: "role-789", role: "PARTNER_ADMIN" }],
        },
        token: "jwt-token-example",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      restaurantEmployee: {
        user: {
          id: "user-101",
          firstName: "Restaurant",
          lastName: "Employee",
          email: "employee@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userRoles: [{ id: "role-101", role: "PARTNER_EMPLOYEE" }],
        },
        token: "jwt-token-example",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      driver: {
        user: {
          id: "user-202",
          firstName: "Delivery",
          lastName: "Driver",
          email: "driver@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userRoles: [{ id: "role-202", role: "COURIER" }],
        },
        token: "jwt-token-example",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
    },
  },
});

/**
 * Register API endpoints
 */
const definition = {
  ...registerEndpoint,
};

export default definition;
