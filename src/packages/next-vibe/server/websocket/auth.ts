import type { Socket } from "socket.io";

import type {
  AuthenticatedSocket,
  WebSocketErrorCode,
  WebSocketUser,
} from "../../shared/types/websocket";
import { debugLogger, errorLogger } from "../../shared/utils/logger";
import { verifyJwt } from "../endpoints/auth/jwt";

/**
 * Authentication error class with typed error codes
 */
export class AuthenticationError extends Error {
  code: WebSocketErrorCode;

  constructor(message: string, code: WebSocketErrorCode) {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
  }
}

/**
 * Validates a token and returns the associated user
 * @param token - Authentication token
 * @returns User object if token is valid
 * @throws AuthenticationError if token is invalid
 */
export const validateToken = async (
  token: string | string[] | undefined,
): Promise<WebSocketUser> => {
  if (!token) {
    throw new AuthenticationError("Token not provided", "AUTH_REQUIRED");
  }

  // Ensure token is a string
  const tokenStr = Array.isArray(token) ? token[0] : token;

  if (!tokenStr) {
    throw new AuthenticationError("No token provided", "AUTH_REQUIRED");
  }

  try {
    // Verify token and get user
    const payload = await verifyJwt(tokenStr);

    if (!payload?.id) {
      throw new AuthenticationError("Invalid token", "AUTH_REQUIRED");
    }

    // For WebSocket, we only need basic user info
    return {
      id: payload.id,
      name: payload.id, // Use ID as name since JWT payload is minimal
      role: "CUSTOMER", // Default role
    };
  } catch (error) {
    errorLogger("Token validation error:", error);
    throw new AuthenticationError("Invalid token", "AUTH_REQUIRED");
  }
};

/**
 * Socket.IO middleware to authenticate the connection
 * Extracts token from handshake and validates
 * @param socket - Socket.IO socket instance
 * @param next - Middleware next function
 */
export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> => {
  try {
    // Extract token from handshake auth or query parameters
    // Use bracket notation for dynamic properties

    const token: string =
      socket.handshake.auth["token"] ?? socket.handshake.query["token"];

    // Validate token and get user
    const user = await validateToken(token);

    // Attach user to socket for later reference
    (socket as AuthenticatedSocket).user = user;

    // Join user-specific room for multi-device synchronization
    void socket.join(`user_${user.id}`);

    debugLogger("Socket authenticated:", {
      userId: user.id,
      socketId: socket.id,
    });

    return next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(new Error(`Authentication error: ${error.message}`));
    }
    return next(new Error(`Authentication error: Unexpected error occurred`));
  }
};
