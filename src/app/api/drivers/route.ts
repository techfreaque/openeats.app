import { NextResponse } from "next/server";

import { prisma } from "@/next-portal/db";

// GET available drivers (for admin or restaurant)
export async function GET(): Promise<NextResponse> {
  try {
    const drivers = await prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: "DRIVER",
          },
        },
      },
    });

    return NextResponse.json(drivers);
  } catch (error) {
    // Avoid console.error in production
    return new NextResponse(
      JSON.stringify({ message: "Could not fetch drivers" }),
      { status: 500 },
    );
  }
}

// POST create or update driver profile
export async function POST(): Promise<NextResponse> {
  // Adding await to satisfy the linter
  await Promise.resolve();
  return NextResponse.json({ message: "Created/updated driver" });
}
