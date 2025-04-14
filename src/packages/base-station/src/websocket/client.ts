import { EventEmitter } from "events";
import WebSocket from "ws";

import { config } from "../config";
import logger, { logError, logWebSocketConnection } from "../logging";
import type {
  WebSocketMessage,
  // ... other type imports as needed
} from "../types";

// WebSocket client class
class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connected = false;

  // Connect to WebSocket server
  async connect(): Promise<void> {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Don't try to connect if already connecting or connected
    if (this.ws) {
      logger.debug("WebSocket already connected or connecting");
      return;
    }

    try {
      logger.info(`Connecting to WebSocket server: ${config.websocket.url}`);

      // Create WebSocket connection
      this.ws = new WebSocket(config.websocket.url);

      // Setup event handlers
      this.ws.on("open", () => this.handleOpen());
      this.ws.on("message", (data) => this.handleMessage(data));
      this.ws.on("error", (error) => this.handleError(error));
      this.ws.on("close", () => this.handleClose());

      // Wait for connection to establish or fail
      return new Promise((resolve) => {
        this.once("connected", () => resolve());
        this.once("error", () => resolve());
      });
    } catch (error) {
      logger.error(`Failed to connect to WebSocket server: ${error}`);
      this.scheduleReconnect();
      throw error;
    }
  }

  // Send message to the WebSocket server
  send(message: WebSocketMessage): void {
    if (!this.isConnected()) {
      logger.warn("Cannot send message, WebSocket not connected");
      return;
    }

    try {
      // Add API key to message
      const messageWithAuth = {
        ...message,
        apiKey: config.security.apiKey,
      };

      this.ws?.send(JSON.stringify(messageWithAuth));
    } catch (error) {
      logError("Failed to send message", error);
    }
  }

  // Check if WebSocket is connected
  isConnected(): boolean {
    return this.connected && !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // Send system status to server
  sendStatus(statusData: any): void {
    this.send({
      type: "status",
      data: statusData,
    });
  }

  // Send job status update to server
  sendJobStatus(jobData: any): void {
    this.send({
      type: "job_status",
      data: jobData,
    });
  }

  // Send error notification to server
  sendError(errorData: any): void {
    this.send({
      type: "error",
      data: errorData,
    });
  }

  // Close the WebSocket connection
  close(): void {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (error) {
        logError("Error closing WebSocket connection", error);
      }
      this.ws = null;
      this.connected = false;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Handle WebSocket open event
  private handleOpen(): void {
    logger.info("WebSocket connected");
    logWebSocketConnection("connected");
    this.reconnectAttempts = 0;
    this.connected = true;
    this.emit("connected");
  }

  // Handle WebSocket message event
  private handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage;
      logger.debug(`Received WebSocket message: ${message.type}`);

      // Emit event with message data
      if (message.type) {
        this.emit(message.type, message.data);
      }
    } catch (error) {
      logError("Failed to parse WebSocket message", error);
    }
  }

  // Handle WebSocket error event
  private handleError(error: Error): void {
    logError("WebSocket error", error);
    this.emit("error", error);
  }

  // Handle WebSocket close event
  private handleClose(): void {
    logger.info("WebSocket disconnected");
    logWebSocketConnection("disconnected");
    this.ws = null;
    this.connected = false;
    this.scheduleReconnect();
    this.emit("disconnected");
  }

  // Schedule reconnection attempt
  private scheduleReconnect(): void {
    // Check if exceeded max reconnect attempts
    if (this.reconnectAttempts >= config.websocket.maxReconnectAttempts) {
      logger.error(
        `Max reconnect attempts (${config.websocket.maxReconnectAttempts}) reached. Giving up.`,
      );
      return;
    }

    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Calculate delay with exponential backoff
    const delay =
      config.websocket.reconnectInterval *
      Math.pow(1.5, Math.min(this.reconnectAttempts, 10));

    logger.info(
      `Scheduling reconnect attempt in ${delay}ms (attempt ${this.reconnectAttempts + 1})`,
    );

    // Schedule reconnect
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(() => {
        // Catch error to prevent unhandled promise rejection
        logger.error("Failed to reconnect");
      });
    }, delay);
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();
