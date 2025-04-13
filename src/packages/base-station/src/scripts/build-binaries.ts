#!/usr/bin/env ts-node
/**
 * Script to build standalone executables for Windows and Linux
 * This is a TypeScript version of the build-binaries.sh script
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

import logger from "../logging";

/**
 * Check if a command exists in the PATH
 * @param command Command to check
 * @returns True if the command exists, false otherwise
 */
function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Build standalone executables for different platforms
 */
async function buildBinaries(): Promise<void> {
  try {
    // Configuration
    const appDir = process.cwd();
    const outputDir = path.join(appDir, "bin");

    // Check if pkg is installed
    if (!commandExists("pkg")) {
      logger.info("pkg is not installed. Installing...");
      execSync("npm install -g pkg", { stdio: "inherit" });
    }

    // Build TypeScript project
    logger.info("Building TypeScript project...");
    execSync("npm run build", { stdio: "inherit" });

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Build Linux executable
    logger.info("Building Linux executable...");
    execSync(
      `pkg . --targets node16-linux-x64 --output "${outputDir}/cross-print-server-linux"`,
      { stdio: "inherit" },
    );

    // Build Windows executable
    logger.info("Building Windows executable...");
    execSync(
      `pkg . --targets node16-win-x64 --output "${outputDir}/cross-print-server-win.exe"`,
      { stdio: "inherit" },
    );

    // Build Raspberry Pi executable
    logger.info("Building Raspberry Pi executable...");
    execSync(
      `pkg . --targets node16-linux-armv7 --output "${outputDir}/cross-print-server-raspberry"`,
      { stdio: "inherit" },
    );

    logger.info("Build complete!");
    logger.info(`Executables are located in: ${outputDir}`);
  } catch (error) {
    logger.error("Error building binaries:", error);
    process.exit(1);
  }
}

// Run the script if it's called directly
if (require.main === module) {
  buildBinaries().catch((error) => {
    logger.error("Unhandled error:", error);
    process.exit(1);
  });
}

export default buildBinaries;
