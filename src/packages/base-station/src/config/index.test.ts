import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs";

// Mock fs module with appropriate default export handling
vi.mock("fs", () => {
  return {
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: vi.fn().mockReturnValue('{"server":{"port":3000,"host":"localhost"},"printing":{"defaultPrinter":"Test Printer","copies":1},"websocket":{"url":"ws://localhost:8080","reconnectInterval":5000}}'),
    writeFileSync: vi.fn(),
    default: {
      existsSync: vi.fn().mockReturnValue(true),
      readFileSync: vi.fn().mockReturnValue('{"server":{"port":3000,"host":"localhost"},"printing":{"defaultPrinter":"Test Printer","copies":1},"websocket":{"url":"ws://localhost:8080","reconnectInterval":5000}}'),
      writeFileSync: vi.fn(),
    },
    __esModule: true
  };
});

// Import the config module after mocks
import { config, loadConfig, setConfig, saveConfig } from "./index";

// Define test config objects
const mockConfigObject = {
  server: {
    port: 3000,
    host: "localhost",
  },
  printing: {
    defaultPrinter: "Test Printer",
    copies: 1,
  },
  websocket: {
    url: "ws://localhost:8080",
    reconnectInterval: 5000,
  },
};

describe("Config Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mocks to default values
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfigObject));
  });

  describe("loadConfig", () => {
    it("should load configuration from file", () => {
      loadConfig();
      
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      
      // Config should be loaded
      expect(config.server.port).toBe(3000);
      expect(config.printing.defaultPrinter).toBe("Test Printer");
    });
    
    it("should handle missing config file", () => {
      // Mock file not existing
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      
      // Should not throw
      expect(() => loadConfig()).not.toThrow();
      
      // Should not try to read non-existent file
      expect(fs.readFileSync).not.toHaveBeenCalled();
    });
    
    it("should handle invalid JSON in config file", () => {
      // Mock invalid JSON
      vi.mocked(fs.readFileSync).mockReturnValueOnce("invalid json");
      
      // Should not throw
      expect(() => loadConfig()).not.toThrow();
      
      // Config should have defaults
      expect(config).toBeDefined();
    });
    
    it("should merge with existing config", () => {
      // Set initial config
      setConfig({
        server: {
          port: 8000,
          host: "127.0.0.1",
        },
        logging: {
          level: "debug",
        },
      });
      
      // Load new config
      vi.mocked(fs.readFileSync).mockReturnValueOnce(
        JSON.stringify({
          server: {
            port: 3000,
          },
          printing: {
            defaultPrinter: "New Printer",
          },
        }),
      );
      
      loadConfig();
      
      // Should merge configs
      expect(config.server.port).toBe(3000);
      expect(config.server.host).toBe("127.0.0.1"); // Kept from original
      expect(config.printing.defaultPrinter).toBe("New Printer");
      expect(config.logging.level).toBe("debug"); // Kept from original
    });
  });
  
  describe("saveConfig", () => {
    it("should save configuration to file", () => {
      // Set config
      setConfig(mockConfigObject);
      
      // Save config
      saveConfig();
      
      // Should write to file
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("server"),
        "utf8",
      );
    });
    
    it("should handle file write errors", () => {
      // Mock write failure
      vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
        throw new Error("Write failed");
      });
      
      // Should not throw
      expect(() => saveConfig()).not.toThrow();
    });
  });
  
  describe("setConfig", () => {
    it("should update configuration", () => {
      // Initial config
      setConfig({
        server: {
          port: 3000,
        },
      });
      
      // Update config
      setConfig({
        server: {
          host: "127.0.0.1",
        },
        logging: {
          level: "debug",
        },
      });
      
      // Should merge configs
      expect(config.server.port).toBe(3000);
      expect(config.server.host).toBe("127.0.0.1");
      expect(config.logging.level).toBe("debug");
    });
    
    it("should handle empty or null config", () => {
      // Set initial config
      setConfig({
        server: {
          port: 3000,
        },
      });
      
      // Update with null (should not change anything)
      setConfig(null as any);
      
      // Config should remain unchanged
      expect(config.server.port).toBe(3000);
    });
    
    it("should handle nested objects", () => {
      // Set nested config
      setConfig({
        printer: {
          settings: {
            dpi: 300,
            color: true,
          },
        },
      });
      
      // Update nested property
      setConfig({
        printer: {
          settings: {
            dpi: 600,
          },
        },
      });
      
      // Should keep non-updated nested properties
      expect(config.printer.settings.dpi).toBe(600);
      expect(config.printer.settings.color).toBe(true);
    });
  });
});
