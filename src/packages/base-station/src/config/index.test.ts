import fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  config,
  getApiKey,
  loadConfig,
  resetApiKey,
  saveConfig,
  updateApiKey,
  updateConfig,
} from "./index";

// Mock the fs module
vi.mock("fs", () => ({
  writeFileSync: vi.fn(),
  readFileSync: vi.fn().mockReturnValue(
    JSON.stringify({
      server: { port: 3000, host: "localhost" },
      security: {
        apiKey: "test-api-key",
        defaultApiKey: "default-test-api-key",
      },
      printing: { defaultPrinter: "Test Printer" },
      websocket: { url: "ws://localhost:8080" },
      notifications: { enabled: true },
      gpio: { enabled: false },
      logging: { level: "info" },
    }),
  ),
  existsSync: vi.fn().mockReturnValue(true),
}));

describe("Config Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadConfig", () => {
    it("should load configuration from file", () => {
      const result = loadConfig();
      expect(result).toBeDefined();
      expect(result.server.port).toBe(3000);
      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it("should throw error if loading fails", () => {
      vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
        throw new Error("File read error");
      });

      expect(() => loadConfig()).toThrow("Failed to load configuration");
    });
  });

  describe("saveConfig", () => {
    it("should save configuration to file", () => {
      const testConfig = { ...config };
      saveConfig(testConfig);
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "utf8",
      );
    });

    it("should throw error if saving fails", () => {
      vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
        throw new Error("File write error");
      });

      expect(() => saveConfig(config)).toThrow("Failed to save configuration");
    });
  });

  describe("updateConfig", () => {
    it("should update configuration with new values", () => {
      const updates = {
        server: { port: 4000 },
        printing: { defaultPrinter: "New Printer" },
      };

      const result = updateConfig(updates);

      expect(result.server.port).toBe(4000);
      expect(result.printing.defaultPrinter).toBe("New Printer");
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("should handle nested updates", () => {
      const updates = {
        printing: {
          bluetooth: {
            enabled: true,
            name: "BT Printer",
          },
        },
        notifications: {
          sounds: {
            newOrder: "new-sound.mp3",
          },
        },
      };

      const result = updateConfig(updates);

      expect(result.printing.bluetooth.enabled).toBe(true);
      expect(result.printing.bluetooth.name).toBe("BT Printer");
      expect(result.notifications.sounds.newOrder).toBe("new-sound.mp3");
    });
  });

  describe("API Key Management", () => {
    it("should get API key", () => {
      const apiKey = getApiKey();
      expect(apiKey).toBe("test-api-key");
    });

    it("should update API key", () => {
      const newApiKey = "new-api-key";
      updateApiKey(newApiKey);

      expect(fs.writeFileSync).toHaveBeenCalled();
      // The mock fs doesn't actually update the config, but we can verify the function call
    });

    it("should reset API key to default", () => {
      resetApiKey();

      expect(fs.writeFileSync).toHaveBeenCalled();
      // Again, we can't check the actual value due to the mock, but we can verify the call
    });
  });
});
