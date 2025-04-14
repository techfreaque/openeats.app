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

  describe("blink patterns", () => {
    beforeEach(() => {
      // Reset the internal state of the LED service
      (ledService as any).isBlinking = false;
      (ledService as any).blinkInterval = null;
      (ledService as any).patternStep = 0;
      vi.clearAllMocks();
    });

    it("should set up SOLID pattern correctly", () => {
      // Act
      ledService.startBlinking(BlinkPattern.SOLID);
      
      // Assert
      expect((ledService as any).currentPattern).toBe(BlinkPattern.SOLID);
      
      // Should set LED to ON (1) immediately for SOLID pattern
      expect(mockLedWrite).toHaveBeenCalledWith(1);
      
      // Should NOT set up an interval for SOLID pattern
      expect((ledService as any).blinkInterval).toBeNull();
      
      // Event should be emitted
      expect(mockEmit).toHaveBeenCalledWith("blinking-started", BlinkPattern.SOLID);
    });

    it("should set up SLOW pattern correctly", () => {
      // Act
      ledService.startBlinking(BlinkPattern.SLOW);
      
      // Assert
      expect((ledService as any).currentPattern).toBe(BlinkPattern.SLOW);
      
      // Verify interval was set
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
      
      // Simulate interval elapsed (LED toggle)
      vi.advanceTimersByTime(1000);
      expect(mockLedWrite).toHaveBeenCalledWith(1);
      
      // Toggle again
      vi.advanceTimersByTime(1000);
      expect(mockLedWrite).toHaveBeenCalledWith(0);
    });

    it("should set up FAST pattern correctly", () => {
      // Act
      ledService.startBlinking(BlinkPattern.FAST);
      
      // Assert
      expect((ledService as any).currentPattern).toBe(BlinkPattern.FAST);
      
      // Verify interval was set
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 250);
      
      // Simulate multiple intervals
      vi.advanceTimersByTime(250);
      expect(mockLedWrite).toHaveBeenCalledWith(1);
      
      vi.advanceTimersByTime(250);
      expect(mockLedWrite).toHaveBeenCalledWith(0);
      
      vi.advanceTimersByTime(250);
      expect(mockLedWrite).toHaveBeenCalledWith(1);
    });

    it("should set up PULSE pattern correctly", () => {
      // Act
      ledService.startBlinking(BlinkPattern.PULSE);
      
      // Assert
      expect((ledService as any).currentPattern).toBe(BlinkPattern.PULSE);
      
      // Verify first interval step
      expect(setInterval).toHaveBeenCalled();
      
      // Simulate running through pulse cycle steps
      vi.advanceTimersByTime(100);
      expect(mockLedWrite).toHaveBeenCalledWith(1);
      
      vi.advanceTimersByTime(100);
      expect(mockLedWrite).toHaveBeenCalledWith(0);
      
      // Should change interval timing for next pulse step
      expect(clearInterval).toHaveBeenCalled();
      expect(setInterval).toHaveBeenCalledTimes(2);
    });

    it("should set up SOS pattern correctly", () => {
      // Act
      ledService.startBlinking(BlinkPattern.SOS);
      
      // Assert
      expect((ledService as any).currentPattern).toBe(BlinkPattern.SOS);
      
      // Verify interval was set with SOS timing (200ms)
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 200);
      
      // Simulate the first few steps of SOS pattern 
      // First dot
      vi.advanceTimersByTime(200);
      expect(mockLedWrite).toHaveBeenCalledWith(1);
      
      // First gap
      vi.advanceTimersByTime(200);
      expect(mockLedWrite).toHaveBeenCalledWith(0);
      
      // Second dot
      vi.advanceTimersByTime(200);
      expect(mockLedWrite).toHaveBeenCalledWith(1);
    });

    it("should set up DOUBLE pattern correctly", () => {
      // Act
      ledService.startBlinking(BlinkPattern.DOUBLE);
      
      // Assert
      expect((ledService as any).currentPattern).toBe(BlinkPattern.DOUBLE);
      
      // Verify interval was set
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 200);
      
      // First blink
      vi.advanceTimersByTime(200);
      expect(mockLedWrite).toHaveBeenCalledWith(1);
      
      // First gap
      vi.advanceTimersByTime(200);
      expect(mockLedWrite).toHaveBeenCalledWith(0);
      
      // Second blink
      vi.advanceTimersByTime(200);
      expect(mockLedWrite).toHaveBeenCalledWith(1);
      
      // Second gap
      vi.advanceTimersByTime(200);
      expect(mockLedWrite).toHaveBeenCalledWith(0);
      
      // Long pause part 1
      vi.advanceTimersByTime(200);
      expect(mockLedWrite).toHaveBeenCalledWith(0);
      
      // Long pause part 2
      vi.advanceTimersByTime(200);
      expect(mockLedWrite).toHaveBeenCalledWith(0);
      
      // Pattern restart - first blink again
      vi.advanceTimersByTime(200);
      expect(mockLedWrite).toHaveBeenCalledWith(1);
    });

    it("should change pattern while already blinking", () => {
      // Start with normal pattern
      ledService.startBlinking(BlinkPattern.NORMAL);
      vi.clearAllMocks(); // Reset mocks after initial setup
      
      // Switch to SOS pattern
      ledService.startBlinking(BlinkPattern.SOS);
      
      // Should not stop blinking, just change the pattern
      expect((ledService as any).isBlinking).toBe(true);
      expect((ledService as any).currentPattern).toBe(BlinkPattern.SOS);
      expect((ledService as any).patternStep).toBe(0); // Reset step counter
      
      // Event should be emitted for new pattern
      expect(mockEmit).toHaveBeenCalledWith("blinking-started", BlinkPattern.SOS);
    });

    it("should not restart if already using same pattern", () => {
      // Start with normal pattern
      ledService.startBlinking(BlinkPattern.NORMAL);
      vi.clearAllMocks(); // Reset mocks after initial setup
      
      // Try to start with normal pattern again
      ledService.startBlinking(BlinkPattern.NORMAL);
      
      // Should remain in same state, no changes
      expect((ledService as any).currentPattern).toBe(BlinkPattern.NORMAL);
      
      // Event should NOT be emitted since pattern didn't change
      expect(mockEmit).not.toHaveBeenCalledWith("blinking-started", BlinkPattern.NORMAL);
    });
  });

  describe("timeout behavior", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.clearAllMocks();
    });

    it("should auto-stop blinking after default timeout", () => {
      // Create service with 5 second timeout
      const timeoutService = new LedNotificationService(17, 27, 500, 5000);
      (timeoutService as any).led = mockLed;
      (timeoutService as any).isGpioSupported = true;
      
      // Start blinking
      timeoutService.startBlinking(BlinkPattern.NORMAL);
      
      // Verify timeout was set
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
      
      // Fast-forward to just before timeout
      vi.advanceTimersByTime(4999);
      expect((timeoutService as any).isBlinking).toBe(true);
      
      // Fast-forward to trigger timeout
      vi.advanceTimersByTime(1);
      
      // Should have stopped blinking
      expect((timeoutService as any).isBlinking).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("auto-expired"));
      expect(mockEmit).toHaveBeenCalledWith("blinking-stopped");
      
      // Clean up
      timeoutService.cleanup();
    });

    it("should clear existing timeout when stopping manually", () => {
      // Set up timeout spy
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
      
      // Start blinking with timeout
      ledService.startBlinking(BlinkPattern.NORMAL, 10000);
      
      // Stop before timeout triggers
      ledService.stopBlinking();
      
      // Should have cleared the timeout
      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect((ledService as any).blinkTimeoutTimer).toBeNull();
    });

    it("should use custom timeout when specified", () => {
      // Default timeout is 30000ms, but we'll provide a custom one
      const customTimeout = 15000;
      
      // Start blinking with custom timeout
      ledService.startBlinking(BlinkPattern.NORMAL, customTimeout);
      
      // Verify timeout was set with custom value
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), customTimeout);
      
      // Fast-forward to trigger timeout
      vi.advanceTimersByTime(customTimeout);
      
      // Should have stopped blinking
      expect((ledService as any).isBlinking).toBe(false);
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should handle LED write errors", () => {
      // Setup LED to throw on write
      mockLedWrite.mockImplementationOnce(() => {
        throw new Error("LED write error");
      });
      
      // Start blinking
      ledService.startBlinking(BlinkPattern.NORMAL);
      
      // Fast-forward to trigger interval
      vi.advanceTimersByTime(500);
      
      // Should log error and emit event
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error during LED operation"), 
        expect.any(Error)
      );
      expect(mockEmit).toHaveBeenCalledWith("error", expect.any(Error));
      
      // Should stop blinking when error occurs
      expect((ledService as any).isBlinking).toBe(false);
    });

    it("should handle button watch errors", () => {
      // Call the watch callback with an error
      if (mockButton.watchCallback) {
        mockButton.watchCallback(new Error("Button watch error"), 0);
        
        // Should log error and emit event
        expect(logger.error).toHaveBeenCalledWith(
          expect.stringContaining("Error watching button"), 
          expect.any(Error)
        );
        expect(mockEmit).toHaveBeenCalledWith("error", expect.any(Error));
      }
    });

    it("should handle LED unexport errors during cleanup", () => {
      // Setup LED to throw on unexport
      mockLedUnexport.mockImplementationOnce(() => {
        throw new Error("LED unexport error");
      });
      
      // Call cleanup
      ledService.cleanup();
      
      // Should log error but not throw
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error unexporting LED"), 
        expect.any(Error)
      );
    });

    it("should handle button unexport errors during cleanup", () => {
      // Setup button to throw on unexport
      mockButtonUnexport.mockImplementationOnce(() => {
        throw new Error("Button unexport error");
      });
      
      // Call cleanup
      ledService.cleanup();
      
      // Should log error but not throw
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error unexporting button"), 
        expect.any(Error)
      );
    });
  });

  describe("initialization", () => {
    let gpioConstructorSpy;
    
    beforeEach(() => {
      vi.clearAllMocks();
      // Create a spy for the GPIO constructor
      gpioConstructorSpy = vi.fn().mockImplementation((pin, direction) => {
        if (direction === "out") return mockLed;
        return mockButton;
      });
      
      // Update the onoff mock to use our spy
      require("onoff").Gpio = gpioConstructorSpy;
    });

    it("should initialize GPIO pins with correct parameters", () => {
      // Reset ledService to trigger initialization
      ledService = new LedNotificationService(22, 23, 500, 30000);
      
      // Verify LED pin initialization
      expect(gpioConstructorSpy).toHaveBeenCalledWith(22, "out");
      
      // Verify button pin initialization
      expect(gpioConstructorSpy).toHaveBeenCalledWith(
        23, 
        "in", 
        "rising", 
        expect.objectContaining({ debounceTimeout: 100 })
      );
      
      // Should turn off LED initially
      expect(mockLedWrite).toHaveBeenCalledWith(0);
    });

    it("should handle GPIO initialization failures", () => {
      // Make GPIO constructor throw
      gpioConstructorSpy.mockImplementationOnce(() => {
        throw new Error("GPIO initialization error");
      });
      
      // Create service - should not throw despite initialization error
      ledService = new LedNotificationService();
      
      // Should log error
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to initialize GPIO"), 
        expect.any(Error)
      );
      
      // Should set isGpioSupported to false
      expect((ledService as any).isGpioSupported).toBe(false);
    });

    it("should handle missing GPIO module gracefully", () => {
      // Simulate GPIO module not available
      const realGpio = require("onoff").Gpio;
      require("onoff").Gpio = undefined;
      
      // Create service - should not throw
      ledService = new LedNotificationService();
      
      // Should log warning
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("GPIO support not available")
      );
      
      // Should set isGpioSupported to false
      expect((ledService as any).isGpioSupported).toBe(false);
      
      // Restore
      require("onoff").Gpio = realGpio;
    });
  });
});
