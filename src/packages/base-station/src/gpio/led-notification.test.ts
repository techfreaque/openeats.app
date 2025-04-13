import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import EventEmitter from "events";
import { BlinkPattern, LedNotificationService } from "./led-notification";
import logger from "../logging";

// Mock the onoff module
vi.mock("onoff", () => {
  // Create a proper mock with prototype chain
  class MockGpio {
    constructor() {
      this.writeSync = vi.fn();
      this.watchCallback = null;
      this.watch = vi.fn(callback => {
        this.watchCallback = callback;
      });
      this.unexport = vi.fn();
    }
  }

  return {
    Gpio: MockGpio
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

describe("LedNotificationService", () => {
  let ledService: LedNotificationService;
  let mockGpio: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Create a new instance for each test
    ledService = new LedNotificationService(17, 27, 500, 30000);
    
    // Access and store the mocked GPIO instance
    const MockGpio = require("onoff").Gpio;
    mockGpio = new MockGpio();
    
    // Replace the private LED and button references
    (ledService as any).led = mockGpio;
    (ledService as any).button = mockGpio;
    (ledService as any).isGpioSupported = true;
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
      expect(ledService.isActive()).toBe(true);
      expect(ledService.getCurrentPattern()).toBe(BlinkPattern.NORMAL);
      
      // Verify event was emitted
      const emitSpy = vi.spyOn((ledService as any).events, "emit");
      ledService.startBlinking(BlinkPattern.FAST); // Call again to test the spy
      expect(emitSpy).toHaveBeenCalledWith("blinking-started", BlinkPattern.FAST);
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
      ledService.startBlinking();
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");
      const emitSpy = vi.spyOn((ledService as any).events, "emit");
      
      // Act
      ledService.stopBlinking();
      
      // Assert
      expect(ledService.isActive()).toBe(false);
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith("blinking-stopped");
    });

    it("should handle stopping when not active", () => {
      // Already not blinking
      expect(ledService.isActive()).toBe(false);
      
      // Act - should not throw
      ledService.stopBlinking();
      
      // Assert - still not active
      expect(ledService.isActive()).toBe(false);
    });
  });

  describe("event handling", () => {
    it("should register event listeners with on method", () => {
      // Arrange
      const callback = vi.fn();
      
      // Act
      ledService.on("blinking-started", callback);
      
      // Trigger the event
      (ledService as any).events.emit("blinking-started", BlinkPattern.FAST);
      
      // Assert
      expect(callback).toHaveBeenCalledWith(BlinkPattern.FAST);
    });

    it("should register one-time event listeners with once method", () => {
      // Arrange
      const callback = vi.fn();
      
      // Act
      ledService.once("blinking-stopped", callback);
      
      // Trigger the event twice
      (ledService as any).events.emit("blinking-stopped");
      (ledService as any).events.emit("blinking-stopped");
      
      // Assert - should only be called once
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should remove event listeners with off method", () => {
      // Arrange
      const callback = vi.fn();
      ledService.on("error", callback);
      
      // Act
      ledService.off("error", callback);
      
      // Trigger the event
      (ledService as any).events.emit("error", new Error("test error"));
      
      // Assert
      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle button press events", () => {
      // Arrange
      (ledService as any).isBlinking = true;
      const onAckSpy = vi.fn();
      ledService.onAcknowledged(onAckSpy);
      
      // Act - simulate button press
      if (mockGpio.watchCallback) {
        mockGpio.watchCallback(null, 1);
      }
      
      // Assert
      expect(onAckSpy).toHaveBeenCalled();
    });
  });

  describe("utility methods", () => {
    it("should simulate button press", () => {
      // Arrange
      (ledService as any).isBlinking = true;
      const callback = vi.fn();
      ledService.on("notification-acknowledged", callback);
      
      // Act
      ledService.simulateButtonPress();
      
      // Assert
      expect(callback).toHaveBeenCalled();
    });

    it("should report correct active status", () => {
      // Initially not active
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
      expect(ledService.getCurrentPattern()).toBe(BlinkPattern.NORMAL);
      
      // Set custom pattern and check
      (ledService as any).currentPattern = BlinkPattern.SOS;
      expect(ledService.getCurrentPattern()).toBe(BlinkPattern.SOS);
    });

    it("should clean up resources", () => {
      // Arrange
      (ledService as any).isBlinking = true;
      
      // Act
      ledService.cleanup();
      
      // Assert
      expect(mockGpio.unexport).toHaveBeenCalled();
      expect(ledService.isActive()).toBe(false);
    });
  });
});
