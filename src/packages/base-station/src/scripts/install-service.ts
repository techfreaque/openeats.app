#!/usr/bin/env ts-node
/**
 * Script to install the cross-print-server as a systemd service
 * This is a TypeScript version of the install-service.sh script
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

import logger from "../logging";

/**
 * Check if the script is running as root
 * @returns True if running as root, false otherwise
 */
function isRoot(): boolean {
  return process.getuid() === 0;
}

/**
 * Install the cross-print-server as a systemd service
 */
async function installService(): Promise<void> {
  try {
    // Check if running as root
    if (!isRoot()) {
      logger.error("This script must be run as root");
      process.exit(1);
    }

    // Configuration
    const appDir = process.cwd();
    const serviceName = "cross-print-server";
    const installDir = "/opt/cross-print-server";
    const sudoUser = env.SUDO_USER || "root";

    // Create installation directory
    logger.info("Creating installation directory...");
    if (!fs.existsSync(installDir)) {
      fs.mkdirSync(installDir, { recursive: true });
    }

    // Copy application files
    logger.info("Copying application files...");
    execSync(`cp -r "${appDir}"/* "${installDir}/"`, { stdio: "inherit" });

    // Build application
    logger.info("Building application...");
    process.chdir(installDir);
    execSync("npm install", { stdio: "inherit" });
    execSync("npm run build", { stdio: "inherit" });

    // Install systemd service
    logger.info("Installing systemd service...");
    const serviceFilePath = path.join(
      installDir,
      "systemd",
      `${serviceName}.service`,
    );
    const systemdServicePath = "/etc/systemd/system/";

    if (!fs.existsSync(serviceFilePath)) {
      logger.error(`Service file not found: ${serviceFilePath}`);
      process.exit(1);
    }

    fs.copyFileSync(
      serviceFilePath,
      path.join(systemdServicePath, `${serviceName}.service`),
    );
    execSync("systemctl daemon-reload", { stdio: "inherit" });
    execSync(`systemctl enable ${serviceName}`, { stdio: "inherit" });

    // Set permissions
    logger.info("Setting permissions...");
    execSync(`chown -R ${sudoUser}:${sudoUser} ${installDir}`, {
      stdio: "inherit",
    });

    // Start the service
    logger.info("Starting service...");
    execSync(`systemctl start ${serviceName}`, { stdio: "inherit" });

    logger.info("Installation complete!");
    logger.info("Service status:");
    execSync(`systemctl status ${serviceName}`, { stdio: "inherit" });
  } catch (error) {
    logger.error("Error installing service:", error);
    process.exit(1);
  }
}

// Run the script if it's called directly
if (require.main === module) {
  installService().catch((error) => {
    logger.error("Unhandled error:", error);
    process.exit(1);
  });
}

export default installService;
