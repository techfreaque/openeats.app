import fs from "fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { printPreviewService } from "./index";

// Create our spy first, before any vi.mock calls
const execPromiseMock = vi.fn().mockResolvedValue({ stdout: "", stderr: "" });

// Mock the fs module properly for Vitest
vi.mock("fs", () => {
  const mockFs = {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue("test content"),
    unlinkSync: vi.fn(),
    renameSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue(["test.png"]),
    statSync: vi.fn().mockReturnValue({
      mtimeMs: Date.now() - 2 * 60 * 60 * 1000, // 2 hours old
    }),
  };

  // Make sure the default export works
  mockFs.default = mockFs;

  return mockFs;
});

// Mock the canvas module
vi.mock("canvas", () => {
  const mockContext = {
    fillStyle: "",
    font: "",
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
  };

  const mockCanvas = {
    getContext: vi.fn().mockReturnValue(mockContext),
    toDataURL: vi.fn().mockReturnValue("data:image/png;base64,test"),
    width: 300,
    height: 200,
  };

  return {
    createCanvas: vi.fn().mockReturnValue(mockCanvas),
    loadImage: vi.fn().mockResolvedValue({
      width: 100,
      height: 100,
    }),
  };
});

// Mock the child_process module
vi.mock("child_process", () => {
  return {
    exec: vi.fn().mockImplementation((command, callback) => {
      if (callback) {
        callback(null, { stdout: "test", stderr: "" });
      }
      return {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn(),
      };
    }),
  };
});

// Mock the util module properly
vi.mock("util", () => {
  return {
    promisify: vi.fn().mockReturnValue(execPromiseMock),
    inherits: vi.fn(),
    inspect: vi.fn(),
    format: vi.fn().mockImplementation((str) => str),
    default: {
      promisify: vi.fn().mockReturnValue(execPromiseMock),
      inherits: vi.fn(),
      inspect: vi.fn(),
      format: vi.fn().mockImplementation((str) => str),
    },
  };
});

describe("Print Preview Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generatePreview", () => {
    it("should generate a preview for raw text content", async () => {
      const content = "Hello, world!";
      const contentType = "raw";
      const fileName = "test.txt";
      const options = {
        width: 800,
        height: 600,
        format: "png" as const,
      };

      const result = await printPreviewService.generatePreview(
        content,
        contentType,
        fileName,
        options,
      );

      expect(result).toBeDefined();
      expect(result.filePath).toBeDefined();
      expect(result.base64).toBe("test");

      // Check if file was written
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("should generate a preview for HTML content", async () => {
      const content = "<html><body><h1>Hello, world!</h1></body></html>";
      const contentType = "html";
      const fileName = "test.html";
      const options = {
        width: 800,
        height: 600,
        format: "pdf" as const,
      };

      const result = await printPreviewService.generatePreview(
        content,
        contentType,
        fileName,
        options,
      );

      expect(result).toBeDefined();
      expect(result.filePath).toBeDefined();

      // Check if execPromise was called for wkhtmltopdf - use the spy directly
      expect(execPromiseMock).toHaveBeenCalled();

      // Check if file was written
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("should generate a preview for markdown content", async () => {
      const content = "# Hello, world!\n\nThis is a test.";
      const contentType = "markdown";
      const fileName = "test.md";
      const options = {
        width: 800,
        height: 600,
        format: "png" as const,
      };

      const result = await printPreviewService.generatePreview(
        content,
        contentType,
        fileName,
        options,
      );

      expect(result).toBeDefined();
      expect(result.filePath).toBeDefined();

      // Check if execPromise was called for wkhtmltopdf - use the spy directly
      expect(execPromiseMock).toHaveBeenCalled();

      // Check if file was written
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("should generate a preview for image content", async () => {
      const content = "base64-encoded-image";
      const contentType = "image";
      const fileName = "test.png";
      const options = {
        width: 800,
        height: 600,
        format: "png" as const,
      };

      const result = await printPreviewService.generatePreview(
        content,
        contentType,
        fileName,
        options,
      );

      expect(result).toBeDefined();
      expect(result.filePath).toBeDefined();
      expect(result.base64).toBe("test");

      // Check if file was written
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("should throw error for unsupported content type", async () => {
      await expect(
        printPreviewService.generatePreview(
          "content",
          "unsupported",
          "test.txt",
          {},
        ),
      ).rejects.toThrow("Unsupported content type: unsupported");
    });
  });

  describe("cleanupTempFiles", () => {
    it("should delete old temporary files", async () => {
      await printPreviewService.cleanupTempFiles();

      // Check if fs.readdirSync was called
      expect(fs.readdirSync).toHaveBeenCalled();

      // Check if fs.statSync was called
      expect(fs.statSync).toHaveBeenCalled();

      // Check if fs.unlinkSync was called
      expect(fs.unlinkSync).toHaveBeenCalled();
    });
  });
});
