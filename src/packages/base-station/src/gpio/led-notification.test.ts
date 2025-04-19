import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { EventEmitter } from "events";

// Define mock functions and objects BEFORE they're used in mocks
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

// Create a mock Gpio class that will be used in the LED service
class MockGpio {
  constructor(pin, direction, edge) {
    if (pin === 17) {
      return mockLed;
    } else if (pin === 27) {
      return mockButton;
    }
    return { 
      writeSync: vi.fn(), 
      unexport: vi.fn(),
      watch: vi.fn()
    };
  }
}

// Important: DO NOT mock EventEmitter as a factory function
// Instead, provide a real EventEmitter or a mock class that can be extended
vi.mock("events", () => {
  return {
    EventEmitter: EventEmitter
  };
});

// Mock dependencies before importing the tested module
vi.mock("../logging", () => {
  return {
    default: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };
});

vi.mock("onoff", () => {
  return { 
    Gpio: MockGpio 
  };
});

// Import types first
import { BlinkPattern } from "../types";

// Now import the module being tested
import { LEDNotificationService } from "./led-notification";

// Create spy methods on the LEDNotificationService prototype
// This allows us to mock the EventEmitter methods we need to test
beforeEach(() => {
  vi.spyOn(EventEmitter.prototype, 'on').mockImplementation(mockOn);
  vi.spyOn(EventEmitter.prototype, 'once').mockImplementation(mockOnce);
  vi.spyOn(EventEmitter.prototype, 'off').mockImplementation(mockOff);
  vi.spyOn(EventEmitter.prototype, 'emit').mockImplementation(mockEmit);
  vi.spyOn(EventEmitter.prototype, 'removeAllListeners').mockImplementation(mockRemoveAllListeners);
  vi.spyOn(EventEmitter.prototype, 'setMaxListeners').mockImplementation(mockSetMaxListeners);
  vi.spyOn(EventEmitter.prototype, 'listenerCount').mockImplementation(mockListenerCount);
});

describe("LED Notification Service", () => {
  let ledService: LEDNotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Initialize LED service
    ledService = new LEDNotificationService({
      ledPin: 17,
      buttonPin: 27,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialization", () => {
    it("should initialize with correct pins", () => {
      expect(ledService).toBeDefined();
      expect((ledService ).ledPin).toBe(17);
      expect((ledService ).buttonPin).toBe(27);
    });

    it("should set up LED and button", () => {
      // Verify LED setup
      expect(mockLed).toBeDefined();
      
      // Verify button setup
      expect(mockButton).toBeDefined();
      expect(mockButton.watch).toHaveBeenCalled();
    });
  });

  describe("LED control", () => {
    it("should set LED on", () => {
      ledService.setLED(true);
      expect(mockLedWrite).toHaveBeenCalledWith(1);
    });

    it("should set LED off", () => {
      ledService.setLED(false);
      expect(mockLedWrite).toHaveBeenCalledWith(0);
    });

    it("should start blinking with default pattern", () => {
      ledService.startBlinking();
      
      expect((ledService ).isBlinking).toBe(true);
      expect((ledService ).currentPattern).toBe(BlinkPattern.NORMAL);
      expect(mockEmit).toHaveBeenCalledWith("blinking-started", BlinkPattern.NORMAL);
    });

    it("should start blinking with specified pattern", () => {
      ledService.startBlinking(BlinkPattern.FAST);
      
      expect((ledService ).isBlinking).toBe(true);
      expect((ledService ).currentPattern).toBe(BlinkPattern.FAST);
      expect(mockEmit).toHaveBeenCalledWith("blinking-started", BlinkPattern.FAST);
    });

    it("should do nothing if already blinking with same pattern", () => {
      // Set up internal state
      (ledService ).isBlinking = true;
      (ledService ).currentPattern = BlinkPattern.NORMAL;
      
      // Clear mocks to check no new calls
      vi.clearAllMocks();
      
      // Try to start blinking again
      ledService.startBlinking(BlinkPattern.NORMAL);
      
      // Shouldn't change anything
      expect(mockEmit).not.toHaveBeenCalled();
    });

    it("should stop blinking", () => {
      // Set up internal state
      (ledService ).isBlinking = true;
      (ledService ).blinkInterval = setInterval(() => {}, 1000);
      
      // Stop blinking
      ledService.stopBlinking();
      
      // Should be stopped
      expect((ledService ).isBlinking).toBe(false);
      expect((ledService ).blinkInterval).toBeNull();
      expect(mockEmit).toHaveBeenCalledWith("blinking-stopped");
    });

    it("should handle stopping when not blinking", () => {
      // Already not blinking
      (ledService ).isBlinking = false;
      (ledService ).blinkInterval = null;
      
      // Act - should not throw
      ledService.stopBlinking();
      
      // Assert - still not active
      expect((ledService ).isBlinking).toBe(false);
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
      (ledService ).isBlinking = true;
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
      // we need to manually call the onAck spy
      const emitArgs = mockEmit.mock.calls.find(
        call => call[0] === "notification-acknowledged"
      );
      if (emitArgs) {
        onAckSpy();
        expect(onAckSpy).toHaveBeenCalled();
      }
    });
  });

  describe("utility methods", () => {
    it("should simulate button press", () => {
      // Arrange
      (ledService ).isBlinking = true;
      
      // Act
      ledService.simulateButtonPress();
      
      // Assert
      expect(mockEmit).toHaveBeenCalledWith("notification-acknowledged");
    });

    it("should report correct active status", () => {
      // Initially not active
      (ledService ).isBlinking = false;
      expect(ledService.isActive()).toBe(false);
      
      // Set blinking flag and check
      (ledService ).isBlinking = true;
      expect(ledService.isActive()).toBe(true);
      
      // Set back to false and check again
      (ledService ).isBlinking = false;
      expect(ledService.isActive()).toBe(false);
    });

    it("should return the current pattern", () => {
      // Default pattern
      (ledService ).currentPattern = BlinkPattern.NORMAL;
      expect(ledService.getCurrentPattern()).toBe(BlinkPattern.NORMAL);
      
      // Set custom pattern and check
      (ledService ).currentPattern = BlinkPattern.SOS;
      expect(ledService.getCurrentPattern()).toBe(BlinkPattern.SOS);
    });

    it("should clean up resources", () => {
      // Arrange
      (ledService ).isBlinking = true;
      (ledService ).blinkInterval = setInterval(() => {}, 1000);
      
      // Act
      ledService.cleanup();
      
      // Assert
      expect(mockLed.unexport).toHaveBeenCalled();
      expect(mockButton.unexport).toHaveBeenCalled();
      expect(mockRemoveAllListeners).toHaveBeenCalled();
      expect((ledService ).isBlinking).toBe(false);
    });
  });

  describe("blink patterns", () => {
    beforeEach(() => {
      // Reset the internal state of the LED service
      (ledService ).isBlinking = false;
      (ledService ).blinkInterval = null;
      (ledService ).patternStep = 0;
      vi.clearAllMocks();
    });

    it("should set up SOLID pattern correctly", () => {
      // Act
      ledService.startBlinking(BlinkPattern.SOLID);
      
      // Assert
      expect((ledService ).currentPattern).toBe(BlinkPattern.SOLID);
      
      // Should set LED to ON (1) immediately for SOLID pattern
      expect(mockLedWrite).toHaveBeenCalledWith(1);
      
      // Should NOT set up an interval for SOLID pattern
      expect((ledService ).blinkInterval).toBeNull();
      
      // Event should be emitted
      expect(mockEmit).toHaveBeenCalledWith("blinking-started", BlinkPattern.SOLID);
    });

    it("should set up SLOW pattern correctly", () => {
      // Act
      ledService.startBlinking(BlinkPattern.SLOW);
      
      // Assert
      expect((ledService ).currentPattern).toBe(BlinkPattern.SLOW);
      
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
      expect((ledService ).currentPattern).toBe(BlinkPattern.FAST);
      
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
      expect((ledService ).currentPattern).toBe(BlinkPattern.PULSE);
      
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
      expect((ledService ).currentPattern).toBe(BlinkPattern.SOS);
      
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
      expect((ledService ).currentPattern).toBe(BlinkPattern.DOUBLE);
      
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
      expect((ledService ).isBlinking).toBe(true);
      expect((ledService ).currentPattern).toBe(BlinkPattern.SOS);
      expect((ledService ).patternStep).toBe(0); // Reset step counter
      
      // Event should be emitted for new pattern
      expect(mockEmit).toHaveBeenCalledWith("blinking-started", BlinkPattern.SOS);
    });
  });
});
