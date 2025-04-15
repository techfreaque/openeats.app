import { type NextRequest, NextResponse } from "next/server";

import {
  apiRateLimiter,
  strictRateLimiter,
} from "./packages/next-vibe/server/middleware/rate-limit";

export function middleware(request: NextRequest) {
  // Handle WebSocket upgrade requests
  if (
    request.nextUrl.pathname === "/api/ws" &&
    (request.headers.get("connection")?.toLowerCase().includes("upgrade") ||
      request.headers.get("upgrade")?.toLowerCase() === "websocket")
  ) {
    // Let the WebSocket route handler manage this request
    return NextResponse.next();
  }

  // Apply strict rate limiting to authentication routes
  if (request.nextUrl.pathname.startsWith("/api/v1/auth")) {
    return strictRateLimiter(request);
  }

  // Apply standard API rate limiting to all other API routes
  if (request.nextUrl.pathname.startsWith("/api/v1/")) {
    return apiRateLimiter(request);
  }

  // Continue with other requests
  const response = NextResponse.next();

  // Add CORS headers for API routes
  response.headers.append("Access-Control-Allow-Origin", "*");
  response.headers.append(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.append(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  return response;
}

// Only run middleware on the WebSocket route
export const config = {
  matcher: [
    "/api/ws",
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
