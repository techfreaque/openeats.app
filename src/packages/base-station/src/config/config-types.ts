import * as fs from "fs";
import * as path from "path";

import logger from "../logging";

// Configuration version for migration support
export const CONFIG_VERSION = "1.0.0";

export interface PrintingConfig {
  enabled: boolean;
  defaultPrinter?: string;
  retryCount: number;
  timeout: number; // in milliseconds
}

export interface GpioConfig {
  enabled: boolean;
  ledPin: number;
  buttonPin: number;
  blinkRate: number; // in milliseconds
  blinkTimeout: number; // in milliseconds, 0 = no timeout
}

export interface WebsocketConfig {
  url: string;
  reconnectInterval: number; // in milliseconds
  maxReconnectAttempts: number;
}

export interface BaseStationConfig {
  version: string;
  printing: PrintingConfig;
  gpio: GpioConfig;
  websocket: WebsocketConfig;
  // ...existing code...
}

// Default configuration values
export const defaultConfig: BaseStationConfig = {
  version: CONFIG_VERSION,
  printing: {
    enabled: true,
    retryCount: 3,
    timeout: 30000, // 30 seconds
  },
  gpio: {
    enabled: true,
    ledPin: 17,
    buttonPin: 27,
    blinkRate: 500,
    blinkTimeout: 30 * 60 * 1000, // 30 minutes
  },
  websocket: {
    url: "ws://localhost:8080",
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 10,
  },
  // Add other required default values
};

/**
 * Type guard to check if a value is a non-empty string
 */
function isNonEmptyString(value: any): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a number
 */
function isNumber(value: any): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
function isBoolean(value: any): value is boolean {
  return typeof value === "boolean";
}

/**
 * Load configuration from environment variables
 * @returns Partial configuration from environment variables
 */
export function loadConfigFromEnv(): Partial<BaseStationConfig> {
  const config: any = {
    printing: {},
    gpio: {},
    websocket: {},
  };

  // Printing config
  if (process.env.PRINTING_ENABLED) {
    config.printing.enabled =
      process.env.PRINTING_ENABLED.toLowerCase() === "true";
  }
  if (process.env.DEFAULT_PRINTER) {
    config.printing.defaultPrinter = process.env.DEFAULT_PRINTER;
  }
  if (process.env.PRINT_RETRY_COUNT) {
    const retryCount = parseInt(process.env.PRINT_RETRY_COUNT, 10);
    if (!isNaN(retryCount)) {
      config.printing.retryCount = retryCount;
    }
  }
  if (process.env.PRINT_TIMEOUT) {
    const timeout = parseInt(process.env.PRINT_TIMEOUT, 10);
    if (!isNaN(timeout)) {
      config.printing.timeout = timeout;
    }
  }

  // GPIO config
  if (process.env.GPIO_ENABLED) {
    config.gpio.enabled = process.env.GPIO_ENABLED.toLowerCase() === "true";
  }
  if (process.env.LED_PIN) {
    const ledPin = parseInt(process.env.LED_PIN, 10);
    if (!isNaN(ledPin)) {
      config.gpio.ledPin = ledPin;
    }
  }
  if (process.env.BUTTON_PIN) {
    const buttonPin = parseInt(process.env.BUTTON_PIN, 10);
    if (!isNaN(buttonPin)) {
      config.gpio.buttonPin = buttonPin;
    }
  }
  if (process.env.BLINK_RATE) {
    const blinkRate = parseInt(process.env.BLINK_RATE, 10);
    if (!isNaN(blinkRate)) {
      config.gpio.blinkRate = blinkRate;
    }
  }
  if (process.env.BLINK_TIMEOUT) {
    const blinkTimeout = parseInt(process.env.BLINK_TIMEOUT, 10);
    if (!isNaN(blinkTimeout)) {
      config.gpio.blinkTimeout = blinkTimeout;
    }
  }

  // WebSocket config
  if (process.env.WEBSOCKET_URL) {
    config.websocket.url = process.env.WEBSOCKET_URL;
  }
  if (process.env.RECONNECT_INTERVAL) {
    const reconnectInterval = parseInt(process.env.RECONNECT_INTERVAL, 10);
    if (!isNaN(reconnectInterval)) {
      config.websocket.reconnectInterval = reconnectInterval;
    }
  }
  if (process.env.MAX_RECONNECT_ATTEMPTS) {
    const maxReconnectAttempts = parseInt(
      process.env.MAX_RECONNECT_ATTEMPTS,
      10,
    );
    if (!isNaN(maxReconnectAttempts)) {
      config.websocket.maxReconnectAttempts = maxReconnectAttempts;
    }
  }

  // Clean up empty objects
  Object.keys(config).forEach((key) => {
    if (
      typeof config[key] === "object" &&
      Object.keys(config[key]).length === 0
    ) {
      delete config[key];
    }
  });

  return config;
}

/**
 * Load configuration from a JSON file
 * @param filePath Path to the config file
 * @returns Partial configuration from file
 */
export function loadConfigFromFile(
  filePath: string,
): Partial<BaseStationConfig> {
  try {
    if (!fs.existsSync(filePath)) {
      logger.warn(`Config file not found: ${filePath}`);
      return {};
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const config = JSON.parse(fileContent);

    // Check for config version and handle migrations if needed
    if (config.version && config.version !== CONFIG_VERSION) {
      return migrateConfig(config);
    }

    return config;
  } catch (error) {
    logger.error(`Error loading config file: ${error}`);
    return {};
  }
}

/**
 * Handle configuration migration between versions
 * @param oldConfig The old configuration object
 * @returns Migrated configuration
 */
function migrateConfig(oldConfig: any): Partial<BaseStationConfig> {
  logger.info(
    `Migrating config from version ${oldConfig.version} to ${CONFIG_VERSION}`,
  );

  // For now, we just use the old config as-is
  // In the future, we can add migration logic here
  const migratedConfig = { ...oldConfig, version: CONFIG_VERSION };

  return migratedConfig;
}

/**
 * Validate that required config fields have the correct type
 * @param config Configuration object to validate
 * @throws Error if validation fails
 */
function validateConfigTypes(config: any): void {
  // Validate printing config
  if (config.printing) {
    if ("enabled" in config.printing && !isBoolean(config.printing.enabled)) {
      throw new TypeError("printing.enabled must be a boolean");
    }
    if (
      "defaultPrinter" in config.printing &&
      config.printing.defaultPrinter !== undefined &&
      !isNonEmptyString(config.printing.defaultPrinter)
    ) {
      throw new TypeError("printing.defaultPrinter must be a non-empty string");
    }
    if (
      "retryCount" in config.printing &&
      !isNumber(config.printing.retryCount)
    ) {
      throw new TypeError("printing.retryCount must be a number");
    }
    if ("timeout" in config.printing && !isNumber(config.printing.timeout)) {
      throw new TypeError("printing.timeout must be a number");
    }
  }

  // Validate GPIO config
  if (config.gpio) {
    if ("enabled" in config.gpio && !isBoolean(config.gpio.enabled)) {
      throw new TypeError("gpio.enabled must be a boolean");
    }
    if ("ledPin" in config.gpio && !isNumber(config.gpio.ledPin)) {
      throw new TypeError("gpio.ledPin must be a number");
    }
    if ("buttonPin" in config.gpio && !isNumber(config.gpio.buttonPin)) {
      throw new TypeError("gpio.buttonPin must be a number");
    }
    if ("blinkRate" in config.gpio && !isNumber(config.gpio.blinkRate)) {
      throw new TypeError("gpio.blinkRate must be a number");
    }
    if ("blinkTimeout" in config.gpio && !isNumber(config.gpio.blinkTimeout)) {
      throw new TypeError("gpio.blinkTimeout must be a number");
    }
  }

  // Validate WebSocket config
  if (config.websocket) {
    if ("url" in config.websocket && !isNonEmptyString(config.websocket.url)) {
      throw new TypeError("websocket.url must be a non-empty string");
    }
    if (
      "reconnectInterval" in config.websocket &&
      !isNumber(config.websocket.reconnectInterval)
    ) {
      throw new TypeError("websocket.reconnectInterval must be a number");
    }
    if (
      "maxReconnectAttempts" in config.websocket &&
      !isNumber(config.websocket.maxReconnectAttempts)
    ) {
      throw new TypeError("websocket.maxReconnectAttempts must be a number");
    }
  }
}

/**
 * Validate configuration values and apply defaults
 * @param config The configuration to validate
 * @returns Validated configuration with defaults applied
 */
export function validateConfig(
  config: Partial<BaseStationConfig>,
): BaseStationConfig {
  try {
    // First validate the types
    validateConfigTypes(config);

    // Then apply defaults and validate values
    const validatedConfig = { ...defaultConfig };
    validatedConfig.version = CONFIG_VERSION;

    // Merge and validate printing config
    if (config.printing) {
      validatedConfig.printing = {
        ...validatedConfig.printing,
        ...config.printing,
      };

      // Validate retry count
      if (validatedConfig.printing.retryCount < 0) {
        logger.warn("Print retry count cannot be negative, setting to 0");
        validatedConfig.printing.retryCount = 0;
      }

      // Validate timeout
      if (
        validatedConfig.printing.timeout < 1000 &&
        validatedConfig.printing.timeout !== 0
      ) {
        logger.warn("Print timeout too low, setting to 1000ms minimum");
        validatedConfig.printing.timeout = 1000;
      }
    }

    // Merge and validate GPIO config
    if (config.gpio) {
      validatedConfig.gpio = {
        ...validatedConfig.gpio,
        ...config.gpio,
      };

      // Ensure pin numbers are valid
      if (validatedConfig.gpio.ledPin < 0) {
        throw new Error("LED GPIO pin number must be positive");
      }

      if (validatedConfig.gpio.buttonPin < 0) {
        throw new Error("Button GPIO pin number must be positive");
      }

      if (validatedConfig.gpio.ledPin === validatedConfig.gpio.buttonPin) {
        throw new Error("LED and button pins cannot be the same");
      }

      // Ensure blink rate is valid
      if (validatedConfig.gpio.blinkRate < 100) {
        logger.warn("Blink rate too low, setting to 100ms minimum");
        validatedConfig.gpio.blinkRate = 100;
      }

      // Validate blink timeout (0 means no timeout)
      if (validatedConfig.gpio.blinkTimeout < 0) {
        logger.warn(
          "Blink timeout cannot be negative, setting to 0 (no timeout)",
        );
        validatedConfig.gpio.blinkTimeout = 0;
      }
    }

    // Merge and validate WebSocket config
    if (config.websocket) {
      validatedConfig.websocket = {
        ...validatedConfig.websocket,
        ...config.websocket,
      };

      // Validate WebSocket URL
      if (
        !validatedConfig.websocket.url.startsWith("ws://") &&
        !validatedConfig.websocket.url.startsWith("wss://")
      ) {
        throw new Error("WebSocket URL must start with ws:// or wss://");
      }

      // Validate reconnect interval
      if (validatedConfig.websocket.reconnectInterval < 1000) {
        logger.warn(
          "WebSocket reconnect interval too low, setting to 1000ms minimum",
        );
        validatedConfig.websocket.reconnectInterval = 1000;
      }

      // Validate max reconnect attempts
      if (validatedConfig.websocket.maxReconnectAttempts < 0) {
        logger.warn(
          "Max reconnect attempts cannot be negative, setting to 0 (infinite)",
        );
        validatedConfig.websocket.maxReconnectAttempts = 0;
      }
    }

    return validatedConfig;
  } catch (error) {
    logger.error("Configuration validation error:", error);
    logger.warn("Using default configuration due to validation errors");
    return { ...defaultConfig };
  }
}

/**
 * Save configuration to a file
 * @param config Configuration to save
 * @param filePath Path to save the configuration
 */
export function saveConfig(config: BaseStationConfig, filePath: string): void {
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf8");
    logger.info(`Configuration saved to ${filePath}`);
  } catch (error) {
    logger.error(`Failed to save configuration: ${error}`);
  }
}
