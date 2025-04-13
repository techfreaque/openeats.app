/**
 * Bluetooth printer service
 * Handles communication with Bluetooth printers
 */

import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import util from "util";

import { config } from "../../config";
import logger, { logError } from "../../logging";
import type {
  BluetoothPrinterConfig,
  PrintOptions,
  PrintResult,
} from "../../types";

const execPromise = util.promisify(exec);

/**
 * Interface for Bluetooth printer service
 */
export interface BluetoothPrinterService {
  /**
   * Check if Bluetooth is available on this system
   */
  isAvailable(): Promise<boolean>;

  /**
   * Check if the service is enabled in configuration
   */
  isEnabled(): boolean;

  /**
   * Discover available Bluetooth printers
   */
  discoverPrinters(): Promise<BluetoothPrinterInfo[]>;

  /**
   * Print a file to a Bluetooth printer
   */
  print(
    fileContent: string,
    fileName: string,
    options?: PrintOptions,
  ): Promise<PrintResult>;
}

/**
 * Information about a Bluetooth printer
 */
export interface BluetoothPrinterInfo {
  name: string;
  address: string;
  channel?: number;
  connected: boolean;
}

/**
 * Linux implementation of Bluetooth printer service using BlueZ
 */
class LinuxBluetoothPrinterService implements BluetoothPrinterService {
  private config: BluetoothPrinterConfig;
  private available = false;

  constructor(config: BluetoothPrinterConfig) {
    this.config = config;
    this.checkAvailability()
      .then((available) => {
        this.available = available;
        if (available) {
          logger.info("Bluetooth printing service initialized");
        } else {
          logger.warn("Bluetooth is not available on this system");
        }
      })
      .catch((error) => {
        logError("Failed to check Bluetooth availability", error);
      });
  }

  /**
   * Check if Bluetooth is available on this system
   */
  async isAvailable(): Promise<boolean> {
    return this.available;
  }

  /**
   * Check if the service is enabled in configuration
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Check if Bluetooth is available on this system
   */
  private async checkAvailability(): Promise<boolean> {
    try {
      // Check if bluetoothctl is available
      await execPromise("which bluetoothctl");

      // Check if Bluetooth service is running
      const { stdout } = await execPromise("systemctl is-active bluetooth");
      return stdout.trim() === "active";
    } catch (error) {
      logger.debug("Bluetooth is not available:", error);
      return false;
    }
  }

  /**
   * Discover available Bluetooth printers
   */
  async discoverPrinters(): Promise<BluetoothPrinterInfo[]> {
    if (!this.available) {
      logger.warn("Bluetooth is not available");
      return [];
    }

    if (!this.config.discoverable) {
      logger.info("Bluetooth discovery is disabled in configuration");

      // Return the configured printer if available
      if (this.config.address) {
        return [
          {
            name: this.config.name,
            address: this.config.address,
            channel: this.config.channel,
            connected: false,
          },
        ];
      }

      return [];
    }

    try {
      logger.info("Discovering Bluetooth devices...");

      // Start discovery
      await execPromise("bluetoothctl scan on");

      // Wait for discovery timeout
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.discoveryTimeout),
      );

      // Stop discovery
      await execPromise("bluetoothctl scan off");

      // Get list of devices
      const { stdout } = await execPromise("bluetoothctl devices");

      // Parse device list
      const devices: BluetoothPrinterInfo[] = [];
      const lines = stdout.split("\n");

      for (const line of lines) {
        // Format: "Device XX:XX:XX:XX:XX:XX DeviceName"
        const match = line.match(/Device\\s+([0-9A-F:]+)\\s+(.+)/i);
        if (match) {
          const address = match[1];
          const name = match[2];

          // Get device info
          const { stdout: infoStdout } = await execPromise(
            `bluetoothctl info ${address}`,
          );

          // Check if it's a printer (look for "SPP" service)
          if (
            infoStdout.includes("SPP") ||
            name.toLowerCase().includes("print")
          ) {
            devices.push({
              name,
              address,
              connected: infoStdout.includes("Connected: yes"),
            });
          }
        }
      }

      logger.info(`Discovered ${devices.length} Bluetooth printers`);
      return devices;
    } catch (error) {
      logError("Failed to discover Bluetooth printers", error);
      return [];
    }
  }

  /**
   * Print a file to a Bluetooth printer
   */
  async print(
    fileContent: string,
    fileName: string,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    if (!this.available) {
      return {
        success: false,
        error: "Bluetooth is not available",
      };
    }

    if (!this.config.enabled) {
      return {
        success: false,
        error: "Bluetooth printing is disabled in configuration",
      };
    }

    // Use the printer from options, or the default from config
    const address = options?.printer || this.config.address;

    if (!address) {
      return {
        success: false,
        error: "No Bluetooth printer address specified",
      };
    }

    try {
      // Create temporary file
      const tempDir = config.printing.tempDirectory || os.tmpdir();
      const tempFilePath = path.join(tempDir, fileName);

      // Decode base64 content and write to file
      const buffer = Buffer.from(fileContent, "base64");
      fs.writeFileSync(tempFilePath, buffer);

      // Format receipt if it's a text file
      if (fileName.endsWith(".txt") && config.printing.receiptWidth > 0) {
        try {
          const content = fs.readFileSync(tempFilePath, "utf8");
          const formattedContent = this.formatReceiptText(content);
          fs.writeFileSync(tempFilePath, formattedContent);
        } catch (formatError) {
          logger.warn(
            `Failed to format receipt: ${formatError instanceof Error ? formatError.message : String(formatError)}`,
          );
        }
      }

      // Connect to the printer
      logger.info(`Connecting to Bluetooth printer: ${address}`);
      await execPromise(`bluetoothctl connect ${address}`);

      // Send the file to the printer
      logger.info(`Sending file to Bluetooth printer: ${tempFilePath}`);

      // Use obexftp to send the file
      const channel = this.config.channel || 1;
      await execPromise(
        `obexftp --nopath --noconn --uuid none --bluetooth ${address} --channel ${channel} --put "${tempFilePath}"`,
      );

      // Clean up
      fs.unlinkSync(tempFilePath);

      logger.info("Print job sent to Bluetooth printer successfully");
      return {
        success: true,
      };
    } catch (error) {
      logError("Failed to print to Bluetooth printer", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Format receipt text to fit the configured width
   */
  private formatReceiptText(text: string): string {
    const width = config.printing.receiptWidth;
    if (!width || width <= 0) {
      return text;
    }

    const lines = text.split("\n");
    const formattedLines = lines.map((line) => {
      // Skip lines that are already shorter than the width
      if (line.length <= width) {
        return line;
      }

      // Handle long lines by wrapping them
      const wrappedLines: string[] = [];
      let currentLine = "";
      const words = line.split(" ");

      for (const word of words) {
        if ((currentLine + word).length <= width) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          wrappedLines.push(currentLine);
          currentLine = word;
        }
      }

      if (currentLine) {
        wrappedLines.push(currentLine);
      }

      return wrappedLines.join("\n");
    });

    return formattedLines.join("\n");
  }
}

/**
 * Windows implementation of Bluetooth printer service
 */
class WindowsBluetoothPrinterService implements BluetoothPrinterService {
  private config: BluetoothPrinterConfig;
  private available = false;

  constructor(config: BluetoothPrinterConfig) {
    this.config = config;
    this.checkAvailability()
      .then((available) => {
        this.available = available;
        if (available) {
          logger.info("Bluetooth printing service initialized");
        } else {
          logger.warn("Bluetooth is not available on this system");
        }
      })
      .catch((error) => {
        logError("Failed to check Bluetooth availability", error);
      });
  }

  /**
   * Check if Bluetooth is available on this system
   */
  async isAvailable(): Promise<boolean> {
    return this.available;
  }

  /**
   * Check if the service is enabled in configuration
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Check if Bluetooth is available on this system
   */
  private async checkAvailability(): Promise<boolean> {
    try {
      // Check if Bluetooth is available using PowerShell
      const { stdout } = await execPromise(
        'powershell -Command "Get-PnpDevice -Class Bluetooth | Select-Object Status"',
      );
      return stdout.includes("OK");
    } catch (error) {
      logger.debug("Bluetooth is not available:", error);
      return false;
    }
  }

  /**
   * Discover available Bluetooth printers
   */
  async discoverPrinters(): Promise<BluetoothPrinterInfo[]> {
    if (!this.available) {
      logger.warn("Bluetooth is not available");
      return [];
    }

    if (!this.config.discoverable) {
      logger.info("Bluetooth discovery is disabled in configuration");

      // Return the configured printer if available
      if (this.config.address) {
        return [
          {
            name: this.config.name,
            address: this.config.address,
            channel: this.config.channel,
            connected: false,
          },
        ];
      }

      return [];
    }

    try {
      logger.info("Discovering Bluetooth devices...");

      // Use PowerShell to discover Bluetooth devices
      const { stdout } = await execPromise(
        "powershell -Command \"Get-PnpDevice -Class Bluetooth | Where-Object { $_.Status -eq 'OK' } | Select-Object FriendlyName, DeviceID | ConvertTo-Json\"",
      );

      // Parse device list
      let devices: any[] = [];
      try {
        const parsed = JSON.parse(stdout);
        devices = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        logger.error("Failed to parse Bluetooth devices:", parseError);
        return [];
      }

      // Filter for printers
      const printers = devices
        .filter(
          (device) =>
            device.FriendlyName &&
            (device.FriendlyName.toLowerCase().includes("print") ||
              device.FriendlyName.toLowerCase().includes("pos")),
        )
        .map((device) => ({
          name: device.FriendlyName,
          address: device.DeviceID,
          connected: true,
        }));

      logger.info(`Discovered ${printers.length} Bluetooth printers`);
      return printers;
    } catch (error) {
      logError("Failed to discover Bluetooth printers", error);
      return [];
    }
  }

  /**
   * Print a file to a Bluetooth printer
   */
  async print(
    fileContent: string,
    fileName: string,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    if (!this.available) {
      return {
        success: false,
        error: "Bluetooth is not available",
      };
    }

    if (!this.config.enabled) {
      return {
        success: false,
        error: "Bluetooth printing is disabled in configuration",
      };
    }

    // Use the printer from options, or the default from config
    const address = options?.printer || this.config.address;

    if (!address) {
      return {
        success: false,
        error: "No Bluetooth printer address specified",
      };
    }

    try {
      // Create temporary file
      const tempDir = config.printing.tempDirectory || os.tmpdir();
      const tempFilePath = path.join(tempDir, fileName);

      // Decode base64 content and write to file
      const buffer = Buffer.from(fileContent, "base64");
      fs.writeFileSync(tempFilePath, buffer);

      // Format receipt if it's a text file
      if (fileName.endsWith(".txt") && config.printing.receiptWidth > 0) {
        try {
          const content = fs.readFileSync(tempFilePath, "utf8");
          const formattedContent = this.formatReceiptText(content);
          fs.writeFileSync(tempFilePath, formattedContent);
        } catch (formatError) {
          logger.warn(
            `Failed to format receipt: ${formatError instanceof Error ? formatError.message : String(formatError)}`,
          );
        }
      }

      // On Windows, we'll use the printer name to print
      // First, get the printer name from the device ID
      const { stdout: printerNameStdout } = await execPromise(
        `powershell -Command "Get-PnpDevice -InstanceId '${address}' | Select-Object -ExpandProperty FriendlyName"`,
      );

      const printerName = printerNameStdout.trim();

      if (!printerName) {
        return {
          success: false,
          error: "Failed to get printer name from device ID",
        };
      }

      // Print the file
      logger.info(`Printing to Bluetooth printer: ${printerName}`);
      await execPromise(
        `powershell -Command "Start-Process -FilePath '${tempFilePath}' -Verb Print -PrinterName '${printerName}'"`,
      );

      // Clean up
      setTimeout(() => {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkError) {
          logger.error("Failed to delete temp file:", unlinkError);
        }
      }, 5000);

      logger.info("Print job sent to Bluetooth printer successfully");
      return {
        success: true,
      };
    } catch (error) {
      logError("Failed to print to Bluetooth printer", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Format receipt text to fit the configured width
   */
  private formatReceiptText(text: string): string {
    const width = config.printing.receiptWidth;
    if (!width || width <= 0) {
      return text;
    }

    const lines = text.split("\n");
    const formattedLines = lines.map((line) => {
      // Skip lines that are already shorter than the width
      if (line.length <= width) {
        return line;
      }

      // Handle long lines by wrapping them
      const wrappedLines: string[] = [];
      let currentLine = "";
      const words = line.split(" ");

      for (const word of words) {
        if ((currentLine + word).length <= width) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          wrappedLines.push(currentLine);
          currentLine = word;
        }
      }

      if (currentLine) {
        wrappedLines.push(currentLine);
      }

      return wrappedLines.join("\n");
    });

    return formattedLines.join("\n");
  }
}

/**
 * Factory function to create the appropriate Bluetooth printer service
 */
export function createBluetoothPrinterService(
  config: BluetoothPrinterConfig,
): BluetoothPrinterService {
  const platform = os.platform();
  logger.debug(`Creating Bluetooth printer service for platform: ${platform}`);

  if (platform === "win32") {
    return new WindowsBluetoothPrinterService(config);
  } else {
    return new LinuxBluetoothPrinterService(config);
  }
}

// Create and export a singleton instance
export const bluetoothPrinterService = createBluetoothPrinterService(
  config.printing.bluetooth,
);

export default bluetoothPrinterService;
