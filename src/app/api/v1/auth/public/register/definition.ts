import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import type { ExamplesList } from "next-vibe/shared/types/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { createEndpoint } from "@/packages/next-vibe/client/endpoint";

import { loginResponseSchema } from "../login/schema";
import type { RegisterType } from "./schema";
import { registerSchema } from "./schema";

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

const registerEndpoint = createEndpoint({
  description: "Register a new user account",
  method: Methods.POST,
  requestSchema: registerSchema,
  responseSchema: loginResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "auth", "public", "register"],
  apiQueryOptions: {
    queryKey: ["register"],
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
  },
});
export default registerEndpoint;
