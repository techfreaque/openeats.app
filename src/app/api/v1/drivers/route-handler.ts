import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { userRepository, userRolesRepository } from "../auth/repository";
import type { Driver } from "./drivers.db";
import { driverRepository } from "./drivers.repository";
import type { DriverCreateType, DriverUpdateType } from "./schema";

/**
 * Driver API route handlers
 * Provides driver management functionality
 */

/**
 * Get all drivers
 * @param props - API handler props
 * @returns List of drivers
 */
export const getDrivers: ApiHandlerFunction<
  UndefinedType,
  Array<
    Driver & {
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        imageUrl?: string;
      };
    }
  >,
  UndefinedType
> = async ({ user }) => {
  try {
    debugLogger("Getting drivers", { userId: user.id });

    // Check if user has admin or partner role
    const userRoles = await userRolesRepository.findByUserId(user.id);

    const isAdmin = hasRole(userRoles, UserRoleValue.ADMIN);
    const isPartnerAdmin = hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);
    const isPartnerEmployee = hasRole(
      userRoles,
      UserRoleValue.PARTNER_EMPLOYEE,
    );

    if (!isAdmin && !isPartnerAdmin && !isPartnerEmployee) {
      debugLogger("Unauthorized access to drivers list", { userId: user.id });
      return {
        success: false,
        message: "Not authorized to view drivers",
        errorCode: 403,
      };
    }

    // Fetch drivers with user information
    const driversResult = await driverRepository.findAllWithUsers();

    debugLogger("Retrieved drivers", { count: driversResult.length });

    // Convert Date objects to ISO strings for the response
    const formattedDrivers = driversResult.map((driver) => ({
      ...driver,
      createdAt: driver.createdAt.toISOString(),
      updatedAt: driver.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedDrivers,
    };
  } catch (error) {
    debugLogger("Error getting drivers", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error getting drivers",
      errorCode: 500,
    };
  }
};

/**
 * Create a new driver
 * @param props - API handler props
 * @returns Created driver
 */
export const createDriver: ApiHandlerFunction<
  DriverCreateType,
  Driver & {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      imageUrl?: string;
    };
  },
  UndefinedType
> = async ({ data, user }) => {
  try {
    debugLogger("Creating driver", {
      adminUserId: user.id,
      driverUserId: data.userId,
    });

    // Check if user has admin role
    const userRoles = await userRolesRepository.findByUserId(user.id);
    const isAdmin = hasRole(userRoles, UserRoleValue.ADMIN);

    if (!isAdmin) {
      debugLogger("Unauthorized attempt to create driver", { userId: user.id });
      return {
        success: false,
        message: "Not authorized to create drivers",
        errorCode: 403,
      };
    }

    // Check if user exists
    const userExists = await userRepository.exists(data.userId);
    if (!userExists) {
      debugLogger("User not found", { userId: data.userId });
      return {
        success: false,
        message: "User not found",
        errorCode: 404,
      };
    }

    // Check if driver already exists for this user
    const driverExists = await driverRepository.existsByUserId(data.userId);
    if (driverExists) {
      debugLogger("Driver already exists for user", { userId: data.userId });
      return {
        success: false,
        message: "Driver already exists for this user",
        errorCode: 409,
      };
    }

    // Create driver
    const driver = await driverRepository.create({
      userId: data.userId,
      vehicle: data.vehicle,
      licensePlate: data.licensePlate,
      radius: data.radius.toString(),
      latitude: data.latitude.toString(),
      longitude: data.longitude.toString(),
      phone: data.phone,
      street: data.street,
      streetNumber: data.streetNumber,
      zip: data.zip,
      city: data.city,
      countryId: data.countryId,
      isActive: data.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add driver role to user
    await userRolesRepository.addRole(data.userId, UserRoleValue.COURIER);

    // Get driver with user information
    const driverWithUser = await driverRepository.findWithUser(driver.id);
    if (!driverWithUser) {
      throw new Error("Failed to retrieve driver with user information");
    }

    debugLogger("Driver created successfully", { driverId: driver.id });

    // Format dates for response
    const formattedDriver = {
      ...driverWithUser,
      createdAt: driverWithUser.createdAt.toISOString(),
      updatedAt: driverWithUser.updatedAt.toISOString(),
    };

    return {
      success: true,
      data: formattedDriver,
    };
  } catch (error) {
    debugLogger("Error creating driver", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error creating driver",
      errorCode: 500,
    };
  }
};

/**
 * Update a driver
 * @param props - API handler props
 * @returns Updated driver
 */
export const updateDriver: ApiHandlerFunction<
  DriverUpdateType,
  Driver & {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      imageUrl?: string;
    };
  },
  UndefinedType
> = async ({ data, user }) => {
  try {
    debugLogger("Updating driver", {
      userId: user.id,
      driverId: data.id,
    });

    // Check if user has admin role or is the driver being updated
    const userRoles = await userRolesRepository.findByUserId(user.id);
    const isAdmin = hasRole(userRoles, UserRoleValue.ADMIN);
    const isDriver = hasRole(userRoles, UserRoleValue.COURIER);

    // Get the driver to check if the user is updating their own profile
    const driver = await driverRepository.findById(data.id);
    if (!driver) {
      debugLogger("Driver not found", { driverId: data.id });
      return {
        success: false,
        message: "Driver not found",
        errorCode: 404,
      };
    }

    // Check if user is authorized to update this driver
    const isSelfUpdate = isDriver && driver.userId === user.id;

    if (!isAdmin && !isSelfUpdate) {
      debugLogger("Unauthorized attempt to update driver", {
        userId: user.id,
        driverId: data.id,
      });
      return {
        success: false,
        message: "Not authorized to update this driver",
        errorCode: 403,
      };
    }

    // Prepare update data (remove id from data)
    const { id, countryId, ...otherData } = data;

    // Create update data
    const updateData: Partial<Driver> = {};

    // Add all defined properties
    if (otherData.vehicle !== undefined) {
      updateData.vehicle = otherData.vehicle;
    }
    if (otherData.licensePlate !== undefined) {
      updateData.licensePlate = otherData.licensePlate;
    }
    if (otherData.radius !== undefined) {
      updateData.radius = otherData.radius as unknown as string;
    }
    if (otherData.latitude !== undefined) {
      updateData.latitude = otherData.latitude as unknown as string;
    }
    if (otherData.longitude !== undefined) {
      updateData.longitude = otherData.longitude as unknown as string;
    }
    if (otherData.phone !== undefined) {
      updateData.phone = otherData.phone;
    }
    if (otherData.street !== undefined) {
      updateData.street = otherData.street;
    }
    if (otherData.streetNumber !== undefined) {
      updateData.streetNumber = otherData.streetNumber;
    }
    if (otherData.zip !== undefined) {
      updateData.zip = otherData.zip;
    }
    if (otherData.city !== undefined) {
      updateData.city = otherData.city;
    }
    if (otherData.isActive !== undefined) {
      updateData.isActive = otherData.isActive;
    }

    // Add countryId if defined
    if (countryId !== undefined) {
      updateData.countryId = countryId;
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    // Update driver
    const updatedDriver = await driverRepository.update(id, updateData);
    if (!updatedDriver) {
      throw new Error("Failed to update driver");
    }

    // Get driver with user information
    const driverWithUser = await driverRepository.findWithUser(id);
    if (!driverWithUser) {
      throw new Error("Failed to retrieve driver with user information");
    }

    debugLogger("Driver updated successfully", { driverId: updatedDriver.id });

    // Format dates for response
    const formattedDriver = {
      ...driverWithUser,
      createdAt: driverWithUser.createdAt.toISOString(),
      updatedAt: driverWithUser.updatedAt.toISOString(),
    };

    return {
      success: true,
      data: formattedDriver,
    };
  } catch (error) {
    debugLogger("Error updating driver", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error updating driver",
      errorCode: 500,
    };
  }
};
