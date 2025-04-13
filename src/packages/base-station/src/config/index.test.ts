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

  describe("updateConfig", () => {
    it("should update specified config properties", () => {
      // Prepare a base config to update
      const oldConfig = { ...config };
      
      // Define updates
      const updates = {
        server: { port: 4000 },
        printing: { defaultPrinter: "Updated Printer" },
      };
      
      // Update config
      const result = updateConfig(updates);
      
      // Verify updates
      expect(result).toBeDefined();
      expect(result.server.port).toBe(4000);
      expect(result.printing.defaultPrinter).toBe("Updated Printer");
      expect(saveConfig).toHaveBeenCalled();
    });

    it("should merge nested objects properly", () => {
      // Prepare updates with nested objects
      const updates = {
        notifications: { 
          sounds: { newOrder: "new-sound.mp3" } 
        },
      };
      
      // Update config
      const result = updateConfig(updates);
      
      // Verify deep merge
      expect(result.notifications.sounds.newOrder).toBe("new-sound.mp3");
      expect(result.notifications.enabled).toBe(true); // Should preserve existing values
    });
    
    it("should handle updates to arrays", () => {
      // Mock config with an array
      const mockConfigWithArray = {
        ...config,
        features: ["feature1", "feature2"]
      };
      vi.mocked(loadConfig).mockReturnValueOnce(mockConfigWithArray);
      
      // Update the array
      const result = updateConfig({
        features: ["feature3"]
      });
      
      // Should replace entire array
      expect(result.features).toEqual(["feature3"]);
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

  describe("API key management", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe("getApiKey", () => {
      it("should return the current API key", () => {
        const apiKey = getApiKey();
        expect(apiKey).toBe("test-api-key");
      });
    });

    describe("updateApiKey", () => {
      it("should update the API key", () => {
        const newKey = "new-api-key";
        updateApiKey(newKey);
        
        // Should update config object
        expect(config.security.apiKey).toBe(newKey);
        
        // Should save changes
        expect(saveConfig).toHaveBeenCalled();
      });
      
      it("should throw error if API key is invalid", () => {
        // Try to update with empty key
        expect(() => updateApiKey("")).toThrow("API key cannot be empty");
        
        // Make sure config was not changed
        expect(config.security.apiKey).not.toBe("");
        expect(saveConfig).not.toHaveBeenCalled();
      });
    });
    
    describe("resetApiKey", () => {
      it("should reset API key to default", () => {
        // First change the API key
        updateApiKey("changed-api-key");
        vi.clearAllMocks(); // Clear mock calls
        
        // Reset the API key
        resetApiKey();
        
        // Should reset to default
        expect(config.security.apiKey).toBe(config.security.defaultApiKey);
        expect(saveConfig).toHaveBeenCalled();
      });
    });
  });
});
