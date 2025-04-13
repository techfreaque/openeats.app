import os from "os";

import { resetApiKey } from "../config";
import logger, { logError } from "../logging";
import type { GpioConfig } from "../types";

// Interface for GPIO service
export interface GpioService {
  initialize(): void;
  cleanup(): void;
  isEnabled(): boolean;
}

// Type-safe interface for the onoff module
interface Gpio {
  read(callback: (err: Error | null, value: number) => void): void;
  write(value: number, callback?: (err: Error | null) => void): void;
  unexport(): void;
  watch(callback: (err: Error | null) => void): void;
}

interface OnoffModule {
  Gpio: new (
    pin: number,
    direction: "in" | "out",
    edge?: "none" | "rising" | "falling" | "both",
    options?: {
      debounceTimeout?: number;
      activeLow?: boolean;
      reconfigureDirection?: boolean;
    },
  ) => Gpio;
}

// Raspberry Pi implementation using onoff
class RaspberryPiGpioService implements GpioService {
  private config: GpioConfig;
  private gpio: OnoffModule | null = null;
  private button: Gpio | null = null;
  private enabled = false;

  constructor(config: GpioConfig) {
    this.config = config;
  }

  initialize(): void {
    if (!this.config.enabled) {
      logger.info("GPIO monitoring is disabled in configuration");
      return;
    }

    try {
      // Dynamically import onoff to avoid issues on non-Raspberry Pi platforms
      try {
        this.gpio = require("onoff") as OnoffModule;
      } catch (error) {
        logger.error("Failed to load onoff module");
        return;
      }

      if (!this.gpio) {
        logger.error("Failed to load onoff module");
        return;
      }

      // Initialize GPIO button
      this.button = new this.gpio.Gpio(this.config.resetPin, "in", "falling", {
        debounceTimeout: 100,
      });

      // Watch for button press
      this.button.watch((err: Error | null) => {
        if (err) {
          logError("GPIO error", err);
          return;
        }

        logger.info("Reset button pressed, resetting API key");
        resetApiKey();
      });

      this.enabled = true;
      logger.info(`GPIO monitoring initialized on pin ${this.config.resetPin}`);
    } catch (error) {
      logError("Failed to initialize GPIO", error);
    }
  }

  cleanup(): void {
    if (this.button) {
      this.button.unexport();
      this.button = null;
    }
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Dummy implementation for non-Raspberry Pi platforms
class DummyGpioService implements GpioService {
  initialize(): void {
    logger.info("GPIO monitoring not available on this platform");
  }

  cleanup(): void {
    // Nothing to clean up
  }

  isEnabled(): boolean {
    return false;
  }
}

// Factory function to create the appropriate GPIO service
export function createGpioService(config: GpioConfig): GpioService {
  const platform = os.platform();
  const isRaspberryPi = platform === "linux" && os.arch().includes("arm");

  logger.debug(
    `Creating GPIO service for platform: ${platform}, architecture: ${os.arch()}`,
  );
  return isRaspberryPi
    ? new RaspberryPiGpioService(config)
    : new DummyGpioService();
}

// Export a function to initialize GPIO monitoring
export function initializeGpio(config: GpioConfig): GpioService {
  logger.info("Initializing GPIO monitoring");
  const gpioService = createGpioService(config);
  gpioService.initialize();
  return gpioService;
}
