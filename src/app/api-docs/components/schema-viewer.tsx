"use client";

import type { ApiEndpoint } from "next-vibe/client/endpoint";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "next-vibe-ui/ui";
import type { JSX } from "react";
import React from "react";
import type { ZodType } from "zod";

interface SchemaViewerProps {
  endpoint: ApiEndpoint<unknown, unknown, unknown, unknown>;
  title?: string;
}

// Type to represent schema field info
interface SchemaFieldInfo {
  name: string;
  type: string;
  required: boolean;
}

// Get schema field type
function getSchemaFieldType(field: ZodType): string {
  if (!field || typeof field !== "object" || !("_def" in field)) {
    return "unknown";
  }

  try {
    if (
      field._def &&
      typeof field._def === "object" &&
      "typeName" in field._def
    ) {
      const typeName = field._def.typeName as string;
      switch (typeName) {
        case "ZodString":
          return "string";
        case "ZodNumber":
          return "number";
        case "ZodBoolean":
          return "boolean";
        case "ZodArray":
          return "array";
        case "ZodObject":
          return "object";
        case "ZodEnum":
          return "enum";
        case "ZodDate":
          return "date";
        case "ZodOptional":
          // Handle optional wrapper
          if (field._def.typeName && typeof field._def.typeName === "object") {
            return getSchemaFieldType(field._def.typeName as ZodType);
          }
          return "unknown";
        default:
          // Type-safe string operations
          if (typeof typeName === "string") {
            return typeName.replace("Zod", "").toLowerCase() || "unknown";
          }
          return "unknown";
      }
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}

// Function to extract schema fields with type safety
function extractSchemaFields(schema: ZodType | undefined): SchemaFieldInfo[] {
  if (!schema || typeof schema !== "object" || !("shape" in schema)) {
    return [];
  }

  try {
    const fields: SchemaFieldInfo[] = [];
    const shape = (schema as { shape: Record<string, ZodType> }).shape;

    // Type-safe iteration over shape
    Object.entries(shape).forEach(([name, field]) => {
      if (field && typeof field === "object") {
        const isRequired =
          !("_def" in field) ||
          !field._def ||
          !("isOptional" in field._def) ||
          !field._def.isOptional;

        fields.push({
          name,
          type: getSchemaFieldType(field),
          required: isRequired,
        });
      }
    });

    return fields;
  } catch {
    return [];
  }
}

export function SchemaViewer({
  endpoint,
  title = "Schema",
}: SchemaViewerProps): JSX.Element {
  const schema = endpoint.requestSchema;
  const fields = extractSchemaFields(schema);

  if (!fields.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No schema available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          The following fields are available for this API endpoint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-semibold">{field.name}</span>
                  {field.required && (
                    <span className="ml-1 text-xs text-red-500">*</span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {field.type}
                </span>
              </div>
              <Separator className="mt-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
