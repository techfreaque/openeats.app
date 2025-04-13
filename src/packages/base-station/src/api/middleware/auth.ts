import type { NextFunction, Request, Response } from "express";
import { isPrivate } from "ip";

import { config } from "../../config";
import logger, { logError } from "../../logging";
import type { ApiResponse } from "../../types";

// Define error response type
type ErrorResponse = ApiResponse<never>;

/**
 * Middleware to authenticate API requests using an API key
 * Checks if the provided API key matches the one in configuration
 */
export function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    // Check for API key in headers (preferred) or query parameters
    const apiKey =
      (req.headers["x-api-key"] as string | undefined) ||
      (req.query.apiKey as string | undefined);

    if (!apiKey) {
      logger.warn("API request missing API key");
      res.status(401).json({
        success: false,
        error: "API key is required",
      } as ErrorResponse);
      return;
    }

    // Compare with stored API key
    if (apiKey !== config.security.apiKey) {
      logger.warn("Invalid API key provided");
      res.status(401).json({
        success: false,
        error: "Invalid API key",
      } as ErrorResponse);
      return;
    }

    // API key is valid, proceed to the next middleware
    next();
  } catch (error) {
    logError("Error in API key authentication", error);
    res.status(500).json({
      success: false,
      error: "Authentication error",
    } as ErrorResponse);
  }
}

/**
 * Middleware to verify the request is coming from a local network
 * Restricts sensitive API endpoints to local network access only
 */
export function checkLocalNetwork(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    // Get client IP address with proper type handling
    const forwardedHeader = req.headers["x-forwarded-for"];
    const clientIp =
      (typeof forwardedHeader === "string"
        ? forwardedHeader.split(",")[0].trim()
        : undefined) ||
      req.socket.remoteAddress ||
      "";

    // Remove IPv6 prefix if present
    const ipAddress = clientIp.replace(/^::ffff:/, "");

    // Always allow localhost
    if (ipAddress === "127.0.0.1" || ipAddress === "::1") {
      return next();
    }

    // Check if IP is from a private network
    if (isPrivate(ipAddress)) {
      return next();
    }

    // Request is from external network, deny access
    logger.warn(`Access attempt from external IP: ${ipAddress}`);
    res.status(403).json({
      success: false,
      error: "Access restricted to local network",
    } as ErrorResponse);
  } catch (error) {
    logError("Error checking network access", error);
    res.status(500).json({
      success: false,
      error: "Network verification error",
    } as ErrorResponse);
  }
}
