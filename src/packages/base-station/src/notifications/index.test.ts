import { spawn } from "child_process";
import fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../config";
import logger from "../logging";
import { isNotificationEnabled, playSound, setVolume } from "./index";

// Mock child_process
vi.mock("child_process", () => {
  const mockSpawn = vi.fn().mockReturnValue({
    on: vi.fn().mockImplementation((event, callback) => {
      if (event === "close") {
        callback(0); // Call with exit code 0 (success)
      }
      return this;
    }),
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
  });
  return { spawn: mockSpawn };
});

// Mock config
vi.mock("../config", () => {
  const mockConfig = {
    notifications: {
      enabled: true,
      volume: 80,
      sounds: {
        newOrder: "sounds/new-order.mp3",
        printSuccess: "sounds/print-success.mp3",
        printError: "sounds/print-error.mp3",
      },
    },
  };
  return { config: mockConfig };
});

// Mock logger
vi.mock("../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Fix the fs mock to include default export
vi.mock("fs", () => {
  const mockFs = {
    existsSync: vi.fn().mockImplementation((_filePath) => {
      // By default, return true for all paths except when explicitly mocked
      // Underscore prefix indicates unused parameter
      return true;
    }),
    mkdirSync: vi.fn(),
  };
  return {
    ...mockFs,
    default: mockFs,
    __esModule: true,
  };
});

// Don't mock notifications module - we're testing the actual implementation
vi.unmock("./index");

describe("Notifications Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("playSound", () => {
    it("should play sound when notifications are enabled", async () => {
      await playSound("newOrder");

      expect(spawn).toHaveBeenCalled();
      expect(spawn).toHaveBeenCalledWith("aplay", [
        expect.stringContaining("sounds/new-order.mp3"),
      ]);
    });

    it("should not play sound when notifications are disabled", async () => {
      // Temporarily set enabled to false
      const originalEnabled = config.notifications.enabled;
      config.notifications.enabled = false;

      await playSound("newOrder");

      // Restore original value
      config.notifications.enabled = originalEnabled;

      expect(spawn).not.toHaveBeenCalled();
    });

    it("should log warning when sound file doesn't exist", async () => {
      // Mock fs.existsSync to return false for this test
      vi.mocked(fs.existsSync).mockImplementationOnce(() => false);

      await playSound("newOrder");

      expect(spawn).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should handle errors during playback", async () => {
      vi.mocked(spawn).mockReturnValueOnce({
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === "error") {
            callback(new Error("Playback error"));
          }
          return this;
        }),
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
      } as any);

      await expect(playSound("newOrder")).rejects.toThrow("Playback error");
    });

    it("should handle non-zero exit codes", async () => {
      vi.mocked(spawn).mockReturnValueOnce({
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === "close") {
            callback(1); // Non-zero exit code
          }
          return this;
        }),
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
      } as any);

      await expect(playSound("newOrder")).rejects.toThrow(
        "Command failed with exit code 1",
      );
    });
  });

  describe("setVolume", () => {
    it("should set volume", async () => {
      await setVolume(50);

      expect(spawn).toHaveBeenCalled();
      expect(spawn).toHaveBeenCalledWith(
        "amixer",
        expect.arrayContaining(["50%"]),
      );
    });

    it("should clamp volume to valid range", async () => {
      await setVolume(150);
      expect(spawn).toHaveBeenCalledWith(
        "amixer",
        expect.arrayContaining(["100%"]),
      );

      await setVolume(-10);
      expect(spawn).toHaveBeenCalledWith(
        "amixer",
        expect.arrayContaining(["0%"]),
      );
    });

    it("should handle errors", async () => {
      vi.mocked(spawn).mockReturnValueOnce({
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === "error") {
            callback(new Error("Volume error"));
          }
          return this;
        }),
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
      } as any);

      await expect(setVolume(50)).rejects.toThrow("Volume error");
    });
  });

  describe("isNotificationEnabled", () => {
    it("should return notification enabled status", () => {
      // Test with default state (enabled=true from mock config)
      expect(isNotificationEnabled()).toBe(true);

      // Temporarily set enabled to false
      const originalEnabled = config.notifications.enabled;
      config.notifications.enabled = false;

      expect(isNotificationEnabled()).toBe(false);

      // Restore original value
      config.notifications.enabled = originalEnabled;
    });
  });
});
