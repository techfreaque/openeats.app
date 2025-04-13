import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

import { config } from "../config";
import logger, { logError, logPrintJob } from "../logging";
import { playSound } from "../notifications";
import type { PrinterInfo, PrintOptions, PrintResult } from "../types";
import bluetoothPrinterService from "./bluetooth";

// Abstract printing interface
export interface PrinterService {
  print(
    fileContent: string,
    fileName: string,
    options?: PrintOptions,
  ): Promise<PrintResult>;
  getPrinters(): Promise<PrinterInfo[]>;
  getDefaultPrinter(): Promise<string | null>;
}

// Linux (CUPS) implementation
class LinuxPrinterService implements PrinterService {
  async print(
    fileContent: string,
    fileName: string,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    const printer = options?.printer || config.printing.defaultPrinter;
    let attempts = 0;
    const maxRetries = config.printing.autoRetry
      ? config.printing.maxRetries
      : 0;
    let tempFilePath = "";

    try {
      // Create temporary file
      const tempDir = config.printing.tempDirectory || os.tmpdir();
      tempFilePath = path.join(tempDir, fileName);

      // Decode base64 content and write to file
      const buffer = Buffer.from(fileContent, "base64");
      fs.writeFileSync(tempFilePath, buffer);

      // Format receipt if it's a text file and receipt width is configured
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

      // Retry loop
      while (attempts <= maxRetries) {
        try {
          if (attempts > 0) {
            logger.info(
              `Retrying print job (attempt ${attempts}/${maxRetries}): ${fileName}${printer ? ` to printer ${printer}` : ""}`,
            );
            // Wait before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, config.printing.retryDelay),
            );
          }

          // Build lp command
          let command = `lp "${tempFilePath}"`;

          // Add printer if specified
          if (printer) {
            command += ` -d "${printer}"`;
          }

          // Add options
          if (options?.copies) {
            command += ` -n ${options.copies}`;
          }

          if (options?.duplex) {
            command += " -o sides=two-sided-long-edge";
          }

          if (options?.orientation === "landscape") {
            command += " -o landscape";
          }

          // Add paper size if specified
          if (options?.paperSize) {
            command += ` -o media=${options.paperSize}`;
          }

          // Execute command
          const result = await new Promise<PrintResult>((resolve) => {
            logger.debug(`Executing print command: ${command}`);
            exec(command, (error, stdout, stderr) => {
              if (error) {
                logger.error(`Print command error: ${stderr || error.message}`);
                resolve({ success: false, error: stderr || error.message });
                return;
              }

              // Extract job ID from stdout (format: "request id is Printer-123 (1 file(s))")
              const match = stdout.match(/request id is ([^\s]+)/);
              const jobId = match ? match[1] : undefined;

              logger.debug(
                `Print command successful, job ID: ${jobId || "unknown"}`,
              );
              resolve({ success: true, jobId });
            });
          });

          // If successful, play sound and log
          if (result.success) {
            await playSound("printSuccess").catch((err) =>
              logger.error(`Failed to play success sound: ${err}`),
            );
            logPrintJob(fileName, printer, true, result.jobId);
            return result;
          }

          // If not successful and we have retries left, continue the loop
          attempts++;
          if (attempts > maxRetries) {
            // If we've exhausted retries, play error sound and return the last error
            await playSound("printError").catch((err) =>
              logger.error(`Failed to play error sound: ${err}`),
            );
            logPrintJob(fileName, printer, false, undefined, result.error);
            return result;
          }
        } catch (attemptError) {
          logger.error(
            `Error during print attempt ${attempts}: ${attemptError instanceof Error ? attemptError.message : String(attemptError)}`,
          );
          attempts++;
          if (attempts > maxRetries) {
            throw attemptError;
          }
        }
      }

      // This should never be reached due to the return statements in the loop
      return { success: false, error: "Unknown error in print retry loop" };
    } catch (error) {
      logError("Print error", error);
      await playSound("printError").catch((err) =>
        logger.error(`Failed to play error sound: ${err}`),
      );
      logPrintJob(
        fileName,
        printer,
        false,
        undefined,
        error instanceof Error ? error.message : String(error),
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      // Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          logger.error(
            `Failed to delete temp file: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }
    }
  }

  // Format receipt text to fit the configured width
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

  async getPrinters(): Promise<PrinterInfo[]> {
    return await new Promise<PrinterInfo[]>((resolve) => {
      logger.debug("Getting list of available printers");
      exec("lpstat -a", (error, stdout) => {
        if (error) {
          logger.error(
            `Failed to get printers: ${error instanceof Error ? error.message : String(error)}`,
          );
          resolve([]);
          return;
        }

        const printers: PrinterInfo[] = [];
        const lines = stdout.split("\n").filter(Boolean);

        // Get default printer
        exec("lpstat -d", (defError, defStdout) => {
          let defaultPrinter = "";

          if (!defError) {
            const match = defStdout.match(/system default destination: (\S+)/);
            if (match) {
              defaultPrinter = match[1];
              logger.debug(`Default printer: ${defaultPrinter}`);
            } else {
              logger.debug("No default printer found");
            }
          } else {
            logger.warn(
              `Failed to get default printer: ${defError instanceof Error ? defError.message : String(defError)}`,
            );
          }

          // Parse printer list
          for (const line of lines) {
            const match = line.match(/^(\S+)/);
            if (match) {
              const name = match[1];
              printers.push({
                name,
                isDefault: name === defaultPrinter,
                status: "idle", // We could get more detailed status with lpstat -p
              });
            }
          }

          logger.debug(`Found ${printers.length} printers`);
          resolve(printers);
        });
      });
    });
  }

  async getDefaultPrinter(): Promise<string | null> {
    return await new Promise<string | null>((resolve) => {
      logger.debug("Getting default printer");
      exec("lpstat -d", (error, stdout) => {
        if (error) {
          logger.error(
            `Failed to get default printer: ${error instanceof Error ? error.message : String(error)}`,
          );
          resolve(null);
          return;
        }

        const match = stdout.match(/system default destination: (\S+)/);
        if (match) {
          logger.debug(`Default printer: ${match[1]}`);
          resolve(match[1]);
        } else {
          logger.debug("No default printer found");
          resolve(null);
        }
      });
    });
  }
}

// Windows implementation
class WindowsPrinterService implements PrinterService {
  async print(
    fileContent: string,
    fileName: string,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    const printer = options?.printer || config.printing.defaultPrinter;
    let attempts = 0;
    const maxRetries = config.printing.autoRetry
      ? config.printing.maxRetries
      : 0;
    let tempFilePath = "";

    try {
      // Create temporary file
      const tempDir = config.printing.tempDirectory || os.tmpdir();
      tempFilePath = path.join(tempDir, fileName);

      // Decode base64 content and write to file
      const buffer = Buffer.from(fileContent, "base64");
      fs.writeFileSync(tempFilePath, buffer);

      // Format receipt if it's a text file and receipt width is configured
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

      // Retry loop
      while (attempts <= maxRetries) {
        try {
          if (attempts > 0) {
            logger.info(
              `Retrying print job (attempt ${attempts}/${maxRetries}): ${fileName}${printer ? ` to printer ${printer}` : ""}`,
            );
            // Wait before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, config.printing.retryDelay),
            );
          }

          // Build print command using PowerShell
          let command = `powershell -Command "Start-Process -FilePath '${tempFilePath}' -Verb Print`;

          // Add printer if specified
          if (printer) {
            command += ` -PrinterName '${printer}'`;
          }

          // Add copies if specified (Windows doesn't support this directly, but we can try)
          if (options?.copies && options.copies > 1) {
            command += `; for ($i=1; $i -lt ${options.copies}; $i++) { Start-Process -FilePath '${tempFilePath}' -Verb Print`;
            if (printer) {
              command += ` -PrinterName '${printer}'`;
            }
            command += ` }`;
          }

          command += '"';

          // Execute command
          const result = await new Promise<PrintResult>((resolve) => {
            logger.debug(`Executing print command: ${command}`);
            exec(command, (error, stdout, stderr) => {
              if (error) {
                logger.error(`Print command error: ${stderr || error.message}`);
                resolve({ success: false, error: stderr || error.message });
                return;
              }

              logger.debug(`Print command successful`);
              resolve({ success: true });
            });
          });

          // If successful, play sound and log
          if (result.success) {
            // Wait a bit to ensure printing has started before cleaning up
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await playSound("printSuccess").catch((err) =>
              logger.error(`Failed to play success sound: ${err}`),
            );
            logPrintJob(fileName, printer, true);
            return result;
          }

          // If not successful and we have retries left, continue the loop
          attempts++;
          if (attempts > maxRetries) {
            // If we've exhausted retries, play error sound and return the last error
            await playSound("printError").catch((err) =>
              logger.error(`Failed to play error sound: ${err}`),
            );
            logPrintJob(fileName, printer, false, undefined, result.error);
            return result;
          }
        } catch (attemptError) {
          logger.error(
            `Error during print attempt ${attempts}: ${attemptError instanceof Error ? attemptError.message : String(attemptError)}`,
          );
          attempts++;
          if (attempts > maxRetries) {
            throw attemptError;
          }
        }
      }

      // This should never be reached due to the return statements in the loop
      return { success: false, error: "Unknown error in print retry loop" };
    } catch (error) {
      logError("Print error", error);
      await playSound("printError").catch((err) =>
        logger.error(`Failed to play error sound: ${err}`),
      );
      logPrintJob(
        fileName,
        printer,
        false,
        undefined,
        error instanceof Error ? error.message : String(error),
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      // Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (e) {
          logger.error(
            `Failed to delete temp file: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
      }
    }
  }

  // Format receipt text to fit the configured width
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

  async getPrinters(): Promise<PrinterInfo[]> {
    return await new Promise<PrinterInfo[]>((resolve) => {
      logger.debug("Getting list of available printers (Windows)");
      const command =
        'powershell -Command "Get-Printer | Select-Object Name, Default | ConvertTo-Json"';

      exec(command, (error, stdout) => {
        if (error) {
          logger.error(
            `Failed to get printers: ${error instanceof Error ? error.message : String(error)}`,
          );
          resolve([]);
          return;
        }

        try {
          // Parse JSON output
          const printersData = JSON.parse(stdout);
          const printers: PrinterInfo[] = [];

          // Handle both array and single object responses
          const printersArray = Array.isArray(printersData)
            ? printersData
            : [printersData];

          for (const printer of printersArray) {
            printers.push({
              name: printer.Name,
              isDefault: printer.Default === true,
              status: "idle", // We could get more detailed status with another command
            });
          }

          logger.debug(`Found ${printers.length} printers`);
          resolve(printers);
        } catch (e) {
          logger.error(
            `Failed to parse printer data: ${e instanceof Error ? e.message : String(e)}`,
          );
          resolve([]);
        }
      });
    });
  }

  async getDefaultPrinter(): Promise<string | null> {
    return await new Promise<string | null>((resolve) => {
      logger.debug("Getting default printer (Windows)");
      const command =
        'powershell -Command "Get-Printer | Where-Object {$_.Default -eq $true} | Select-Object -ExpandProperty Name"';

      exec(command, (error, stdout) => {
        if (error) {
          logger.error(
            `Failed to get default printer: ${error instanceof Error ? error.message : String(error)}`,
          );
          resolve(null);
          return;
        }

        const printerName = stdout.trim();
        if (printerName) {
          logger.debug(`Default printer: ${printerName}`);
          resolve(printerName);
        } else {
          logger.debug("No default printer found");
          resolve(null);
        }
      });
    });
  }
}

// Factory function to create the appropriate printer service
export function createPrinterService(): PrinterService {
  const platform = os.platform();
  logger.info(`Creating printer service for platform: ${platform}`);

  return platform === "win32"
    ? new WindowsPrinterService()
    : new LinuxPrinterService();
}

// Singleton instance
const printerService = createPrinterService();

// Export functions that use the singleton
export async function printFile(
  fileContent: string,
  fileName: string,
  options?: PrintOptions,
): Promise<PrintResult> {
  logger.info(
    `Print job received: ${fileName}${options?.printer ? ` to printer ${options.printer}` : ""}`,
  );
  await playSound("newOrder").catch((err) =>
    logger.error(`Failed to play new order sound: ${err}`),
  );

  // Check if this is a Bluetooth printer
  const printerName = options?.printer || config.printing.defaultPrinter;
  const isBluetooth =
    printerName?.toLowerCase().includes("bluetooth") ||
    options?.bluetooth === true ||
    (config.printing.bluetooth.enabled && !printerName);

  if (isBluetooth && (await bluetoothPrinterService.isAvailable())) {
    logger.info(`Using Bluetooth printer service for ${fileName}`);
    return await bluetoothPrinterService.print(fileContent, fileName, options);
  }

  // Use regular printer service
  return await printerService.print(fileContent, fileName, options);
}

export async function getPrinters(): Promise<PrinterInfo[]> {
  logger.debug("Getting list of printers");

  // Get regular printers
  const regularPrinters = await printerService.getPrinters();

  // Get Bluetooth printers if enabled
  let bluetoothPrinters: PrinterInfo[] = [];
  if (
    config.printing.bluetooth.enabled &&
    (await bluetoothPrinterService.isAvailable())
  ) {
    try {
      const btPrinters = await bluetoothPrinterService.discoverPrinters();
      bluetoothPrinters = btPrinters.map((printer) => ({
        name: `Bluetooth: ${printer.name}`,
        isDefault: config.printing.defaultPrinter === printer.address,
        status: printer.connected ? "connected" : "disconnected",
      }));
      logger.debug(`Found ${bluetoothPrinters.length} Bluetooth printers`);
    } catch (error) {
      logError("Failed to get Bluetooth printers", error);
    }
  }

  // Combine and return all printers
  return [...regularPrinters, ...bluetoothPrinters];
}

export async function getDefaultPrinter(): Promise<string | null> {
  logger.debug("Getting default printer");
  return await printerService.getDefaultPrinter();
}

// Get printer status (for status responses)
export async function getPrinterStatus(): Promise<PrinterInfo[]> {
  try {
    logger.debug("Getting printer status");
    return await printerService.getPrinters();
  } catch (error) {
    logError("Failed to get printer status", error);
    return [];
  }
}
