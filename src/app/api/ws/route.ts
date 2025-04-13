import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { handleWebSocketUpgrade } from "next-vibe/server/notification";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { initializeWebSocketServer } from "./init-server";

// This ensures the socket server is initialized exactly once
let isInitialized = false;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // The Next.js server is available through globalThis.process.__NEXT_HTTP_SERVER__
    const server = globalThis.process.__NEXT_HTTP_SERVER__;

    if (server && !isInitialized) {
      isInitialized = initializeWebSocketServer(server);
    }

    debugLogger("WebSocket upgrade request received");
    return handleWebSocketUpgrade();
  } catch (error) {
    errorLogger("WebSocket upgrade error", error);
    return NextResponse.json(
      {
        error: "WebSocket server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
