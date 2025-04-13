import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

import { config } from "../config";
import type { NotificationConfig } from "../types";

// Interface for notification service
export interface NotificationService {
  playSound(soundType: keyof NotificationConfig["sounds"]): Promise<void>;
  setVolume(volume: number): Promise<void>;
  isEnabled(): boolean;
}

// Linux implementation using aplay/mpg123
class LinuxNotificationService implements NotificationService {
  private config: NotificationConfig;
  private enabled: boolean;

  constructor(config: NotificationConfig) {
    this.config = config;
    this.enabled = config.enabled;
  }

  async playSound(
    soundType: keyof NotificationConfig["sounds"],
  ): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const soundFile = this.config.sounds[soundType];
    if (!soundFile) {
      console.warn(`Sound file for ${soundType} not configured`);
      return;
    }

    const soundPath = path.resolve(process.cwd(), soundFile);

    // Check if file exists
    if (!fs.existsSync(soundPath)) {
      console.warn(`Sound file not found: ${soundPath}`);
      return;
    }

    try {
      // Determine player based on file extension
      let command: string;
      if (soundPath.endsWith(".mp3")) {
        command = `mpg123 -q ${soundPath}`;
      } else if (soundPath.endsWith(".wav")) {
        command = `aplay -q ${soundPath}`;
      } else {
        console.warn(`Unsupported sound file format: ${soundPath}`);
        return;
      }

      return new Promise<void>((resolve, reject) => {
        exec(command, (error) => {
          if (error) {
            errorLogger("Failed to play sound:", error);
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      errorLogger("Error playing sound:", error);
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (volume < 0 || volume > 100) {
      throw new Error("Volume must be between 0 and 100");
    }

    try {
      // Set volume using amixer
      const command = `amixer sset Master ${volume}%`;

      return new Promise<void>((resolve, reject) => {
        exec(command, (error) => {
          if (error) {
            errorLogger("Failed to set volume:", error);
            reject(error);
          } else {
            this.config.volume = volume;
            resolve();
          }
        });
      });
    } catch (error) {
      errorLogger("Error setting volume:", error);
      throw error;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Windows implementation using PowerShell
class WindowsNotificationService implements NotificationService {
  private config: NotificationConfig;
  private enabled: boolean;

  constructor(config: NotificationConfig) {
    this.config = config;
    this.enabled = config.enabled;
  }

  async playSound(
    soundType: keyof NotificationConfig["sounds"],
  ): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const soundFile = this.config.sounds[soundType];
    if (!soundFile) {
      console.warn(`Sound file for ${soundType} not configured`);
      return;
    }

    const soundPath = path.resolve(process.cwd(), soundFile);

    // Check if file exists
    if (!fs.existsSync(soundPath)) {
      console.warn(`Sound file not found: ${soundPath}`);
      return;
    }

    try {
      // Use PowerShell to play sound
      const command = `powershell -Command "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`;

      return new Promise<void>((resolve, reject) => {
        exec(command, (error) => {
          if (error) {
            errorLogger("Failed to play sound:", error);
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      errorLogger("Error playing sound:", error);
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (volume < 0 || volume > 100) {
      throw new Error("Volume must be between 0 and 100");
    }

    try {
      // Set volume using PowerShell
      const command = `powershell -Command "$wshShell = New-Object -ComObject WScript.Shell; $wshShell.SendKeys([char]174 * 50); $wshShell.SendKeys([char]175 * ${Math.floor(volume / 2)})"`;

      return new Promise<void>((resolve, reject) => {
        exec(command, (error) => {
          if (error) {
            errorLogger("Failed to set volume:", error);
            reject(error);
          } else {
            this.config.volume = volume;
            resolve();
          }
        });
      });
    } catch (error) {
      errorLogger("Error setting volume:", error);
      throw error;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Factory function to create the appropriate notification service
export function createNotificationService(
  config: NotificationConfig,
): NotificationService {
  const platform = os.platform();

  if (platform === "win32") {
    return new WindowsNotificationService(config);
  } else {
    return new LinuxNotificationService(config);
  }
}

// Singleton instance
const notificationService = createNotificationService(config.notifications);

// Export functions that use the singleton
export async function playSound(
  soundType: keyof NotificationConfig["sounds"],
): Promise<void> {
  return await notificationService.playSound(soundType);
}

export async function setVolume(volume: number): Promise<void> {
  return await notificationService.setVolume(volume);
}

export function isNotificationEnabled(): boolean {
  return notificationService.isEnabled();
}

// Create sounds directory if it doesn't exist
const soundsDir = path.join(process.cwd(), "sounds");
if (!fs.existsSync(soundsDir)) {
  try {
    fs.mkdirSync(soundsDir, { recursive: true });
    debugLogger("Created sounds directory");
  } catch (error) {
    errorLogger("Failed to create sounds directory:", error);
  }
}
