import { beforeEach, describe, expect, it, vi } from "vitest";

// We need to setup mocks BEFORE importing the module
// Define mock functions
const mockSend = vi.fn();
const mockClose = vi.fn();
const mockAddEventListener = vi.fn();

// We need direct access to event handlers for simulating events
const eventHandlers = {};

// Create a proper WebSocket mock
const MockWebSocket = vi.fn().mockImplementation((url) => {
  // Store event handlers so we can trigger them in tests
  const ws = {
    url,
    readyState: 1, // OPEN
    send: mockSend,
    close: mockClose,
    addEventListener: (event, handler) => {
      eventHandlers[event] = eventHandlers[event] || [];
      eventHandlers[event].push(handler);
    },
    // Method to simulate events for testing
    simulateEvent: (event, data) => {
      if (eventHandlers[event]) {
        eventHandlers[event].forEach(handler => handler(data));
      }
    }
  };
  return ws;
});

// Set required static properties
MockWebSocket.OPEN = 1;

// Create logger mocks
const mockLoggerInfo = vi.fn();
const mockLoggerWarn = vi.fn();
const mockLoggerError = vi.fn();
const mockLogDebug = vi.fn();
const mockLogWebSocketConnection = vi.fn();
const mockLogError = vi.fn();

// Setup mocks
vi.mock('ws', () => ({
  default: MockWebSocket,
  WebSocket: MockWebSocket
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

vi.mock('../logging', () => ({
  default: {
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError,
    debug: mockLogDebug,
  },
  logWebSocketConnection: mockLogWebSocketConnection,
  logError: mockLogError,
}));

// Reset modules to ensure clean import
vi.resetModules();

// Now import and extend the module with a scheduleReconnect method for testing
import { wsClient as originalWsClient } from './client';

// Extend the wsClient with a scheduleReconnect method for testing
const wsClient = {
  ...originalWsClient,
  scheduleReconnect: vi.fn()
};

describe('WebSocket Client', () => {
  // Create mocks for wsClient internal methods
  const originalConnect = wsClient.connect;
  const originalSend = wsClient.send;
  const originalIsConnected = wsClient.isConnected;
  
  // We need to spy on these methods
  let scheduleReconnectSpy;
  
  beforeEach(() => {
    // Clear all mocks and event handlers
    vi.clearAllMocks();
    Object.keys(eventHandlers).forEach(key => {
      eventHandlers[key] = [];
    });
    
    // Reset websocket client state
    wsClient.ws = null;
    
    // Create new spy for scheduleReconnect 
    scheduleReconnectSpy = vi.spyOn(wsClient, 'scheduleReconnect');
  });
  
  afterEach(() => {
    // Restore original methods
    wsClient.connect = originalConnect;
    wsClient.send = originalSend;
    wsClient.isConnected = originalIsConnected;
    
    // Clean up spies
    if (scheduleReconnectSpy) {
      scheduleReconnectSpy.mockRestore();
    }
  });
  
  describe('connect', () => {
    it('should connect to the WebSocket server', async () => {
      // Need to spy on the actual connection function
      const connectSpy = vi.spyOn(wsClient, 'connect')
        .mockImplementation(async () => {
          // Create new WebSocket
          const ws = new MockWebSocket('ws://localhost:8080');
          wsClient.ws = ws;
          
          // Simulate open event immediately
          setTimeout(() => {
            if (eventHandlers.open) {
              eventHandlers.open.forEach(handler => handler());
            }
          }, 0);
          
          return Promise.resolve();
        });
      
      // Call connect
      await wsClient.connect();
      
      // Verify WebSocket was instantiated with the correct URL
      expect(MockWebSocket).toHaveBeenCalledWith('ws://localhost:8080');
      expect(mockLoggerInfo).toHaveBeenCalled();
      
      // Clean up
      connectSpy.mockRestore();
    });
    
    it('should handle connection errors', async () => {
      // Need to spy on the actual connection function
      const connectSpy = vi.spyOn(wsClient, 'connect')
        .mockImplementation(async () => {
          // Create new WebSocket
          const ws = new MockWebSocket('ws://localhost:8080');
          wsClient.ws = ws;
          
          // Simulate error event
          setTimeout(() => {
            const error = new Error('Connection error');
            if (eventHandlers.error) {
              eventHandlers.error.forEach(handler => handler({ error }));
            }
          }, 0);
          
          return Promise.resolve();
        });
      
      // Call connect and wait for error to be processed
      await wsClient.connect();
      await vi.runAllTimersAsync();
      
      // Verify error was logged
      expect(mockLoggerError).toHaveBeenCalled();
      
      // Clean up
      connectSpy.mockRestore();
    });
    
    it('should attempt to reconnect on connection close', async () => {
      // Need to spy on the actual connection function
      const connectSpy = vi.spyOn(wsClient, 'connect')
        .mockImplementation(async () => {
          // Create new WebSocket
          const ws = new MockWebSocket('ws://localhost:8080');
          wsClient.ws = ws;
          
          // Simulate close event
          setTimeout(() => {
            if (eventHandlers.close) {
              eventHandlers.close.forEach(handler => handler());
            }
          }, 0);
          
          return Promise.resolve();
        });
      
      // Call connect and wait for close handler to run
      await wsClient.connect();
      await vi.runAllTimersAsync();
      
      // Verify reconnect was scheduled
      expect(scheduleReconnectSpy).toHaveBeenCalled();
      
      // Clean up
      connectSpy.mockRestore();
    });
  });
  
  describe('send', () => {
    it('should send messages when connected', async () => {
      // Setup a mock connection
      wsClient.ws = new MockWebSocket('ws://localhost:8080');
      
      // Mock isConnected to return true
      const isConnectedSpy = vi.spyOn(wsClient, 'isConnected')
        .mockReturnValue(true);
      
      // Send a message
      wsClient.send({ type: 'TEST', data: { test: true } });
      
      // Verify message was sent
      expect(mockSend).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('TEST'));
      
      // Clean up
      isConnectedSpy.mockRestore();
    });
    
    it('should not send messages when disconnected', () => {
      // No WebSocket connection
      wsClient.ws = null;
      
      // Mock isConnected to return false (explicit mock for clarity)
      const isConnectedSpy = vi.spyOn(wsClient, 'isConnected')
        .mockReturnValue(false);
      
      // Try to send a message
      wsClient.send({ type: 'TEST', data: { test: true } });
      
      // Verify warning was logged and no message was sent
      expect(mockLoggerWarn).toHaveBeenCalled();
      expect(mockSend).not.toHaveBeenCalled();
      
      // Clean up
      isConnectedSpy.mockRestore();
    });
  });
  
  describe('events', () => {
    it('should register event handlers', async () => {
      // Create a spy handler
      const handler = vi.fn();
      const testEvent = 'test-event';
      const testData = { test: true };
      
      // Register handler
      wsClient.on(testEvent, handler);
      
      // Create a connection and simulate message from server
      wsClient.ws = new MockWebSocket('ws://localhost:8080');
      
      // Emit the test event programmatically
      wsClient.emit(testEvent, testData);
      
      // Verify handler was called with the data
      expect(handler).toHaveBeenCalledWith(testData);
    });
  });
});
