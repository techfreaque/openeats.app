#!/usr/bin/env ts-node
/**
 * Script to build a Raspberry Pi OS image with the cross-print-server pre-installed
 * This is a TypeScript version of the build-pi-image.sh script
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
 * Build a Raspberry Pi OS image with the cross-print-server pre-installed
 */
async function buildPiImage(): Promise<void> {
  try {
    // Check if running as root
    if (!isRoot()) {
      logger.error("This script must be run as root");
      process.exit(1);
    }

    // Configuration
    const piGenRepo = "https://github.com/RPi-Distro/pi-gen.git";
    const appDir = process.cwd();
    const workDir = path.join(appDir, "pi-image-build");
    const outputDir = path.join(appDir, "pi-image-output");
    const imageName = "cross-print-server-raspios";

    // Install dependencies
    logger.info("Installing dependencies...");
    execSync("apt-get update", { stdio: "inherit" });
    execSync(
      "apt-get install -y coreutils quilt parted qemu-user-static debootstrap zerofree zip " +
        "dosfstools libarchive-tools libcap2-bin grep rsync xz-utils file git curl bc " +
        "qemu-utils kpartx",
      { stdio: "inherit" },
    );

    // Clone pi-gen repository
    logger.info("Cloning pi-gen repository...");
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }
    execSync(`git clone ${piGenRepo} ${workDir}`, { stdio: "inherit" });
    process.chdir(workDir);

    // Configure pi-gen
    logger.info("Configuring pi-gen...");
    const configContent = `IMG_NAME="${imageName}"
TARGET_HOSTNAME="printserver"
FIRST_USER_NAME="pi"
FIRST_USER_PASS="raspberry"
ENABLE_SSH=1
STAGE_LIST="stage0 stage1 stage2"
`;
    fs.writeFileSync(path.join(workDir, "config"), configContent);

    // Disable unwanted stages
    execSync("touch ./stage3/SKIP ./stage4/SKIP ./stage5/SKIP", {
      stdio: "inherit",
    });
    execSync("touch ./stage4/SKIP_IMAGES ./stage5/SKIP_IMAGES", {
      stdio: "inherit",
    });

    // Create custom stage for our application
    const customStageDir = path.join(workDir, "stage2/05-cross-print-server");
    const customStageFilesDir = path.join(customStageDir, "files");

    if (!fs.existsSync(customStageDir)) {
      fs.mkdirSync(customStageDir, { recursive: true });
    }

    if (!fs.existsSync(customStageFilesDir)) {
      fs.mkdirSync(customStageFilesDir, { recursive: true });
    }

    // Create installation script
    const installScriptContent = `#!/bin/bash -e

# Install Node.js
on_chroot << EOF2
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs
EOF2

# Install CUPS
on_chroot << EOF3
apt-get install -y cups
systemctl enable cups
EOF3

# Copy application files
mkdir -p "\${ROOTFS_DIR}/opt/cross-print-server"
cp -r "${appDir}"/* "\${ROOTFS_DIR}/opt/cross-print-server/"

# Build application
on_chroot << EOF4
cd /opt/cross-print-server
npm install
npm run build
EOF4

# Install systemd service
cp "\${ROOTFS_DIR}/opt/cross-print-server/systemd/cross-print-server.service" "\${ROOTFS_DIR}/etc/systemd/system/"
on_chroot << EOF5
systemctl enable cross-print-server
EOF5

# Set permissions
on_chroot << EOF6
chown -R pi:pi /opt/cross-print-server
EOF6
`;

    const installScriptPath = path.join(customStageDir, "00-run.sh");
    fs.writeFileSync(installScriptPath, installScriptContent);
    execSync(`chmod +x ${installScriptPath}`, { stdio: "inherit" });

    // Build the image
    logger.info("Building Raspberry Pi OS image...");
    execSync("./build.sh", { stdio: "inherit" });

    // Copy the image to the output directory
    logger.info("Copying image to output directory...");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    execSync(`cp ./deploy/*.img "${outputDir}/"`, { stdio: "inherit" });

    // Shrink the image (optional)
    if (commandExists("pishrink.sh")) {
      logger.info("Shrinking image...");
      execSync(`pishrink.sh "${outputDir}"/*.img`, { stdio: "inherit" });
    } else {
      logger.info("pishrink.sh not found. Skipping image shrinking.");
      logger.info(
        "To shrink the image, install pishrink: https://github.com/Drewsif/PiShrink",
      );
    }

    logger.info("Image build complete!");
    logger.info(`Image location: ${outputDir}`);
  } catch (error) {
    logger.error("Error building Raspberry Pi OS image:", error);
    process.exit(1);
  }
}

// Run the script if it's called directly
if (require.main === module) {
  buildPiImage().catch((error) => {
    logger.error("Unhandled error:", error);
    process.exit(1);
  });
}

export default buildPiImage;
