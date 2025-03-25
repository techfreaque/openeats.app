import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/next-portal/db";
import { errorLogger } from "@/next-portal/utils/logger";

const inputSchema = z.object({
  uiid: z.string().min(1, "UIId is required"),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { uiid: UIId } = inputSchema.parse(body);

    try {
      await prisma.uI.update({
        where: {
          id: UIId,
        },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
    } catch (dbError) {
      errorLogger("Database update error:", dbError);
      // Return success anyway to prevent client errors
    }

    return new NextResponse(null, { status: 202 });
  } catch (error) {
    errorLogger("Error in view-increment API route:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid input", details: error.errors }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        },
      );
    }
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
