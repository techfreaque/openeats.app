import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import type { ApiEndpoint } from "../../../client/endpoint";
import type { ApiSection, Methods } from "../../../shared/types/endpoint";
import { errorLogger } from "../../../shared/utils";

export function getEndpoints(): ApiSection {
  const apiSection: ApiSection = {};

  // Path to the API directory
  const apiDir = resolve(process.cwd(), "src/app/api");

  // Find all endpoint files recursively
  function findEndpointFiles(dir: string): void {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        findEndpointFiles(filePath);
      } else if (
        file.endsWith(".ts") &&
        !file.endsWith(".test.ts") &&
        !file.endsWith("route.ts")
      ) {
        try {
          // Check if file exports an endpoint
          const content = readFileSync(filePath, "utf8");
          if (
            content.includes("export const") &&
            content.includes("createEndpoint(")
          ) {
            // Extract endpoint info and add to structure
            registerEndpointFile(filePath, content);
          }
        } catch (err) {
          errorLogger(`Error processing ${filePath}:`, err);
        }
      }
    }
  }

  // Register an endpoint file in the endpoints structure
  function registerEndpointFile(filePath: string, content: string): void {
    // Extract the endpoint name (like "registerEndpoint")
    const match = content.match(/export const (\w+Endpoint) =/);
    if (!match) {
      return;
    }

    const endpointName = match[1];

    // Extract HTTP method from file
    const methodMatch = content.match(/method:\s*["'](\w+)["']/i);
    const method = methodMatch
      ? (methodMatch[1].toUpperCase() as Methods)
      : null;
    if (!method) {
      return;
    }

    // Get path from file location relative to api directory
    const relativePath = path
      .relative(apiDir, path.dirname(filePath))
      .split(path.sep);

    // Build endpoint path in the structure
    let current = apiSection;
    for (const segment of relativePath) {
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment] as ApiSection;
    }

    // Add endpoint with method key
    const modulePath = path.relative(process.cwd(), filePath);
    // This would require dynamic imports - we'll simplify by using a direct reference
    current[method] = require(modulePath)[endpointName];
  }

  try {
    findEndpointFiles(apiDir);
  } catch (err) {
    errorLogger("Error scanning API endpoints:", err);
  }

  return apiSection;
}

/**
 * Get example endpoint for a specific path
 */
export function getEndpointByPath<TRequest, TResponse, TUrlVariables>(
  path: string[],
  method: Methods,
  endpoints: ApiSection,
): ApiEndpoint<TRequest, TResponse, TUrlVariables> {
  const _method = method.toUpperCase() as Methods;
  const _path = [...path, _method];
  let endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables> =
    endpoints as unknown as ApiEndpoint<TRequest, TResponse, TUrlVariables>;
  for (const p of _path) {
    endpoint = endpoint[p];
  }
  return endpoint;
}
