import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from 'events';

// Mock dependencies first - these get hoisted to the top by Vitest
vi.mock('ws', () => {
  // Create a mock WebSocket class inside the mock factory
  class MockWebSocket extends EventEmitter {
    readyState = 1; // WebSocket.OPEN
    send = vi.fn();
    url: string;
    close = vi.fn();
    static lastInstance: any = null;

    constructor(url: string) {
      super();
      this.url = url;
      MockWebSocket.lastInstance = this;
    }
  }

  return {
    default: vi.fn().mockImplementation((url) => {
      return new MockWebSocket(url);
    }),
    WebSocket: {
      OPEN: 1,
      CLOSED: 3
    }
  };
});

// Mock logging module
const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
};

const mockLogError = vi.fn();
const mockLogWebSocketConnection = vi.fn();

vi.mock('../logging', () => ({
  default: mockLogger,
  logWebSocketConnection: mockLogWebSocketConnection,
  logError: mockLogError,
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

// Import client module after mocks
import { wsClient } from './client';
import { MessageType } from '../types';

// Helper to get the last WebSocket instance
function getLastWebSocketInstance() {
  return require('ws').default.mock.results[require('ws').default.mock.results.length - 1].value;
}

// Type for test messages
type TestMessage = {
  type: string;
  data: { [key: string]: any };
  apiKey?: string;
};

describe('WebSocket Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe('connect', () => {
    it('should connect to the WebSocket server', () => {
      // Call the connect method
      wsClient.connect();
      
      // Verify WebSocket was instantiated with correct URL
      expect(require('ws').default).toHaveBeenCalledWith('ws://localhost:8080');
      
      // Verify connection logging happened
      expect(mockLogWebSocketConnection).toHaveBeenCalled();
    });

    it('should handle connection errors', () => {
      // Connect
      wsClient.connect();
      
      // Get the WebSocket instance
      const ws = getLastWebSocketInstance();
      
      // Simulate an error
      ws.emit('error', new Error('Connection failed'));
      
      // Verify error was logged
      expect(mockLogError).toHaveBeenCalled();
    });

    it('should attempt to reconnect on connection close', () => {
      // Connect
      wsClient.connect();
      
      // Clear mocks to check for reconnection
      vi.clearAllMocks();
      
      // Get the WebSocket instance
      const ws = getLastWebSocketInstance();
      
      // Simulate connection close
      ws.emit('close');
      
      // Fast forward past the reconnect interval
      vi.advanceTimersByTime(100);
      
      // Should have attempted to reconnect
      expect(require('ws').default).toHaveBeenCalledTimes(1);
    });

    it('should respect max reconnect attempts', () => {
      // Connect
      wsClient.connect();
      
      // Simulate multiple connection closes to reach max attempts
      for (let i = 0; i < 3; i++) {
        const ws = getLastWebSocketInstance();
        ws.emit('close');
        vi.advanceTimersByTime(100);
      }
      
      // Clear mocks to check no more reconnections happen
      vi.clearAllMocks();
      vi.advanceTimersByTime(100);
      
      // Should not try to reconnect again
      expect(require('ws').default).not.toHaveBeenCalled();
    });

    it('should reset reconnect attempts on successful connection', () => {
      // Connect
      wsClient.connect();
      
      // Simulate a couple of failed attempts
      for (let i = 0; i < 2; i++) {
        const ws = getLastWebSocketInstance();
        ws.emit('close');
        vi.advanceTimersByTime(100);
      }
      
      // Simulate a message which indicates successful connection
      const ws = getLastWebSocketInstance();
      ws.emit('message', JSON.stringify({ type: 'ping' }));
      
      // Clear mocks for clarity
      vi.clearAllMocks();
      
      // Simulate another close
      ws.emit('close');
      vi.advanceTimersByTime(100);
      
      // Should try to reconnect because counter was reset
      expect(require('ws').default).toHaveBeenCalled();
    });

    it('should log connection status', () => {
      // Connect
      wsClient.connect();
      
      // Simulate connection open
      const ws = getLastWebSocketInstance();
      ws.emit('open');
      
      // Check if connection was logged
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('connected'));
    });
  });

  describe('send', () => {
    it('should send messages when connected', () => {
      // Connect
      wsClient.connect();
      
      // Get WebSocket instance
      const ws = getLastWebSocketInstance();
      
      // Prepare test message
      const message: TestMessage = {
        type: 'test',
        data: { foo: 'bar' }
      };
      
      // Send the message
      wsClient.send(message);
      
      // Verify message was sent with API key
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({
          ...message,
          apiKey: 'test-api-key'
        })
      );
    });

    it('should not send messages when disconnected', () => {
      // Connect
      wsClient.connect();
      
      // Get WebSocket instance and set it to closed
      const ws = getLastWebSocketInstance();
      ws.readyState = 3; // WebSocket.CLOSED
      
      // Try to send a message
      wsClient.send({
        type: 'test',
        data: { foo: 'bar' }
      });
      
      // Verify message was not sent
      expect(ws.send).not.toHaveBeenCalled();
    });

    it('should handle send errors', () => {
      // Connect
      wsClient.connect();
      
      // Get WebSocket instance and mock send to throw error
      const ws = getLastWebSocketInstance();
      ws.send.mockImplementationOnce(() => {
        throw new Error('Send failed');
      });
      
      // Try to send a message
      wsClient.send({
        type: 'test',
        data: { foo: 'bar' }
      });
      
      // Error should be logged
      expect(mockLogError).toHaveBeenCalled();
    });
  });

  describe('events', () => {
    it('should handle WebSocket messages', () => {
      // Connect
      wsClient.connect();
      
      // Set up a handler
      const messageHandler = vi.fn();
      wsClient.on('test-event', messageHandler);
      
      // Simulate receiving a message
      const ws = getLastWebSocketInstance();
      ws.emit('message', JSON.stringify({
        type: 'test-event',
        data: { foo: 'bar' }
      }));
      
      // Verify handler was called with the data
      expect(messageHandler).toHaveBeenCalledWith({ foo: 'bar' });
    });

    it('should handle malformed JSON messages', () => {
      // Connect
      wsClient.connect();
      
      // Simulate receiving an invalid message
      const ws = getLastWebSocketInstance();
      ws.emit('message', 'not json');
      
      // Verify error was logged
      expect(mockLogError).toHaveBeenCalled();
    });

    it('should ignore messages with unknown types', () => {
      // Connect
      wsClient.connect();
      
      // Set up a handler for a specific type
      const messageHandler = vi.fn();
      wsClient.on('known-type', messageHandler);
      
      // Simulate receiving a message with unknown type
      const ws = getLastWebSocketInstance();
      ws.emit('message', JSON.stringify({
        type: 'unknown-type',
        data: { foo: 'bar' }
      }));
      
      // Handler should not be called
      expect(messageHandler).not.toHaveBeenCalled();
    });

    it('should support multiple event handlers', () => {
      // Connect
      wsClient.connect();
      
      // Set up multiple handlers
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      wsClient.on('test-event', handler1);
      wsClient.on('test-event', handler2);
      
      // Simulate receiving a message
      const ws = getLastWebSocketInstance();
      ws.emit('message', JSON.stringify({
        type: 'test-event',
        data: { foo: 'bar' }
      }));
      
      // Verify both handlers were called
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close the WebSocket connection', () => {
      // Connect
      wsClient.connect();
      
      // Get WebSocket instance
      const ws = getLastWebSocketInstance();
      
      // Close the connection
      wsClient.close();
      
      // Verify close was called
      expect(ws.close).toHaveBeenCalled();
    });

    it('should handle close when not connected', () => {
      // Close without connecting first
      wsClient.close();
      
      // Should complete successfully without error
      expect(true).toBe(true);
    });
  });
});
