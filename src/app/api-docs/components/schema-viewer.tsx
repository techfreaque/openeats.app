"use client";

import type { ApiEndpoint } from "next-query-portal/client";
import type { JSX } from "react";
import { z } from "zod";

interface SchemaViewerProps {
  endpoint: ApiEndpoint<unknown, unknown, unknown>;
}

export function SchemaViewer({ endpoint }: SchemaViewerProps): JSX.Element {
  // Try to convert schemas to readable format
  const readableRequestSchema = endpoint.requestSchema
    ? zodSchemaToReadable(endpoint.requestSchema) || endpoint.requestSchema
    : null;

  const readableResponseSchema = endpoint.responseSchema
    ? zodSchemaToReadable(endpoint.responseSchema) || endpoint.responseSchema
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {endpoint.requestSchema && (
        <div>
          <h4 className="text-sm font-medium mb-2">Request Schema</h4>
          <div className="bg-gray-800 rounded-lg p-4">
            <pre className="text-green-400 font-mono text-sm overflow-auto">
              {JSON.stringify(readableRequestSchema, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {endpoint.responseSchema && (
        <div>
          <h4 className="text-sm font-medium mb-2">Response Schema</h4>
          <div className="bg-gray-800 rounded-lg p-4">
            <pre className="text-green-400 font-mono text-sm overflow-auto">
              {JSON.stringify(readableResponseSchema, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {!endpoint.requestSchema && !endpoint.responseSchema && (
        <div className="text-gray-500 italic text-center py-4">
          No schema information available for this endpoint.
        </div>
      )}
    </div>
  );
}

// Helper function to convert Zod schema to human-readable format
function zodSchemaToReadable(schema: z.ZodType<any>): any {
  if (!schema) {
    return null;
  }

  try {
    // Get the description of the schema
    const description = schema.description;

    // For objects, get the shape
    if (schema instanceof z.ZodObject) {
      const shape = schema._def.shape();
      const properties: Record<string, any> = {};

      for (const [key, value] of Object.entries(shape)) {
        properties[key] = {
          type: getZodTypeName(value),
          optional: value.isOptional?.() || false,
          description: value.description,
        };
      }

      return {
        type: "object",
        properties,
        description,
      };
    }

    // For arrays
    if (schema instanceof z.ZodArray) {
      return {
        type: "array",
        items: getZodTypeName(schema._def.type),
        description,
      };
    }

    // For primitives and other types
    return {
      type: getZodTypeName(schema),
      description,
    };
  } catch (error) {
    // Fallback to original schema if parsing fails
    return {
      type: "unknown",
      note: "Schema could not be parsed into readable format",
    };
  }
}

// Helper to get the type name from a Zod schema
function getZodTypeName(schema: z.ZodType<any>): string {
  if (!schema) {
    return "unknown";
  }

  if (schema instanceof z.ZodString) {
    return "string";
  }
  if (schema instanceof z.ZodNumber) {
    return "number";
  }
  if (schema instanceof z.ZodBoolean) {
    return "boolean";
  }
  if (schema instanceof z.ZodObject) {
    return "object";
  }
  if (schema instanceof z.ZodArray) {
    return "array";
  }
  if (schema instanceof z.ZodEnum) {
    return `enum (${schema._def.values.join(", ")})`;
  }
  if (schema instanceof z.ZodNullable) {
    return `nullable ${getZodTypeName(schema._def.innerType)}`;
  }
  if (schema instanceof z.ZodOptional) {
    return `optional ${getZodTypeName(schema._def.innerType)}`;
  }

  return schema._def.typeName || "unknown";
}
