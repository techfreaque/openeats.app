import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import {
  menuItemResponseSchema,
  menuItemUpdateSchema,
} from "@/client-package/schema/schemas";
import {
  createErrorResponse,
  createSuccessResponse,
  validatePostRequest,
} from "@/next-portal/api/api-response";
import { getCurrentUser } from "@/next-portal/api/auth/user";
import { prisma } from "@/next-portal/db";

// GET a specific menu item
export async function GET(
  _request: NextRequest,
  { params }: { params: { restaurantId: string; itemId: string } },
): Promise<NextResponse> {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: params.itemId,
        restaurantId: params.restaurantId,
      },
    });

    if (!menuItem) {
      return createErrorResponse("Menu item not found", 404);
    }

    return createSuccessResponse(menuItem, menuItemResponseSchema);
  } catch (err) {
    const error = err as Error;
    return createErrorResponse(
      `Error fetching menu item: ${error.message}`,
      500,
    );
  }
}

// PUT update a menu item
export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string; itemId: string } },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.restaurantId },
    });

    if (!restaurant || restaurant.userId !== user.id) {
      return createErrorResponse("Unauthorized to update this menu item", 403);
    }

    const validatedData = await validatePostRequest(
      request,
      menuItemUpdateSchema,
    );

    const menuItem = await prisma.menuItem.update({
      where: {
        id: params.itemId,
        restaurantId: params.restaurantId,
      },
      data: validatedData,
    });

    return createSuccessResponse(menuItem, menuItemResponseSchema);
  } catch (err) {
    const error = err as Error;
    return createErrorResponse(
      `Error updating menu item: ${error.message}`,
      500,
    );
  }
}

// DELETE a menu item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { restaurantId: string; itemId: string } },
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return createErrorResponse("Unauthorized", 401);
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.restaurantId },
    });

    if (!restaurant || restaurant.userId !== user.id) {
      return createErrorResponse("Unauthorized to delete this menu item", 403);
    }

    await prisma.menuItem.delete({
      where: {
        id: params.itemId,
        restaurantId: params.restaurantId,
      },
    });

    return createSuccessResponse(
      { success: true },
      z.object({ success: z.boolean() }),
    );
  } catch (err) {
    const error = err as Error;
    return createErrorResponse(
      `Error deleting menu item: ${error.message}`,
      500,
    );
  }
}
