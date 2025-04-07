/**
 * scripts/generate-endpoints.ts
 *
 * This script runs at build time (or on dev onChange) to:
 * 1) Scan "src/app/api" for subdirectories containing "definition.ts".
 * 2) Generate "src/app/api/generated/endpoints.ts" with static imports used by the ApiExplorer.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Track last generation time and file hashes to avoid unnecessary rebuilds
let lastGenerationTime = 0;
const COOLDOWN_MS = 2000; // Only run once every 2 seconds max
let lastDefinitionsHash = "";

export function generateEndpoints(rootDir: string): void {
  try {
    // Check if we should run the generator
    const now = Date.now();
    const currentHash = getDefinitionsHash(rootDir);

    if (
      now - lastGenerationTime > COOLDOWN_MS &&
      currentHash !== lastDefinitionsHash
    ) {
      // Update tracking variables
      lastGenerationTime = now;
      lastDefinitionsHash = currentHash;

      // Generate endpoints
      _generateEndpoints(rootDir);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ [next-vibe] Failed to generate endpoints:", error);
  }
}

// Helper to get a hash of all definition files
function getDefinitionsHash(rootDir: string): string {
  const API_DIR = path.join(rootDir, "src", "app", "api");

  try {
    // Simple recursive function to find all definition files
    function findDefinitionFiles(dir: string): string[] {
      const definitions: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          definitions.push(...findDefinitionFiles(fullPath));
        } else if (entry.name === "definition.ts") {
          definitions.push(fullPath);
        }
      }

      return definitions;
    }

    // Get file contents and hash them
    const files = findDefinitionFiles(API_DIR);
    const fileContents = files
      .map((file) => {
        try {
          return fs.readFileSync(file, "utf8");
        } catch {
          return file; // If we can't read, just use the path as content
        }
      })
      .join("");
    return createHash("md5").update(fileContents).digest("hex");
  } catch {
    // If anything fails, return a timestamp to force regeneration
    return Date.now().toString();
  }
}

// Create recursive function to find all definition files
function findDefinitionFiles(dir: string, rootDir: string): string[] {
  const definitions: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      definitions.push(...findDefinitionFiles(fullPath, rootDir));
    } else if (entry.name === "definition.ts") {
      definitions.push(fullPath);
    }
  }

  return definitions;
}

export function _generateEndpoints(rootDir: string): number {
  const ROOT_DIR = rootDir;
  const API_DIR = path.join(ROOT_DIR, "src", "app", "api");
  const OUTPUT_FILE = path.join(
    ROOT_DIR,
    "src",
    "app",
    "api",
    "generated",
    "endpoints.ts",
  );

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  // Find all definition files
  const definitionFiles = findDefinitionFiles(API_DIR, API_DIR);

  // Generate the imports and endpoints object
  let fileContent = `// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated by scripts/generate-endpoints.ts
*/

import type { ApiSection } from "next-vibe/shared";

`;

  // Track all import statements and object entries
  const imports: string[] = [];
  const objectEntries: string[] = [];
  let importCounter = 0;

  // Process each definition file
  for (const filePath of definitionFiles) {
    // Get relative path from API directory
    const relativePath = path.relative(API_DIR, filePath);
    // Get directory structure for the endpoint
    const pathSegments = path.dirname(relativePath).split(path.sep);

    // Create variable name for import
    const varName = `definition_${importCounter++}`;

    // Generate import path
    const importPath = `@/app/api/${relativePath.replace(/\.ts$/, "")}`;

    // Add import statement
    imports.push(`import { default as ${varName} } from "${importPath}";`);

    // Generate code to ensure path exists before assigning
    const pathCreationCode: string[] = [];
    let currentPath = "endpoints";
    for (const segment of pathSegments) {
      currentPath += `["${segment}"]`;
      pathCreationCode.push(`  if (!${currentPath}) ${currentPath} = {};`);
    }

    objectEntries.push(...pathCreationCode);
    objectEntries.push(`  ${currentPath} = ${varName};`);
  }

  // Add imports to file content
  fileContent += `${imports.join("\n")}\n\n`;

  // Create the endpoints object and setup function
  fileContent += `export const endpoints: ApiSection = {};\n\n`;
  fileContent += `function setupEndpoints() {\n`;

  // Use Set to remove duplicate path creation entries
  const uniqueEntries = [...new Set(objectEntries)];
  uniqueEntries.forEach((entry) => {
    fileContent += `${entry}\n`;
  });

  fileContent += `  return endpoints;\n`;
  fileContent += `}\n\n`;
  fileContent += `setupEndpoints();\n`;

  // Write the file
  fs.writeFileSync(OUTPUT_FILE, fileContent, "utf8");

  return definitionFiles.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateEndpoints(process.cwd());
}
