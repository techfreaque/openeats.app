import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../config";
import { initializeGpio, toggleLed } from "./index";

// Mock the onoff library
vi.mock("onoff", () => {
  const mockGpio = {
    write: vi.fn(),
    read: vi.fn().mockImplementation(() => 0),
    unexport: vi.fn(),
    watch: vi.fn(),
  };

  return {
    Gpio: vi.fn().mockImplementation(() => mockGpio),
  };
});

// Mock the config
vi.mock("../config", () => ({
  config: {
    gpio: {
      enabled: true,
      ledPin: 17,
      buttonPin: 27,
      blinkRate: 500,
      blinkTimeout: 30000,
    },
  },
}));

// Mock the logger
vi.mock("../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("GPIO Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initializeGpio", () => {
    it("should initialize GPIO when enabled", () => {
      const result = initializeGpio();

      expect(result).toBe(true);
      expect(require("onoff").Gpio).toHaveBeenCalledTimes(2); // For LED and button
      expect(require("onoff").Gpio).toHaveBeenCalledWith(17, "out");
      expect(require("onoff").Gpio).toHaveBeenCalledWith(27, "in", "both");
    });

    it("should not initialize GPIO when disabled", () => {
      vi.mocked(config.gpio.enabled).mockReturnValueOnce(false);

      const result = initializeGpio();

      expect(result).toBe(false);
      expect(require("onoff").Gpio).not.toHaveBeenCalled();
    });

    it("should handle initialization errors", () => {
      vi.mocked(require("onoff").Gpio).mockImplementationOnce(() => {
        throw new Error("GPIO error");
      });

      const result = initializeGpio();

      expect(result).toBe(false);
      expect(require("../logging").default.error).toHaveBeenCalled();
    });
  });

  describe("toggleLed", () => {
    it("should toggle LED on when state is true", () => {
      // First init GPIO
      initializeGpio();

      // Then toggle
      toggleLed(true);

      const mockGpio = require("onoff").Gpio.mock.results[0].value;
      expect(mockGpio.write).toHaveBeenCalledWith(1);
    });

    it("should toggle LED off when state is false", () => {
      // First init GPIO
      initializeGpio();

      // Then toggle
      toggleLed(false);

      const mockGpio = require("onoff").Gpio.mock.results[0].value;
      expect(mockGpio.write).toHaveBeenCalledWith(0);
    });

    it("should do nothing when GPIO is not initialized", () => {
      // Reset the module state
      vi.resetModules();

      // Don't initialize GPIO

      // Try to toggle
      toggleLed(true);

      // Expect no errors and no actions
      expect(require("../logging").default.error).not.toHaveBeenCalled();
    });
  });
});
