import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";

// Define mock functions and objects BEFORE the mocks
const mockLedWrite = vi.fn();
const mockLedUnexport = vi.fn();
const mockButtonWatch = vi.fn();
const mockButtonUnexport = vi.fn();
const mockOn = vi.fn();
const mockOnce = vi.fn();
const mockOff = vi.fn();
const mockEmit = vi.fn();
const mockRemoveAllListeners = vi.fn();
const mockSetMaxListeners = vi.fn();
const mockListenerCount = vi.fn().mockReturnValue(0);

// Create mock objects
const mockLed = {
  writeSync: mockLedWrite,
  unexport: mockLedUnexport,
};

const mockButton = {
  watchCallback: null,
  watch: vi.fn((callback) => {
    mockButton.watchCallback = callback;
    return mockButton;
  }),
  unexport: mockButtonUnexport,
};

// Create callbacks store for event emitter
const callbacks = {};

// Mock dependencies before importing the tested module
vi.mock("../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }
}));

// Mock the onoff module
vi.mock("onoff", () => ({
  Gpio: vi.fn().mockImplementation((pin, direction) => {
    if (direction === "out") return mockLed;
    return mockButton;
  })
}));

// Mock EventEmitter
vi.mock("events", () => {
  // Implement the on method
  mockOn.mockImplementation((event, callback) => {
    callbacks[event] = callbacks[event] || [];
    callbacks[event].push(callback);
    return { callbacks };
  });
  
  // Implement the emit method
  mockEmit.mockImplementation((event, ...args) => {
    if (callbacks[event]) {
      callbacks[event].forEach(cb => cb(...args));
    }
    return true;
  });
  
  return {
    default: vi.fn(() => ({
      on: mockOn,
      once: mockOnce,
      off: mockOff,
      emit: mockEmit,
      removeAllListeners: mockRemoveAllListeners,
      setMaxListeners: mockSetMaxListeners,
      listenerCount: mockListenerCount,
      callbacks
    })),
    EventEmitter: vi.fn(() => ({
      on: mockOn,
      once: mockOnce,
      off: mockOff,
      emit: mockEmit,
      removeAllListeners: mockRemoveAllListeners,
      setMaxListeners: mockSetMaxListeners,
      listenerCount: mockListenerCount,
      callbacks
    }))
  };
});

// Import after mocks
import { BlinkPattern, LedNotificationService } from "./led-notification";
import logger from "../logging";

describe("LedNotificationService", () => {
  let ledService: LedNotificationService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Create a new instance for each test
    ledService = new LedNotificationService(17, 27, 500, 30000);
    
    // Force internal properties to simulate initialized state
    (ledService as any).led = mockLed;
    (ledService as any).button = mockButton;
    (ledService as any).isGpioSupported = true;
    (ledService as any).blinkInterval = null;
  });

  afterEach(() => {
    vi.useRealTimers();
    if (ledService) {
      ledService.cleanup();
    }
  });

  describe("startBlinking", () => {
    it("should start blinking with the specified pattern", () => {
      // Act
      ledService.startBlinking(BlinkPattern.NORMAL);
      
      // Assert
      expect((ledService as any).isBlinking).toBe(true);
      expect((ledService as any).currentPattern).toBe(BlinkPattern.NORMAL);
      
      // Verify event was emitted
      expect(mockEmit).toHaveBeenCalledWith("blinking-started", BlinkPattern.NORMAL);
    });

    it("should use simulation mode when GPIO is not available", () => {
      // Arrange
      (ledService as any).isGpioSupported = false;
      
      // Act
      ledService.startBlinking();
      
      // Assert
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("LED blinking simulated"));
    });

    it("should set up timeout when specified", () => {
      // Arrange
      const timeoutSpy = vi.spyOn(global, "setTimeout");
      
      // Act
      ledService.startBlinking(BlinkPattern.NORMAL, 5000);
      
      // Assert
      expect(timeoutSpy).toHaveBeenCalled();
      expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    });
  });

  describe("stopBlinking", () => {
    it("should stop blinking and reset state", () => {
      // Arrange
      (ledService as any).isBlinking = true;
      (ledService as any).blinkInterval = setInterval(() => {}, 1000);
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");
      
      // Act
      ledService.stopBlinking();
      
      // Assert
      expect((ledService as any).isBlinking).toBe(false);
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(mockEmit).toHaveBeenCalledWith("blinking-stopped");
    });

    it("should handle stopping when not active", () => {
      // Already not blinking
      (ledService as any).isBlinking = false;
      (ledService as any).blinkInterval = null;
      
      // Act - should not throw
      ledService.stopBlinking();
      
      // Assert - still not active
      expect((ledService as any).isBlinking).toBe(false);
    });
  });

  describe("event handling", () => {
    it("should register event listeners with on method", () => {
      // Arrange
      const callback = vi.fn();
      
      // Act
      ledService.on("blinking-started", callback);
      
      // Assert
      expect(mockOn).toHaveBeenCalledWith("blinking-started", callback);
    });

    it("should register one-time event listeners with once method", () => {
      // Arrange
      const callback = vi.fn();
      
      // Act
      ledService.once("blinking-stopped", callback);
      
      // Assert
      expect(mockOnce).toHaveBeenCalledWith("blinking-stopped", callback);
    });

    it("should remove event listeners with off method", () => {
      // Arrange
      const callback = vi.fn();
      
      // Act
      ledService.off("error", callback);
      
      // Assert
      expect(mockOff).toHaveBeenCalledWith("error", callback);
    });

    it("should handle button press events", () => {
      // Arrange
      (ledService as any).isBlinking = true;
      const onAckSpy = vi.fn();
      
      // Register the acknowledgement handler
      ledService.onAcknowledged(onAckSpy);
      
      // Act - simulate button press
      if (mockButton.watchCallback) {
        // Call the button callback directly
        mockButton.watchCallback(null, 1);
      }
      
      // Assert
      expect(mockEmit).toHaveBeenCalledWith("notification-acknowledged");
      
      // Since we've setup the emit mock to actually call handlers,
      // the onAckSpy should have been called
      expect(onAckSpy).toHaveBeenCalled();
    });
  });

  describe("utility methods", () => {
    it("should simulate button press", () => {
      // Arrange
      (ledService as any).isBlinking = true;
      
      // Act
      ledService.simulateButtonPress();
      
      // Assert
      expect(mockEmit).toHaveBeenCalledWith("notification-acknowledged");
    });

    it("should report correct active status", () => {
      // Initially not active
      (ledService as any).isBlinking = false;
      expect(ledService.isActive()).toBe(false);
      
      // Set blinking flag and check
      (ledService as any).isBlinking = true;
      expect(ledService.isActive()).toBe(true);
      
      // Set back to false and check again
      (ledService as any).isBlinking = false;
      expect(ledService.isActive()).toBe(false);
    });

    it("should return the current pattern", () => {
      // Default pattern
      (ledService as any).currentPattern = BlinkPattern.NORMAL;
      expect(ledService.getCurrentPattern()).toBe(BlinkPattern.NORMAL);
      
      // Set custom pattern and check
      (ledService as any).currentPattern = BlinkPattern.SOS;
      expect(ledService.getCurrentPattern()).toBe(BlinkPattern.SOS);
    });

    it("should clean up resources", () => {
      // Arrange
      (ledService as any).isBlinking = true;
      (ledService as any).blinkInterval = setInterval(() => {}, 1000);
      
      // Act
      ledService.cleanup();
      
      // Assert
      expect(mockLed.unexport).toHaveBeenCalled();
      expect(mockButton.unexport).toHaveBeenCalled();
      expect(mockRemoveAllListeners).toHaveBeenCalled();
      expect((ledService as any).isBlinking).toBe(false);
    });
  });
});
