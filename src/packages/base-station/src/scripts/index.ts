/**
 * Entry point for scripts
 * This file exports all the scripts and provides a CLI interface
 */

import { Command } from "commander";

import logger from "../logging";
import buildBinaries from "./build-binaries";
import buildPiImage from "./build-pi-image";
import installService from "./install-service";

const program = new Command();

program
  .name("cross-print-server-scripts")
  .description("Scripts for the cross-print-server")
  .version("1.0.0");

program
  .command("build-binaries")
  .description("Build standalone executables for Windows and Linux")
  .action(async () => {
    try {
      await buildBinaries();
    } catch (error) {
      logger.error("Error building binaries:", error);
      process.exit(1);
    }
  });

program
  .command("install-service")
  .description("Install the cross-print-server as a systemd service")
  .action(async () => {
    try {
      await installService();
    } catch (error) {
      logger.error("Error installing service:", error);
      process.exit(1);
    }
  });

program
  .command("build-pi-image")
  .description(
    "Build a Raspberry Pi OS image with the cross-print-server pre-installed",
  )
  .action(async () => {
    try {
      await buildPiImage();
    } catch (error) {
      logger.error("Error building Raspberry Pi OS image:", error);
      process.exit(1);
    }
  });

// Export the scripts
export { buildBinaries, buildPiImage, installService };

// Run the CLI if this file is executed directly
if (require.main === module) {
  program.parse(process.argv);
}
