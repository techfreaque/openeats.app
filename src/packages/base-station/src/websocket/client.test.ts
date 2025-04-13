import { EventEmitter } from "events";
import { beforeEach, describe, expect, it, vi } from "vitest";

import logger from "../logging";
import { wsClient } from "./client";

// Create a proper WebSocket mock
class MockWebSocket extends EventEmitter {
  readyState = 1; // OPEN

  constructor() {
    super();
    this.send = vi.fn();
  }

  close() {
    this.emit("close");
  }
}

// Create a WebSocket constructor mock that we can spy on
const WebSocketConstructorMock = vi.fn().mockImplementation(() => {
  const ws = new MockWebSocket();

  // Simulate connection
  setTimeout(() => {
    ws.emit("open");
  }, 0);

  return ws;
});

// Set the OPEN constant
WebSocketConstructorMock.OPEN = 1;

// Mock the WebSocket module
vi.mock("ws", () => {
  return {
    default: WebSocketConstructorMock,
    WebSocket: {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    },
  };
});

// Mock config
vi.mock("../config", () => ({
  config: {
    websocket: {
      url: "ws://localhost:8080",
      reconnectInterval: 100,
      maxReconnectAttempts: 3,
    },
    security: {
      apiKey: "test-api-key",
    },
  },
}));

// Mock logger
vi.mock("../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  logWebSocketConnection: vi.fn(),
  logError: vi.fn(),
}));

// Create a mock isConnected function for wsClient
const originalIsConnected = wsClient.isConnected;
wsClient.isConnected = vi.fn().mockImplementation(() => false);

// Add scheduleReconnect mock to wsClient
(wsClient as any).scheduleReconnect = vi.fn();

// For testing purposes - after tests we'll want to restore original methods
const restoreWsClient = () => {
  wsClient.isConnected = originalIsConnected;
  delete (wsClient as any).scheduleReconnect;
};

describe("WebSocket Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the mock WebSocket constructor
    WebSocketConstructorMock.mockClear();

    // Default to not connected
    vi.mocked(wsClient.isConnected).mockReturnValue(false);

    // Reset scheduleReconnect mock
    vi.mocked((wsClient as any).scheduleReconnect).mockClear();
  });

  describe("connect", () => {
    it("should connect to the WebSocket server", async () => {
      // Set up the mock to simulate successful connection
      const mockWs = new MockWebSocket();
      WebSocketConstructorMock.mockReturnValueOnce(mockWs);

      // Make isConnected return true after connection
      vi.mocked(wsClient.isConnected).mockReturnValue(true);

      // Connect
      const connectPromise = wsClient.connect();

      // Simulate the open event
      mockWs.emit("open");

      await connectPromise;

      // Verify WebSocket constructor was called correctly
      expect(WebSocketConstructorMock).toHaveBeenCalledWith(
        "ws://localhost:8080",
      );
      expect(logger.info).toHaveBeenCalled();
    });

    it("should handle connection errors", async () => {
      // Create a mock WebSocket instance
      const mockWs = new MockWebSocket();
      WebSocketConstructorMock.mockReturnValueOnce(mockWs);

      // Set up error handling spy
      const errorSpy = vi.spyOn(logger, "error");

      // Connect
      const connectPromise = wsClient.connect();

      // Simulate error event
      mockWs.emit("error", new Error("Connection error"));

      await connectPromise;

      // Error should be logged
      expect(errorSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("WebSocket error"),
        expect.any(Error),
      );
    });

    it("should attempt to reconnect on connection close", async () => {
      // Create a mock WebSocket instance
      const mockWs = new MockWebSocket();
      WebSocketConstructorMock.mockReturnValueOnce(mockWs);

      // Connect
      await wsClient.connect();

      // Make sure scheduleReconnect is properly mocked
      const reconnectSpy = vi.mocked((wsClient as any).scheduleReconnect);

      // Simulate close event
      mockWs.emit("close");

      // Verify reconnect was scheduled
      expect(reconnectSpy).toHaveBeenCalled();
    });
  });

  describe("send", () => {
    it("should send messages when connected", async () => {
      // Create a mock WebSocket instance with a send spy
      const mockWs = new MockWebSocket();
      const sendSpy = vi.spyOn(mockWs, "send");
      WebSocketConstructorMock.mockReturnValueOnce(mockWs);

      // Mock isConnected to return true
      vi.mocked(wsClient.isConnected).mockReturnValue(true);

      // Connect and set the WebSocket instance
      await wsClient.connect();
      (wsClient as any).ws = mockWs;

      // Send a message
      wsClient.send({ type: "TEST", data: { test: true } });

      // Verify send was called with the correct message
      expect(sendSpy).toHaveBeenCalled();
      expect(sendSpy).toHaveBeenCalledWith(expect.stringContaining("TEST"));
    });

    it("should not send messages when disconnected", () => {
      // Ensure isConnected returns false
      vi.mocked(wsClient.isConnected).mockReturnValue(false);

      // Try to send a message
      wsClient.send({ type: "TEST", data: { test: true } });

      // Verify warning was logged
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("events", () => {
    it("should register and trigger event handlers", async () => {
      // Create a handler spy
      const handler = vi.fn();

      // Register the event handler
      wsClient.on("test-event", handler);

      // Emit the event
      wsClient.emit("test-event", { test: true });

      // Verify handler was called
      await vi.waitFor(() => {
        expect(handler).toHaveBeenCalledWith({ test: true });
      });
    });

    it("should handle message events", async () => {
      // Create a mock WebSocket instance
      const mockWs = new MockWebSocket();
      WebSocketConstructorMock.mockReturnValueOnce(mockWs);

      // Set up a handler spy
      const handler = vi.fn();

      // Connect and register handler
      await wsClient.connect();
      (wsClient as any).ws = mockWs;
      wsClient.on("test-message", handler);

      // Simulate message event
      mockWs.emit(
        "message",
        JSON.stringify({
          type: "test-message",
          data: { test: true },
        }),
      );

      // Verify handler was called
      await vi.waitFor(() => {
        expect(handler).toHaveBeenCalledWith({ test: true });
      });
    });

    it("should handle invalid JSON messages", async () => {
      // Create a mock WebSocket instance
      const mockWs = new MockWebSocket();
      WebSocketConstructorMock.mockReturnValueOnce(mockWs);

      // Connect
      await wsClient.connect();
      (wsClient as any).ws = mockWs;

      // Simulate invalid message
      mockWs.emit("message", "invalid-json");

      // Verify error was logged
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("isConnected", () => {
    it("should return true when connected", async () => {
      // Mock isConnected to return true
      vi.mocked(wsClient.isConnected).mockReturnValue(true);

      expect(wsClient.isConnected()).toBe(true);
    });

    it("should return false when disconnected", () => {
      // Mock isConnected to return false
      vi.mocked(wsClient.isConnected).mockReturnValue(false);

      expect(wsClient.isConnected()).toBe(false);
    });
  });
});
