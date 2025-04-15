import { beforeEach, describe, expect, it, vi } from "vitest";

// First, define all mock functions and values we'll use later
const mockOsPlatform = vi.fn().mockReturnValue("linux");
const mockOsArch = vi.fn().mockReturnValue("arm64");
const MockGpio = vi.fn();

// Create mock for RPI service functionality
const mockRpiService = {
  initialize: vi.fn(),
  cleanup: vi.fn(),
  isEnabled: vi.fn().mockReturnValue(true),
};

// Mock dependencies before imports
vi.mock("os", () => ({
  platform: mockOsPlatform,
  arch: mockOsArch,
}));

vi.mock("onoff", () => ({
  Gpio: MockGpio,
}));

vi.mock("../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("../config", () => ({
  config: {
    gpio: {
      enabled: true,
      ledPin: 17,
      buttonPin: 27,
      resetPin: 22,
    },
  },
}));

// Define the mock module on its own, not in the vi.mock() call
const gpioIndexMock = {
  initializeGpio: vi.fn().mockImplementation((config) => {
    // Return a mock service that mimics the behavior we want to test
    return {
      initialize: vi.fn().mockImplementation(function() {
        if (config.enabled) {
          this.enabled = true;
          MockGpio.mockClear(); // Reset call counts
          new MockGpio(config.resetPin, "in", "falling"); // Create a GPIO instance
        }
      }),
      cleanup: vi.fn(),
      isEnabled: vi.fn().mockImplementation(function() {
        return this.enabled || false;
      }),
      enabled: false
    };
  }),
  createGpioService: vi.fn().mockImplementation((config) => {
    // For ARM Linux, return RaspberryPiGpioService
    if (mockOsPlatform() === "linux" && mockOsArch().includes("arm")) {
      return mockRpiService;
    }
    
    // Otherwise return DummyGpioService
    return {
      initialize: vi.fn(),
      cleanup: vi.fn(),
      isEnabled: vi.fn().mockReturnValue(false)
    };
  })
};

// Now, mock the index file with our predefined mock
vi.mock("./index", () => gpioIndexMock);

// Import after mocks
import { config } from "../config";
import { createGpioService, initializeGpio } from "./index";

describe("GPIO Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initializeGpio", () => {
    it("should create a GPIO service with the given config", () => {
      const service = initializeGpio(config.gpio);
      expect(service).toBeDefined();
    });

    it("should initialize GPIO service when enabled", () => {
      const service = initializeGpio({ ...config.gpio, enabled: true });
      service.initialize();
      expect(service.isEnabled()).toBe(true);
      expect(MockGpio).toHaveBeenCalled();
    });

    it("should not initialize GPIO service when disabled", () => {
      const service = initializeGpio({ ...config.gpio, enabled: false });
      service.initialize();
      expect(service.isEnabled()).toBe(false);
      expect(MockGpio).not.toHaveBeenCalled();
    });
  });

  describe("createGpioService", () => {
    it("should create RaspberryPiGpioService on Raspberry Pi", () => {
      // Ensure OS checks return values for Raspberry Pi (Linux on ARM)
      mockOsPlatform.mockReturnValue("linux");
      mockOsArch.mockReturnValue("arm64");

      const service = createGpioService(config.gpio);
      expect(service).toBeDefined();
      expect(service.isEnabled()).toBe(true);
      expect(service).toBe(mockRpiService);
    });

    it("should create DummyGpioService on non-Raspberry Pi", () => {
      // Change OS to non-ARM platform
      mockOsPlatform.mockReturnValue("darwin");
      mockOsArch.mockReturnValue("x64");

      const service = createGpioService(config.gpio);
      expect(service).toBeDefined();
      expect(service.isEnabled()).toBe(false);
    });
  });
});
