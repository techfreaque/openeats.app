import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/next-portal/api/auth/user";
import { prisma } from "@/next-portal/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } },
): Promise<NextResponse> {
  try {
    const { restaurantId } = params;

    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        category: "asc",
      },
    });

    return NextResponse.json(menuItems);
  } catch (_error) {
    // Use a proper logger in production
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { restaurantId: string } },
): Promise<NextResponse> {
  try {
    const { restaurantId } = params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user owns this restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
        userId: user.id,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Not authorized to modify this restaurant's menu" },
        { status: 403 },
      );
    }

    const data = await request.json();
    const { name, description, price, category, image } = data;

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        image: image || "/menu-placeholder.jpg",
        restaurantId,
      },
    });

    return NextResponse.json(menuItem);
  } catch (_error) {
    // Use a proper logger in production
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 },
    );
  }
}
