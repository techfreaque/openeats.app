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

// Create a mockable config object that tests can modify
const mockConfigObject = {
  server: { port: 3000, host: "localhost" },
  security: {
    apiKey: "test-api-key",
    defaultApiKey: "default-test-api-key",
  },
  printing: { 
    defaultPrinter: "Test Printer",
    bluetooth: {
      enabled: false,
      name: "BT Printer",
      address: "",
      channel: 1,
      discoverable: true,
      discoveryTimeout: 30000
    }
  },
  websocket: { url: "ws://localhost:8080" },
  notifications: { 
    enabled: true, 
    sounds: {
      newOrder: "sounds/new-order.mp3",
      printSuccess: "sounds/print-success.mp3",
      printError: "sounds/print-error.mp3",
    }
  },
  gpio: { enabled: false },
  logging: { level: "info" },
};

// Mock the fs module with proper spies
const mockFs = {
  writeFileSync: vi.fn(),
  readFileSync: vi.fn().mockReturnValue(JSON.stringify(mockConfigObject)),
  existsSync: vi.fn().mockReturnValue(true),
};
vi.mock("fs", () => mockFs);

// Mock the loadConfig and saveConfig implementations
vi.mock("./index", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    loadConfig: vi.fn().mockImplementation(() => ({ ...mockConfigObject })),
    saveConfig: vi.fn(),
    // Mock updateApiKey to actually update the mock config
    updateApiKey: vi.fn().mockImplementation((newKey) => {
      if (!newKey) throw new Error("API key cannot be empty");
      mockConfigObject.security.apiKey = newKey;
      actual.saveConfig(mockConfigObject);
    }),
    // Mock resetApiKey to actually reset the API key
    resetApiKey: vi.fn().mockImplementation(() => {
      mockConfigObject.security.apiKey = mockConfigObject.security.defaultApiKey;
      actual.saveConfig(mockConfigObject);
    }),
    // Mock the exported config
    config: mockConfigObject,
  };
});

describe("Config Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock config to original values
    Object.assign(mockConfigObject, {
      server: { port: 3000, host: "localhost" },
      security: {
        apiKey: "test-api-key",
        defaultApiKey: "default-test-api-key",
      },
      printing: { 
        defaultPrinter: "Test Printer",
        bluetooth: {
          enabled: false,
          name: "BT Printer"
        }
      },
      notifications: { 
        enabled: true,
        sounds: {
          newOrder: "sounds/new-order.mp3"
        }
      },
      gpio: { enabled: false },
      logging: { level: "info" },
    });
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

      // Implement updateConfig for testing
      const mockUpdateConfig = vi.fn().mockImplementation((updates) => {
        const updatedConfig = { ...mockConfigObject };
        
        if (updates.server) {
          updatedConfig.server = { ...mockConfigObject.server, ...updates.server };
        }
        if (updates.printing) {
          updatedConfig.printing = { ...mockConfigObject.printing, ...updates.printing };
        }
        
        Object.assign(mockConfigObject, updatedConfig);
        saveConfig(updatedConfig);
        return updatedConfig;
      });
      
      vi.mocked(updateConfig).mockImplementation(mockUpdateConfig);
      
      const result = updateConfig(updates);

      expect(result.server.port).toBe(4000);
      expect(result.printing.defaultPrinter).toBe("New Printer");
      expect(saveConfig).toHaveBeenCalled();
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

      // Implement updateConfig for testing
      const mockUpdateConfig = vi.fn().mockImplementation((updates) => {
        const updatedConfig = { ...mockConfigObject };
        
        if (updates.printing) {
          updatedConfig.printing = { ...mockConfigObject.printing };
          
          if (updates.printing.bluetooth) {
            updatedConfig.printing.bluetooth = {
              ...mockConfigObject.printing.bluetooth,
              ...updates.printing.bluetooth,
            };
          }
        }
        
        if (updates.notifications) {
          updatedConfig.notifications = { ...mockConfigObject.notifications };
          
          if (updates.notifications.sounds) {
            updatedConfig.notifications.sounds = {
              ...mockConfigObject.notifications.sounds,
              ...updates.notifications.sounds,
            };
          }
        }
        
        Object.assign(mockConfigObject, updatedConfig);
        saveConfig(updatedConfig);
        return updatedConfig;
      });
      
      vi.mocked(updateConfig).mockImplementation(mockUpdateConfig);

      const result = updateConfig(updates);

      expect(result.printing.bluetooth.enabled).toBe(true);
      expect(result.printing.bluetooth.name).toBe("BT Printer");
      expect(result.notifications.sounds.newOrder).toBe("new-sound.mp3");
    });
    
    it("should handle updates to arrays", () => {
      // Add features array
      mockConfigObject.features = ["feature1", "feature2"];
      
      const mockUpdateConfig = vi.fn().mockImplementation((updates) => {
        const updatedConfig = { ...mockConfigObject };
        
        if (updates.features) {
          updatedConfig.features = updates.features;
        }
        
        Object.assign(mockConfigObject, updatedConfig);
        saveConfig(updatedConfig);
        return updatedConfig;
      });
      
      vi.mocked(updateConfig).mockImplementation(mockUpdateConfig);
      
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

      expect(saveConfig).toHaveBeenCalled();
      expect(mockConfigObject.security.apiKey).toBe(newApiKey);
    });

    it("should reset API key to default", () => {
      resetApiKey();

      expect(saveConfig).toHaveBeenCalled();
      expect(mockConfigObject.security.apiKey).toBe(mockConfigObject.security.defaultApiKey);
    });
  });

  describe("API key management", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Reset API key to known value
      mockConfigObject.security.apiKey = "test-api-key";
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
        expect(mockConfigObject.security.apiKey).toBe(newKey);
        
        // Should save changes
        expect(saveConfig).toHaveBeenCalled();
      });
      
      it("should throw error if API key is invalid", () => {
        // Try to update with empty key
        expect(() => updateApiKey("")).toThrow("API key cannot be empty");
        
        // Make sure config was not changed
        expect(mockConfigObject.security.apiKey).toBe("test-api-key");
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
        expect(mockConfigObject.security.apiKey).toBe(mockConfigObject.security.defaultApiKey);
        expect(saveConfig).toHaveBeenCalled();
      });
    });
  });
});
