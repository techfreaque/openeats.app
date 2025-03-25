import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/next-portal/api/auth/user";
import { prisma } from "@/next-portal/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const user = await getCurrentUser();

    if (!user) {
      const response: ApiResponse<null> = {
        error: "Unauthorized",
        status: 401,
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Check if user is a driver
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true },
    });

    const roles = userRoles.map((r) => r.role);
    const isDriver = roles.includes("DRIVER");

    if (!isDriver) {
      const response: ApiResponse<null> = {
        error: "Only drivers can access earnings",
        status: 403,
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Get driver record
    const driver = await prisma.driver.findUnique({
      where: { userId: user.id },
    });

    if (!driver) {
      const response: ApiResponse<null> = {
        error: "Driver profile not found",
        status: 404,
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Get earnings
    const earnings = await prisma.earning.findMany({
      where: { driverId: driver.id },
      orderBy: { date: "desc" },
    });

    // Format response
    const formattedEarnings = earnings.map((earning) => ({
      ...earning,
      date: earning.date.toISOString(),
      createdAt: earning.createdAt.toISOString(),
    }));

    const response: ApiResponse<typeof formattedEarnings> = {
      data: formattedEarnings,
      status: 200,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching earnings:", error);

    const response: ApiResponse<null> = {
      error: "Failed to fetch earnings",
      status: 500,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Admin only endpoint to add earning records
    const user = await getCurrentUser();

    if (!user) {
      const response: ApiResponse<null> = {
        error: "Unauthorized",
        status: 401,
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Check if user is an admin
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true },
    });

    const roles = userRoles.map((r) => r.role);
    const isAdmin = roles.includes("ADMIN");

    if (!isAdmin) {
      const response: ApiResponse<null> = {
        error: "Admin access required",
        status: 403,
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const validation = earningsSchema.safeParse(body);

    if (!validation.success) {
      const response: ApiResponse<null> = {
        error: "Invalid earnings data",
        status: 400,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Add earnings record
    const newEarning = await prisma.earning.create({
      data: validation.data,
    });

    const response: ApiResponse<typeof newEarning> = {
      data: {
        ...newEarning,
        date: newEarning.date.toISOString(),
        createdAt: newEarning.createdAt.toISOString(),
      },
      status: 201,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating earnings record:", error);

    const response: ApiResponse<null> = {
      error: "Failed to create earnings record",
      status: 500,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
