import fs from "fs";
import path from "path";

import type { AppConfig } from "../types";

// Simple loggers to avoid circular dependencies
function debugLogger(message: string): void {
  console.debug(`[CONFIG] ${message}`);
}

function errorLogger(message: string, error: unknown): void {
  console.error(`[CONFIG] ${message}`, error);
}

// Default config path
export const CONFIG_PATH = path.join(process.cwd(), "config", "default.json");

// Load configuration from file (made more testable by accepting an optional path)
export function loadConfig(configPath: string = CONFIG_PATH): AppConfig {
  try {
    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData) as AppConfig;
    debugLogger("Configuration loaded successfully");
    return config;
  } catch (error) {
    errorLogger("Error loading configuration:", error);
    throw new Error("Failed to load configuration");
  }
}

// Save configuration to file (made more testable by accepting an optional path)
export function saveConfig(
  config: AppConfig,
  configPath: string = CONFIG_PATH,
): void {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    debugLogger("Configuration saved successfully");
  } catch (error) {
    errorLogger("Error saving configuration:", error);
    throw new Error("Failed to save configuration");
  }
}

// Type-safe deep partial helper
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Update specific configuration values with proper typing
export function updateConfig(updates: DeepPartial<AppConfig>): AppConfig {
  const config = loadConfig();
  const updatedConfig = { ...config } as AppConfig;

  // Deep merge for nested properties
  if (updates.server) {
    updatedConfig.server = { ...config.server, ...updates.server };
  }

  if (updates.websocket) {
    updatedConfig.websocket = { ...config.websocket, ...updates.websocket };
  }

  if (updates.security) {
    updatedConfig.security = { ...config.security, ...updates.security };
  }

  if (updates.printing) {
    updatedConfig.printing = {
      ...config.printing,
      ...updates.printing,
      // Handle nested bluetooth config
      bluetooth: updates.printing.bluetooth
        ? {
            ...config.printing.bluetooth,
            ...updates.printing.bluetooth,
          }
        : config.printing.bluetooth,
    };
  }

  if (updates.notifications) {
    updatedConfig.notifications = {
      ...config.notifications,
      ...updates.notifications,
      sounds: updates.notifications?.sounds
        ? {
            ...config.notifications.sounds,
            ...updates.notifications.sounds,
          }
        : config.notifications.sounds,
    };
  }

  if (updates.gpio) {
    updatedConfig.gpio = { ...config.gpio, ...updates.gpio };
  }

  if (updates.logging) {
    updatedConfig.logging = { ...config.logging, ...updates.logging };
  }

  saveConfig(updatedConfig);
  return updatedConfig;
}

// Get API key with explicit return type
export function getApiKey(): string {
  const config = loadConfig();
  return config.security.apiKey;
}

// Update API key with type safety
export function updateApiKey(newApiKey: string): void {
  const config = loadConfig();
  debugLogger(
    `Updating API key from ${config.security.apiKey.substring(0, 3)}*** to ${newApiKey.substring(0, 3)}***`,
  );
  config.security.apiKey = newApiKey;
  saveConfig(config);
}

// Reset API key to default
export function resetApiKey(): void {
  const config = loadConfig();
  debugLogger("Resetting API key to default value");
  config.security.apiKey = config.security.defaultApiKey;
  saveConfig(config);
}

// Export a singleton instance of the config
export const config = loadConfig();
