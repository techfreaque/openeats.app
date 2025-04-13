import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import {
  driverCreateSchema,
  driverResponseSchema,
  driversResponseSchema,
  driverUpdateSchema,
} from "./schema";

/**
 * Driver API endpoint definitions
 * Provides driver management functionality
 */

// Example data
const exampleDriver = {
  id: "driver-id-1",
  isActive: true,
  vehicle: "Car",
  licensePlate: "ABC123",
  radius: "10.0",
  latitude: "40.7128",
  longitude: "-74.006",
  phone: "+1234567890",
  street: "Main Street",
  streetNumber: "123",
  zip: "10001",
  city: "New York",
  countryId: "DE",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user-id-1",
  rating: "4.5",
  ratingRecent: "4.7",
  ratingCount: 25,
  user: {
    id: "user-id-1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    imageUrl: "/avatar.jpg",
  },
};

/**
 * GET endpoint for retrieving all drivers
 */
const driversGetEndpoint = createEndpoint({
  description: "Get all drivers",
  method: Methods.GET,
  requestSchema: undefinedSchema,
  responseSchema: driversResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "drivers"],
  apiQueryOptions: {
    queryKey: ["drivers"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  },
  fieldDescriptions: undefined,
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: undefined,
    responses: {
      default: [exampleDriver],
    },
  },
});

/**
 * POST endpoint for creating a new driver
 */
const driverCreateEndpoint = createEndpoint({
  description: "Create a new driver",
  method: Methods.POST,
  requestSchema: driverCreateSchema,
  responseSchema: driverResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "drivers"],
  apiQueryOptions: {
    queryKey: ["driver-create"],
  },
  fieldDescriptions: {
    userId: "User ID",
    vehicle: "Vehicle type",
    licensePlate: "License plate number",
    radius: "Service radius in kilometers",
    latitude: "Current latitude",
    longitude: "Current longitude",
    phone: "Phone number",
    street: "Street name",
    streetNumber: "Street number",
    zip: "ZIP code",
    city: "City name",
    countryId: "Country ID",
    isActive: "Whether the driver is active",
  },
  allowedRoles: [UserRoleValue.ADMIN],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    404: "User not found",
    409: "Driver already exists for this user",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        userId: "user-id-1",
        vehicle: "Car",
        licensePlate: "ABC123",
        radius: 10.0,
        latitude: 40.7128,
        longitude: -74.006,
        phone: "+1234567890",
        street: "Main Street",
        streetNumber: "123",
        zip: "10001",
        city: "New York",
        countryId: "DE",
        isActive: true,
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: exampleDriver,
    },
  },
});

/**
 * PUT endpoint for updating a driver
 */
const driverUpdateEndpoint = createEndpoint({
  description: "Update a driver",
  method: Methods.PUT,
  requestSchema: driverUpdateSchema,
  responseSchema: driverResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "drivers"],
  apiQueryOptions: {
    queryKey: ["driver-update"],
  },
  fieldDescriptions: {
    userId: "User ID",
    id: "Driver ID",
    vehicle: "Vehicle type",
    licensePlate: "License plate number",
    radius: "Service radius in kilometers",
    latitude: "Current latitude",
    longitude: "Current longitude",
    phone: "Phone number",
    street: "Street name",
    streetNumber: "Street number",
    zip: "ZIP code",
    city: "City name",
    countryId: "Country ID",
    isActive: "Whether the driver is active",
  },
  allowedRoles: [UserRoleValue.ADMIN, UserRoleValue.COURIER],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    404: "Driver not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        id: "driver-id-1",
        vehicle: "SUV",
        licensePlate: "XYZ789",
        isActive: true,
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        ...exampleDriver,
        vehicle: "SUV",
        licensePlate: "XYZ789",
      },
    },
  },
});

/**
 * Driver API endpoints
 */
const driverEndpoints = {
  ...driversGetEndpoint,
  ...driverCreateEndpoint,
  ...driverUpdateEndpoint,
};

export default driverEndpoints;
