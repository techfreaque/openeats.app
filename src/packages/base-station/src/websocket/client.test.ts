import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from 'events';
import { MessageType } from '../types';

// Create a custom test message type for the tests
type TestMessage = {
  type: string;
  data: { [key: string]: any };
  apiKey?: string;
};

// Create a mock WebSocket class
class MockWebSocket extends EventEmitter {
  readyState = 1; // WebSocket.OPEN
  send = vi.fn();
  url: string;
  static lastInstance: MockWebSocket | null = null;

  constructor(url: string) {
    super();
    this.url = url;
  }
}

// Add close method to MockWebSocket
interface MockWebSocket {
  close: ReturnType<typeof vi.fn>;
}

MockWebSocket.prototype.close = vi.fn();

// Mock dependencies before imports
vi.mock('ws', () => {
  return {
    default: vi.fn().mockImplementation((url) => {
      const socket = new MockWebSocket(url);
      // Store last created instance for test access
      MockWebSocket.lastInstance = socket;
      return socket;
    }),
    WebSocket: {
      OPEN: 1,
      CLOSED: 3
    }
  };
});

vi.mock('../logging', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  },
  logWebSocketConnection: vi.fn(),
  logError: vi.fn(),
}));

vi.mock('../config', () => ({
  config: {
    websocket: {
      url: 'ws://localhost:8080',
      reconnectInterval: 100,
      maxReconnectAttempts: 3,
    },
    security: {
      apiKey: 'test-api-key',
    },
  },
}));

// Now import the client after all mocks are set up
import { wsClient } from './client';

// Get references to mocked modules
const mockLogger = vi.mocked(require('../logging').default);
const mockLogError = vi.mocked(require('../logging').logError);
const mockLogWebSocketConnection = vi.mocked(require('../logging').logWebSocketConnection);

describe('WebSocket Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset client state using the close method
    (wsClient as any).close();
    (wsClient as any).reconnectAttempts = 0;

    // Reset static reference
    MockWebSocket.lastInstance = null;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('connect', () => {
    it('should connect to the WebSocket server', async () => {
      // Initialize connection
      const connectPromise = wsClient.connect();

      // Access the last created WebSocket instance
      const mockSocketInstance = MockWebSocket.lastInstance;
      expect(mockSocketInstance).not.toBeNull();

      // Simulate open event
      if (mockSocketInstance) {
        mockSocketInstance.emit('open');
      }

      await connectPromise;

      expect(mockLogger.info).toHaveBeenCalledWith('WebSocket connected');
      expect((wsClient as any).connected).toBe(true);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');

      // Initialize connection
      const connectPromise = wsClient.connect();

      // Access the last created WebSocket instance
      const mockSocketInstance = MockWebSocket.lastInstance;
      expect(mockSocketInstance).not.toBeNull();

      // Simulate error event
      if (mockSocketInstance) {
        mockSocketInstance.emit('error', error);
      }

      await connectPromise;

      expect(mockLogError).toHaveBeenCalled();
    });

    it('should attempt to reconnect on connection close', async () => {
      // Initialize connection
      const connectPromise = wsClient.connect();

      // Access the last created WebSocket instance
      const mockSocketInstance = MockWebSocket.lastInstance;
      expect(mockSocketInstance).not.toBeNull();

      // Simulate close event
      if (mockSocketInstance) {
        mockSocketInstance.emit('close');
      }

      await connectPromise;

      // Advance timers to trigger reconnect
      await vi.advanceTimersByTimeAsync(100);

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Scheduling reconnect'));
    });

    it('should respect max reconnect attempts', async () => {
      // Set reconnectAttempts to almost max
      (wsClient as any).reconnectAttempts = 2;

      // Initialize connection
      const connectPromise = wsClient.connect();

      // Access the last created WebSocket instance
      const mockSocketInstance = MockWebSocket.lastInstance;
      expect(mockSocketInstance).not.toBeNull();

      // Simulate close event
      if (mockSocketInstance) {
        mockSocketInstance.emit('close');
      }

      await connectPromise;

      // Advance timers to trigger reconnect
      await vi.advanceTimersByTimeAsync(100);

      // Simulate close event again - should be the final attempt
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('close');
      }

      // Advance timers again
      await vi.advanceTimersByTimeAsync(100);

      // Should now log that max attempts are reached
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Maximum reconnect attempts reached'));

      // Should have exactly 3 total attempts (initial + 2 reconnects)
      expect((wsClient as any).reconnectAttempts).toBe(3);
    });

    it('should reset reconnect attempts on successful connection', async () => {
      // Set reconnectAttempts to a non-zero value
      (wsClient as any).reconnectAttempts = 2;

      // Initialize connection
      const connectPromise = wsClient.connect();

      // Simulate successful connection
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('open');
      }

      await connectPromise;

      // Should reset reconnect attempts
      expect((wsClient as any).reconnectAttempts).toBe(0);
    });

    it('should log connection status', async () => {
      // Initialize connection
      const connectPromise = wsClient.connect();

      // Simulate open event
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('open');
      }

      await connectPromise;

      // Should log connection status
      expect(mockLogWebSocketConnection).toHaveBeenCalledWith(true, 'ws://localhost:8080');

      // Simulate close event
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('close');
      }

      // Should log disconnection
      expect(mockLogWebSocketConnection).toHaveBeenCalledWith(false, 'ws://localhost:8080');
    });
  });

  describe('send', () => {
    it('should send messages when connected', async () => {
      // Initialize connection
      const connectPromise = wsClient.connect();

      // Access the last created WebSocket instance
      const mockSocketInstance = MockWebSocket.lastInstance;
      expect(mockSocketInstance).not.toBeNull();

      // Simulate open event
      if (mockSocketInstance) {
        mockSocketInstance.emit('open');
      }

      await connectPromise;

      // Send a message
      const message = { type: 'status' as any, data: { test: true } };
      wsClient.send(message as any);

      // Verify send was called with correct argument
      if (mockSocketInstance) {
        expect(mockSocketInstance.send).toHaveBeenCalledWith(
          JSON.stringify({ ...message, apiKey: 'test-api-key' })
        );
      }
    });

    it('should not send messages when disconnected', () => {
      // Ensure client is disconnected
      expect((wsClient as any).ws).toBeNull();
      expect((wsClient as any).connected).toBe(false);

      // Attempt to send message
      wsClient.send({ type: 'status' as any, data: { test: true } } as any);

      // Verify warning was logged
      expect(mockLogger.warn).toHaveBeenCalledWith('Cannot send message, WebSocket not connected');
    });

    it('should handle send errors', async () => {
      // Setup connection
      const connectPromise = wsClient.connect();
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('open');
      }
      await connectPromise;

      // Mock send to throw an error
      const sendError = new Error('Send failed');
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.send.mockImplementationOnce(() => {
          throw sendError;
        });
      }

      // Send a message
      wsClient.send({ type: 'status' as any, data: { test: true } } as any);

      // Should log the error
      expect(mockLogError).toHaveBeenCalledWith(expect.any(String), sendError);
    });
  });

  describe('events', () => {
    it('should handle WebSocket messages', async () => {
      // Initialize connection
      const connectPromise = wsClient.connect();

      // Access the last created WebSocket instance
      const mockSocketInstance = MockWebSocket.lastInstance;
      expect(mockSocketInstance).not.toBeNull();

      // Simulate open event
      if (mockSocketInstance) {
        mockSocketInstance.emit('open');
      }

      await connectPromise;

      // Set up event handler
      const handler = vi.fn();
      wsClient.on('test-event', handler);

      // Simulate message event
      const message = { type: 'test-event', data: { test: true } };
      if (mockSocketInstance) {
        mockSocketInstance.emit('message', JSON.stringify(message));
      }

      // Verify handler was called with correct data
      expect(handler).toHaveBeenCalledWith(message.data);
    });

    it('should handle malformed JSON messages', async () => {
      // Initialize connection
      const connectPromise = wsClient.connect();
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('open');
      }
      await connectPromise;

      // Simulate malformed message
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('message', 'not-valid-json');
      }

      // Should log an error
      expect(mockLogError).toHaveBeenCalled();
    });

    it('should ignore messages with unknown types', async () => {
      // Initialize connection
      const connectPromise = wsClient.connect();
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('open');
      }
      await connectPromise;

      // Set up handler that should not be called
      const handler = vi.fn();
      wsClient.on('test-event', handler);

      // Simulate message with different type
      const message = { type: 'unknown-event', data: { test: true } };
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('message', JSON.stringify(message));
      }

      // Handler should not be called
      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple event handlers', async () => {
      // Initialize connection
      const connectPromise = wsClient.connect();
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('open');
      }
      await connectPromise;

      // Set up multiple handlers for same event
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      wsClient.on('test-event', handler1);
      wsClient.on('test-event', handler2);

      // Simulate message
      const message = { type: 'test-event', data: { test: true } };
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('message', JSON.stringify(message));
      }

      // Both handlers should be called
      expect(handler1).toHaveBeenCalledWith(message.data);
      expect(handler2).toHaveBeenCalledWith(message.data);
    });
  });

  describe('close', () => {
    it('should close the WebSocket connection', async () => {
      // Initialize connection
      const connectPromise = wsClient.connect();
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.emit('open');
      }
      await connectPromise;

      // Add close method to mock
      const closeSpy = vi.fn();
      if (MockWebSocket.lastInstance) {
        MockWebSocket.lastInstance.close = closeSpy;
      }

      // Close the connection
      wsClient.close();

      // Should call close
      expect(closeSpy).toHaveBeenCalled();

      // Should reset connected state
      expect((wsClient as any).connected).toBe(false);
    });

    it('should handle close when not connected', () => {
      // Ensure not connected
      (wsClient as any).ws = null;
      (wsClient as any).connected = false;

      // Should not throw
      expect(() => wsClient.close()).not.toThrow();
    });
  });
});
