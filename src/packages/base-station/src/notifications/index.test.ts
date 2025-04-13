import { spawn } from "child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../config";
import logger from "../logging";
import { playSound, setVolume } from "./index";

// Mock child_process
vi.mock("child_process", () => ({
  spawn: vi.fn().mockReturnValue({
    on: vi.fn().mockImplementation((event, callback) => {
      if (event === "close") {
        callback(0); // Call with exit code 0 (success)
      }
      return this;
    }),
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
  }),
}));

// Mock config
vi.mock("../config", () => ({
  config: {
    notifications: {
      enabled: true,
      volume: 80,
      sounds: {
        newOrder: "sounds/new-order.mp3",
        printSuccess: "sounds/print-success.mp3",
        printError: "sounds/print-error.mp3",
      },
    },
  },
}));

// Mock logger
vi.mock("../logging", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock fs
vi.mock("fs", () => ({
  existsSync: vi.fn().mockReturnValue(true),
}));

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
      vi.mocked(config.notifications.enabled).mockReturnValueOnce(false);

      await playSound("newOrder");

      expect(spawn).not.toHaveBeenCalled();
    });

    it("should log warning when sound file doesn't exist", async () => {
      vi.mocked(require("fs").existsSync).mockReturnValueOnce(false);

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
      // Import the function
      const { isNotificationEnabled } = require("./index");
      
      // Test with default state (enabled=true from mock config)
      expect(isNotificationEnabled()).toBe(true);
      
      // Set up the mock to return false next time
      vi.mocked(config.notifications.enabled).mockReturnValueOnce(false);
      expect(isNotificationEnabled()).toBe(false);
    });
  });
});
