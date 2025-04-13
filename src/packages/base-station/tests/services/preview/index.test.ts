import fs from "fs";
import util from "util";

import { printPreviewService } from "../../../src/services/preview";

// Mock the fs module
jest.mock("fs", () => {
  return {
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    readFileSync: jest.fn().mockReturnValue("test content"),
    unlinkSync: jest.fn(),
    renameSync: jest.fn(),
    readdirSync: jest.fn().mockReturnValue(["test.png"]),
    statSync: jest.fn().mockReturnValue({
      mtimeMs: Date.now() - 2 * 60 * 60 * 1000, // 2 hours old
    }),
  };
});

// Mock the canvas module
jest.mock("canvas", () => {
  const mockContext = {
    fillStyle: "",
    font: "",
    fillRect: jest.fn(),
    fillText: jest.fn(),
    drawImage: jest.fn(),
  };

  const mockCanvas = {
    getContext: jest.fn().mockReturnValue(mockContext),
    toDataURL: jest.fn().mockReturnValue("data:image/png;base64,test"),
    width: 300,
    height: 200,
  };

  return {
    createCanvas: jest.fn().mockReturnValue(mockCanvas),
    loadImage: jest.fn().mockResolvedValue({
      width: 100,
      height: 100,
    }),
  };
});

// Mock the child_process module
jest.mock("child_process", () => {
  return {
    exec: jest.fn().mockImplementation((command, callback) => {
      if (callback) {
        callback(null, { stdout: "test", stderr: "" });
      }
      return {
        stdout: {
          on: jest.fn(),
        },
        stderr: {
          on: jest.fn(),
        },
        on: jest.fn(),
      };
    }),
  };
});

// Mock the util module
jest.mock("util", () => {
  return {
    ...jest.requireActual("util"),
    promisify: jest.fn().mockImplementation((fn) => {
      return jest.fn().mockResolvedValue({ stdout: "test", stderr: "" });
    }),
  };
});

describe("Print Preview Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      // Mock the execPromise to simulate wkhtmltopdf and convert
      const execPromiseMock = jest
        .fn()
        .mockResolvedValue({ stdout: "", stderr: "" });
      (util.promisify as jest.Mock).mockReturnValue(execPromiseMock);

      const result = await printPreviewService.generatePreview(
        content,
        contentType,
        fileName,
        options,
      );

      expect(result).toBeDefined();
      expect(result.filePath).toBeDefined();

      // Check if execPromise was called for wkhtmltopdf
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

      // Mock the execPromise to simulate wkhtmltopdf and convert
      const execPromiseMock = jest
        .fn()
        .mockResolvedValue({ stdout: "", stderr: "" });
      (util.promisify as jest.Mock).mockReturnValue(execPromiseMock);

      const result = await printPreviewService.generatePreview(
        content,
        contentType,
        fileName,
        options,
      );

      expect(result).toBeDefined();
      expect(result.filePath).toBeDefined();

      // Check if execPromise was called for wkhtmltopdf
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
