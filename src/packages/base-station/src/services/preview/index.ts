import { createCanvas, loadImage } from "canvas";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";
import { v4 as uuidv4 } from "uuid";

import { config } from "../../config";
import logger, { logError } from "../../logging";
import type { PrintOptions } from "../../types";

const execPromise = util.promisify(exec);

// Ensure temp directory exists
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

interface PreviewOptions {
  width?: number;
  height?: number;
  format?: "png" | "jpeg" | "pdf";
  dpi?: number;
}

class PrintPreviewService {
  // Generate a preview of a print job
  async generatePreview(
    content: string,
    contentType: "raw" | "html" | "markdown" | "image",
    fileName: string,
    options?: PrintOptions & PreviewOptions,
  ): Promise<{ filePath: string; base64: string }> {
    try {
      // Create a unique ID for this preview
      const previewId = uuidv4();

      // Determine file extension
      const fileExt = path.extname(fileName).toLowerCase();

      // Create temporary file path for the content
      const tempFilePath = path.join(tempDir, `${previewId}-content${fileExt}`);

      // Create temporary file path for the preview
      const previewFormat = options?.format || "png";
      const previewFilePath = path.join(
        tempDir,
        `${previewId}-preview.${previewFormat}`,
      );

      // Write content to temporary file
      if (contentType === "image") {
        // Decode base64 image
        const buffer = Buffer.from(content, "base64");
        fs.writeFileSync(tempFilePath, buffer);
      } else {
        // Write text content
        fs.writeFileSync(tempFilePath, content);
      }

      // Generate preview based on content type
      let base64: string;

      switch (contentType) {
        case "image":
          base64 = await this.generateImagePreview(
            tempFilePath,
            previewFilePath,
            options,
          );
          break;
        case "html":
          base64 = await this.generateHtmlPreview(
            tempFilePath,
            previewFilePath,
            options,
          );
          break;
        case "raw":
          base64 = await this.generateTextPreview(
            tempFilePath,
            previewFilePath,
            options,
          );
          break;
        case "markdown":
          base64 = await this.generateMarkdownPreview(
            tempFilePath,
            previewFilePath,
            options,
          );
          break;
        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }

      // Clean up temporary content file
      fs.unlinkSync(tempFilePath);

      logger.info(`Generated preview: ${path.basename(previewFilePath)}`);

      return {
        filePath: previewFilePath,
        base64,
      };
    } catch (error) {
      logError("Failed to generate preview", error);
      throw error;
    }
  }

  // Generate a preview of an image
  private async generateImagePreview(
    inputPath: string,
    outputPath: string,
    options?: PrintOptions & PreviewOptions,
  ): Promise<string> {
    try {
      // Load the image
      const image = await loadImage(inputPath);

      // Determine dimensions
      const width = options?.width || image.width;
      const height = options?.height || image.height;

      // Create canvas
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Draw image
      ctx.drawImage(image, 0, 0, width, height);

      // Convert to base64
      const base64 = canvas
        .toDataURL(`image/${options?.format || "png"}`)
        .split(",")[1];

      // Save to file
      const buffer = Buffer.from(base64, "base64");
      fs.writeFileSync(outputPath, buffer);

      return base64;
    } catch (error) {
      logError("Failed to generate image preview", error);
      throw error;
    }
  }

  // Generate a preview of HTML content
  private async generateHtmlPreview(
    inputPath: string,
    outputPath: string,
    options?: PrintOptions & PreviewOptions,
  ): Promise<string> {
    try {
      // Use wkhtmltopdf or similar to convert HTML to PDF/image
      const width = options?.width || 800;
      const height = options?.height || 1200;
      const dpi = options?.dpi || 96;

      // Check if wkhtmltopdf is available
      try {
        await execPromise("which wkhtmltopdf");
      } catch (error) {
        throw new Error(
          "wkhtmltopdf is not installed. Please install it to generate HTML previews.",
        );
      }

      // Generate PDF first
      const pdfPath = `${outputPath}.pdf`;
      await execPromise(
        `wkhtmltopdf --quiet --dpi ${dpi} "${inputPath}" "${pdfPath}"`,
      );

      // If format is PDF, we're done
      if (options?.format === "pdf") {
        // Read PDF as base64
        const pdfBuffer = fs.readFileSync(pdfPath);
        const base64 = pdfBuffer.toString("base64");

        // Rename PDF to output path
        fs.renameSync(pdfPath, outputPath);

        return base64;
      }

      // Convert PDF to image
      try {
        await execPromise("which convert");
      } catch (error) {
        throw new Error(
          "ImageMagick is not installed. Please install it to convert PDF to images.",
        );
      }

      await execPromise(
        `convert -density ${dpi} "${pdfPath}" -resize ${width}x${height} "${outputPath}"`,
      );

      // Clean up PDF
      fs.unlinkSync(pdfPath);

      // Read image as base64
      const imageBuffer = fs.readFileSync(outputPath);
      return imageBuffer.toString("base64");
    } catch (error) {
      logError("Failed to generate HTML preview", error);
      throw error;
    }
  }

  // Generate a preview of text content
  private async generateTextPreview(
    inputPath: string,
    outputPath: string,
    options?: PrintOptions & PreviewOptions,
  ): Promise<string> {
    try {
      // Read text content
      const text = fs.readFileSync(inputPath, "utf8");

      // Format text for receipt if needed
      let formattedText = text;
      if (config.printing.receiptWidth > 0) {
        formattedText = this.formatReceiptText(text);
      }

      // Determine dimensions
      const width = options?.width || 800;
      const height = options?.height || 1200;

      // Create canvas
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Set background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Set text style
      ctx.fillStyle = "#000000";
      ctx.font = "14px monospace";

      // Draw text
      const lineHeight = 16;
      const lines = formattedText.split("\n");
      const margin = 20;

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], margin, margin + i * lineHeight);
      }

      // Convert to base64
      const base64 = canvas
        .toDataURL(`image/${options?.format || "png"}`)
        .split(",")[1];

      // Save to file
      const buffer = Buffer.from(base64, "base64");
      fs.writeFileSync(outputPath, buffer);

      return base64;
    } catch (error) {
      logError("Failed to generate text preview", error);
      throw error;
    }
  }

  // Generate a preview of markdown content
  private async generateMarkdownPreview(
    inputPath: string,
    outputPath: string,
    options?: PrintOptions & PreviewOptions,
  ): Promise<string> {
    try {
      // Read markdown content
      const markdown = fs.readFileSync(inputPath, "utf8");

      // Convert markdown to HTML
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            p {
              margin: 1em 0;
            }
            pre {
              background-color: #f5f5f5;
              padding: 10px;
              border-radius: 5px;
              overflow-x: auto;
            }
            code {
              font-family: monospace;
              background-color: #f5f5f5;
              padding: 2px 4px;
              border-radius: 3px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          ${this.markdownToHtml(markdown)}
        </body>
        </html>
      `;

      // Write HTML to temporary file
      const htmlPath = `${inputPath}.html`;
      fs.writeFileSync(htmlPath, html);

      // Generate preview from HTML
      const result = await this.generateHtmlPreview(
        htmlPath,
        outputPath,
        options,
      );

      // Clean up HTML file
      fs.unlinkSync(htmlPath);

      return result;
    } catch (error) {
      logError("Failed to generate markdown preview", error);
      throw error;
    }
  }

  // Format text for receipt
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

  // Convert markdown to HTML (simple implementation)
  private markdownToHtml(markdown: string): string {
    let html = markdown;

    // Headers
    html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");
    html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
    html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
    html = html.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
    html = html.replace(/^##### (.*$)/gm, "<h5>$1</h5>");
    html = html.replace(/^###### (.*$)/gm, "<h6>$1</h6>");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Lists
    html = html.replace(/^\* (.*$)/gm, "<ul><li>$1</li></ul>");
    html = html.replace(/^- (.*$)/gm, "<ul><li>$1</li></ul>");
    html = html.replace(/^([0-9]+)\. (.*$)/gm, "<ol><li>$2</li></ol>");

    // Fix lists (combine consecutive list items)
    html = html.replace(/<\/ul>\s*<ul>/g, "");
    html = html.replace(/<\/ol>\s*<ol>/g, "");

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Paragraphs
    html = html.replace(/^(?!<[a-z])(.*$)/gm, "<p>$1</p>");

    // Fix empty paragraphs
    html = html.replace(/<p><\/p>/g, "");

    return html;
  }

  // Clean up temporary files
  async cleanupTempFiles(): Promise<void> {
    try {
      // Get all files in temp directory
      const files = fs.readdirSync(tempDir);

      // Get current time
      const now = Date.now();

      // Delete files older than 1 hour
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);

        // Check if file is older than 1 hour
        if (now - stats.mtimeMs > 60 * 60 * 1000) {
          fs.unlinkSync(filePath);
          logger.debug(`Deleted old temporary file: ${file}`);
        }
      }
    } catch (error) {
      logError("Failed to clean up temporary files", error);
    }
  }
}

// Export a singleton instance
export const printPreviewService = new PrintPreviewService();

// Clean up temporary files every hour
setInterval(
  () => {
    printPreviewService.cleanupTempFiles();
  },
  60 * 60 * 1000,
);
