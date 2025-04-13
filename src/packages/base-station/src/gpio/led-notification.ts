import EventEmitter from "events";

import logger from "../logging";

// Conditional import to handle non-Raspberry Pi environments
let Gpio: any;
try {
  // Using dynamic import to prevent errors on non-Raspberry Pi platforms
  Gpio = require("onoff").Gpio;
} catch (error) {
  logger.warn("GPIO support not available on this platform");
}

export interface IGpioInterface {
  writeSync(value: number): void;
  watch(callback: (err: Error | null, value: number) => void): void;
  unexport(): void;
}

export enum BlinkPattern {
  SOLID = "solid", // Solid on
  SLOW = "slow", // Slow blink (1 Hz)
  NORMAL = "normal", // Normal blink (2 Hz)
  FAST = "fast", // Fast blink (4 Hz)
  PULSE = "pulse", // Pulsing pattern (fade-like)
  SOS = "sos", // SOS pattern (... --- ...)
  DOUBLE = "double", // Double blink pattern
}

export interface NotificationEvents {
  "notification-acknowledged": void;
  "blinking-started": BlinkPattern;
  "blinking-stopped": void;
  "error": Error;
}

export class LedNotificationService {
  private led: IGpioInterface | null = null;
  private button: IGpioInterface | null = null;
  private blinkInterval: NodeJS.Timeout | null = null;
  private blinkTimeoutTimer: NodeJS.Timeout | null = null;
  private events = new EventEmitter();
  private isBlinking = false;
  private isGpioSupported = false;
  private currentPattern: BlinkPattern = BlinkPattern.NORMAL;
  private patternStep = 0;
  private maxListeners = 10;

  constructor(
    private readonly ledPin = 17, // Default GPIO pin for LED
    private readonly buttonPin = 27, // Default GPIO pin for button
    private readonly blinkRate = 500, // Base blink rate in ms
    private readonly blinkTimeout: number = 30 * 60 * 1000, // Auto-stop after 30 minutes by default
  ) {
    this.initializeGpio();

    // Set max listeners to avoid Node.js warnings
    this.events.setMaxListeners(this.maxListeners);
  }

  private initializeGpio(): void {
    if (!Gpio) {
      logger.info("GPIO support not available. Running in simulation mode.");
      return;
    }

    try {
      this.led = new Gpio(this.ledPin, "out");
      this.button = new Gpio(this.buttonPin, "in", "rising", {
        debounceTimeout: 100,
      });
      this.isGpioSupported = true;

      // Turn off LED initially to ensure known state
      this.led.writeSync(0);

      if (this.button) {
        // Set up button event listener
        this.button.watch((err, value) => {
          if (err) {
            logger.error("Error watching button:", err);
            this.events.emit("error", err);
            return;
          }
          if (value === 1 && this.isBlinking) {
            this.stopBlinking();
            this.events.emit("notification-acknowledged");
          }
        });
      }
    } catch (error) {
      logger.error("Failed to initialize GPIO:", error);
      this.isGpioSupported = false;
    }
  }

  /**
   * Start LED blinking with specified pattern and optional timeout
   * @param pattern Blinking pattern to use
   * @param timeoutMs Optional timeout in milliseconds to auto-stop blinking
   */
  startBlinking(
    pattern: BlinkPattern = BlinkPattern.NORMAL,
    timeoutMs?: number,
  ): void {
    if (this.blinkInterval) {
      // If already blinking, just change the pattern without resetting timeouts
      if (this.currentPattern !== pattern) {
        this.currentPattern = pattern;
        this.patternStep = 0;
      } else {
        return; // Same pattern, nothing to change
      }
    } else {
      // New blinking session
      this.isBlinking = true;
      this.currentPattern = pattern;
      this.patternStep = 0;

      // Set a timeout to auto-stop blinking if not acknowledged
      this.setupBlinkTimeout(timeoutMs);

      if (!this.isGpioSupported || !this.led) {
        logger.info(`LED blinking simulated with pattern: ${pattern}`);
        this.events.emit("blinking-started", pattern);
        return;
      }

      this.executeBlinkPattern();
    }

    this.events.emit("blinking-started", pattern);
  }

  private setupBlinkTimeout(timeoutMs?: number): void {
    if (this.blinkTimeoutTimer) {
      clearTimeout(this.blinkTimeoutTimer);
      this.blinkTimeoutTimer = null;
    }

    const timeout = timeoutMs || this.blinkTimeout;
    if (timeout > 0) {
      this.blinkTimeoutTimer = setTimeout(() => {
        logger.warn(`Notification auto-expired after ${timeout}ms timeout`);
        this.stopBlinking();
      }, timeout);
    }
  }

  private executeBlinkPattern(): void {
    // Clear any existing interval
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }

    // Select the appropriate function based on the pattern
    switch (this.currentPattern) {
      case BlinkPattern.SOLID:
        this.executeSolidPattern();
        break;
      case BlinkPattern.SLOW:
        this.executeBasicPattern(1000); // 1 Hz
        break;
      case BlinkPattern.NORMAL:
        this.executeBasicPattern(500); // 2 Hz
        break;
      case BlinkPattern.FAST:
        this.executeBasicPattern(250); // 4 Hz
        break;
      case BlinkPattern.PULSE:
        this.executePulsePattern();
        break;
      case BlinkPattern.SOS:
        this.executeSOSPattern();
        break;
      case BlinkPattern.DOUBLE:
        this.executeDoublePattern();
        break;
      default:
        this.executeBasicPattern(this.blinkRate);
    }
  }

  /**
   * Simply turn the LED on (solid)
   */
  private executeSolidPattern(): void {
    try {
      this.led?.writeSync(1);
    } catch (error) {
      this.handleBlinkError(error);
    }
  }

  /**
   * Basic on/off pattern with configurable rate
   */
  private executeBasicPattern(rate: number): void {
    let state = 0;
    this.blinkInterval = setInterval(() => {
      try {
        state = state === 0 ? 1 : 0;
        this.led?.writeSync(state);
      } catch (error) {
        this.handleBlinkError(error);
      }
    }, rate);
  }

  /**
   * Pulse pattern implementation
   * For a basic LED this just does a varied-speed blinking
   * (for PWM-capable GPIO, this could do actual fading)
   */
  private executePulsePattern(): void {
    const pulseSteps = [100, 200, 300, 500, 300, 200];
    let pulseIndex = 0;
    let state = 0;

    this.blinkInterval = setInterval(() => {
      try {
        state = state === 0 ? 1 : 0;
        this.led?.writeSync(state);

        // Change the interval dynamically for next toggle
        if (state === 0 && this.blinkInterval) {
          clearInterval(this.blinkInterval);
          pulseIndex = (pulseIndex + 1) % pulseSteps.length;
          this.executePulseStepWithRate(pulseSteps[pulseIndex]);
        }
      } catch (error) {
        this.handleBlinkError(error);
      }
    }, pulseSteps[0]);
  }

  private executePulseStepWithRate(rate: number): void {
    if (!this.isBlinking) {
      return;
    }

    let state = this.led ? 0 : 0;
    this.blinkInterval = setInterval(() => {
      try {
        state = state === 0 ? 1 : 0;
        this.led?.writeSync(state);
      } catch (error) {
        this.handleBlinkError(error);
      }
    }, rate);
  }

  /**
   * SOS pattern (... --- ...)
   */
  private executeSOSPattern(): void {
    const sosPattern = [
      1,
      0,
      1,
      0,
      1,
      0, // ...
      0, // pause
      1,
      1,
      1,
      0,
      1,
      1,
      1,
      0,
      1,
      1,
      1,
      0, // ---
      0, // pause
      1,
      0,
      1,
      0,
      1,
      0, // ...
      0,
      0,
      0,
      0, // long pause before repeat
    ];

    this.patternStep = 0;
    this.blinkInterval = setInterval(() => {
      try {
        if (this.patternStep >= sosPattern.length) {
          this.patternStep = 0; // Reset to beginning of pattern
        }

        const state = sosPattern[this.patternStep];
        this.led?.writeSync(state);
        this.patternStep++;
      } catch (error) {
        this.handleBlinkError(error);
      }
    }, 200);
  }

  /**
   * Double-blink pattern
   */
  private executeDoublePattern(): void {
    const doublePattern = [1, 0, 1, 0, 0, 0]; // on-off-on-off-pause-pause

    this.patternStep = 0;
    this.blinkInterval = setInterval(() => {
      try {
        if (this.patternStep >= doublePattern.length) {
          this.patternStep = 0; // Reset to beginning of pattern
        }

        const state = doublePattern[this.patternStep];
        this.led?.writeSync(state);
        this.patternStep++;
      } catch (error) {
        this.handleBlinkError(error);
      }
    }, 200);
  }

  private handleBlinkError(error: any): void {
    logger.error("Error during LED operation:", error);
    this.events.emit(
      "error",
      error instanceof Error ? error : new Error(String(error)),
    );

    // Try to recover by resetting the LED and stopping the pattern
    this.stopBlinking();
  }

  /**
   * Stop the LED from blinking and clean up resources
   */
  stopBlinking(): void {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;

      if (this.blinkTimeoutTimer) {
        clearTimeout(this.blinkTimeoutTimer);
        this.blinkTimeoutTimer = null;
      }

      if (this.isGpioSupported && this.led) {
        try {
          this.led.writeSync(0); // Turn off LED
        } catch (error) {
          logger.error("Error turning off LED:", error);
        }
      }

      this.isBlinking = false;
      this.events.emit("blinking-stopped");
    }
  }

  /**
   * Register an event listener
   * @param event Event name
   * @param callback Callback function
   */
  on<E extends keyof NotificationEvents>(
    event: E,
    callback: (arg: NotificationEvents[E]) => void,
  ): void {
    // Check if we're close to the max listeners limit and warn
    const currentCount = this.events.listenerCount(event);
    if (currentCount >= this.maxListeners - 2) {
      logger.warn(
        `Adding listener to '${event}' event, current count: ${currentCount}, max: ${this.maxListeners}`,
      );
    }

    this.events.on(event, callback);
  }

  /**
   * Register a one-time event listener
   * @param event Event name
   * @param callback Callback function
   */
  once<E extends keyof NotificationEvents>(
    event: E,
    callback: (arg: NotificationEvents[E]) => void,
  ): void {
    this.events.once(event, callback);
  }

  /**
   * Remove an event listener
   * @param event Event name
   * @param callback Callback function to remove
   */
  off<E extends keyof NotificationEvents>(
    event: E,
    callback: (arg: NotificationEvents[E]) => void,
  ): void {
    this.events.off(event, callback);
  }

  /**
   * Legacy method for backward compatibility
   */
  onAcknowledged(callback: () => void): void {
    this.on("notification-acknowledged", callback);
  }

  /**
   * Simulate a button press (useful for testing and non-GPIO environments)
   */
  simulateButtonPress(): void {
    if (this.isBlinking) {
      this.stopBlinking();
      this.events.emit("notification-acknowledged");
    }
  }

  /**
   * Check if the notification LED is currently blinking
   */
  isActive(): boolean {
    return this.isBlinking;
  }

  /**
   * Get the current blink pattern
   */
  getCurrentPattern(): BlinkPattern {
    return this.currentPattern;
  }

  /**
   * Clean up all resources
   */
  cleanup(): void {
    this.stopBlinking();

    if (this.isGpioSupported) {
      if (this.led) {
        try {
          this.led.writeSync(0); // Ensure LED is off
          this.led.unexport();
        } catch (error) {
          logger.error("Error unexporting LED:", error);
        }
      }
      if (this.button) {
        try {
          this.button.unexport();
        } catch (error) {
          logger.error("Error unexporting button:", error);
        }
      }
    }

    // Clean up all event listeners
    this.events.removeAllListeners();
  }
}
