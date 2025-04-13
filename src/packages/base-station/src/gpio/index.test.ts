import { beforeEach, describe, expect, it, vi } from "vitest";
import os from "os";

import { config } from "../config";
import { createGpioService, initializeGpio } from "./index";

// Mock os module
vi.mock("os", () => ({
  platform: vi.fn().mockReturnValue("linux"),
  arch: vi.fn().mockReturnValue("arm64"),
}));

// Mock the onoff library
vi.mock("onoff", () => {
  const mockGpio = {
    writeSync: vi.fn(),
    read: vi.fn().mockImplementation((callback) => callback(null, 0)),
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
      resetPin: 22,
      blinkRate: 500,
      blinkTimeout: 30000,
    },
  },
  resetApiKey: vi.fn(),
}));

// Mock the logger
vi.mock("../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  logError: vi.fn(),
}));

describe("GPIO Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initializeGpio", () => {
    it("should initialize GPIO when enabled", () => {
      // Act
      const gpioService = initializeGpio(config.gpio);

      // Assert
      expect(gpioService).toBeDefined();
      expect(gpioService.isEnabled()).toBe(false);  // Initially false until initialize completes
      
      // Call initialize to complete the setup
      gpioService.initialize();
      
      // Now it should be enabled
      expect(gpioService.isEnabled()).toBe(true);
      expect(require("onoff").Gpio).toHaveBeenCalled();
    });

    it("should not initialize GPIO when disabled", () => {
      // Arrange - create a modified config with GPIO disabled
      const disabledConfig = { ...config.gpio, enabled: false };
      
      // Act
      const gpioService = initializeGpio(disabledConfig);
      gpioService.initialize();
      
      // Assert
      expect(gpioService.isEnabled()).toBe(false);
      expect(require("onoff").Gpio).not.toHaveBeenCalled();
    });

    it("should handle initialization errors", () => {
      // Arrange
      const Gpio = require("onoff").Gpio;
      vi.mocked(Gpio).mockImplementationOnce(() => {
        throw new Error("GPIO error");
      });

      // Act
      const gpioService = initializeGpio(config.gpio);
      gpioService.initialize();

      // Assert
      expect(gpioService.isEnabled()).toBe(false);
      expect(require("../logging").logError).toHaveBeenCalled();
    });
  });

  describe("createGpioService", () => {
    it("should create RaspberryPiGpioService on Linux ARM platform", () => {
      // Arrange - ensure we're on Linux ARM
      vi.mocked(os.platform).mockReturnValue("linux");
      vi.mocked(os.arch).mockReturnValue("arm64");
      
      // Act
      const service = createGpioService(config.gpio);
      
      // Assert - check by initializing and seeing if it tries to use GPIO
      service.initialize();
      expect(require("onoff").Gpio).toHaveBeenCalled();
    });
    
    it("should create DummyGpioService on non-Raspberry Pi platforms", () => {
      // Arrange - ensure we're on a non-RPi platform
      vi.mocked(os.platform).mockReturnValue("win32");
      
      // Act
      const service = createGpioService(config.gpio);
      service.initialize();
      
      // Assert
      expect(service.isEnabled()).toBe(false);
      expect(require("onoff").Gpio).not.toHaveBeenCalled();
    });
  });
});
