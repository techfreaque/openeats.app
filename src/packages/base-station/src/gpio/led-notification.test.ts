import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { BlinkPattern, LedNotificationService } from "./led-notification";
import logger from "../logging";

// Create mock LED and button instances
const mockLed = {
  writeSync: vi.fn(),
  unexport: vi.fn(),
};

const mockButton = {
  watchCallback: null,
  watch: vi.fn(callback => {
    mockButton.watchCallback = callback;
    return mockButton;
  }),
  unexport: vi.fn(),
};

// Mock the onoff module with a proper class implementation
vi.mock("onoff", () => {
  return {
    Gpio: vi.fn().mockImplementation((pin, direction) => {
      // Return different mock objects based on the pin/direction
      if (direction === "out") {
        return mockLed;
      } else {
        return mockButton;
      }
    })
  };
});

// Mock logger
vi.mock("../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Create mock for EventEmitter
const mockEventEmitter = {
  on: vi.fn(),
  once: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  removeAllListeners: vi.fn(),
};

// Mock the EventEmitter constructor
vi.mock("events", () => ({
  default: vi.fn().mockImplementation(() => mockEventEmitter)
}));

describe("LedNotificationService", () => {
  let ledService: LedNotificationService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Create a new instance for each test with a mocked private events object
    ledService = new LedNotificationService(17, 27, 500, 30000);
    
    // Force internal properties to simulate initialized state
    (ledService as any).led = mockLed;
    (ledService as any).button = mockButton;
    (ledService as any).isGpioSupported = true;
    (ledService as any).events = mockEventEmitter;
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
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("blinking-started", BlinkPattern.NORMAL);
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
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("blinking-stopped");
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
      expect(mockEventEmitter.on).toHaveBeenCalledWith("blinking-started", callback);
    });

    it("should register one-time event listeners with once method", () => {
      // Arrange
      const callback = vi.fn();
      
      // Act
      ledService.once("blinking-stopped", callback);
      
      // Assert
      expect(mockEventEmitter.once).toHaveBeenCalledWith("blinking-stopped", callback);
    });

    it("should remove event listeners with off method", () => {
      // Arrange
      const callback = vi.fn();
      
      // Act
      ledService.off("error", callback);
      
      // Assert
      expect(mockEventEmitter.off).toHaveBeenCalledWith("error", callback);
    });

    it("should handle button press events", () => {
      // Arrange
      (ledService as any).isBlinking = true;
      const onAckSpy = vi.fn();
      ledService.onAcknowledged(onAckSpy);
      
      // Simulate the on method being called and registered
      mockEventEmitter.on.mockImplementationOnce((event, callback) => {
        if (event === "notification-acknowledged") {
          // Store the callback
          mockEventEmitter._acknowledgeCallback = callback;
        }
      });
      
      // Act - simulate button press
      if (mockButton.watchCallback) {
        mockButton.watchCallback(null, 1);
        // Manually trigger the event since we're mocking the EventEmitter
        if (mockEventEmitter._acknowledgeCallback) {
          mockEventEmitter._acknowledgeCallback();
        }
      }
      
      // Assert
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
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("notification-acknowledged");
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
      expect(mockEventEmitter.removeAllListeners).toHaveBeenCalled();
      expect((ledService as any).isBlinking).toBe(false);
    });
  });
});
