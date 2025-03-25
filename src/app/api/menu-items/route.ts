import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import {
  menuItemCreateSchema,
  menuItemResponseSchema,
} from "@/client-package/schema/schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  validatePostRequest,
} from "@/next-portal/api/api-response";
import { getCurrentUser } from "@/next-portal/api/auth/user";
import { prisma } from "@/next-portal/db";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.roles.includes("RESTAURANT")) {
      return createErrorResponse("Unauthorized", 401);
    }

    const validatedData = await validatePostRequest(
      request,
      menuItemCreateSchema,
    );

    // Verify restaurant ownership
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: validatedData.restaurantId,
        userId: user.id,
      },
    });

    if (!restaurant) {
      return createErrorResponse(
        "Restaurant not found or you don't have permission",
        404,
      );
    }

    // Create menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: validatedData.restaurantId,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        category: validatedData.category,
        image: validatedData.image || "/food-placeholder.jpg",
      },
    });

    return createSuccessResponse(menuItem, menuItemResponseSchema);
  } catch (err) {
    const error = err as Error;
    return createErrorResponse(
      `Failed to create menu item: ${error.message}`,
      500,
    );
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const menuItems = await prisma.menuItem.findMany();
    return createSuccessResponse(menuItems, menuItemResponseSchema.array());
  } catch (err) {
    const error = err as Error;
    return createErrorResponse(
      `Could not fetch menu items: ${error.message}`,
      500,
    );
  }
}
