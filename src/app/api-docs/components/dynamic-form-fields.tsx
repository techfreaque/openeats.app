"use client";

import { Info } from "lucide-react";
import type { JSX } from "react";
import { useMemo } from "react";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "../../../components/ui";
import type { ApiEndpoint } from "../../../package";

interface DynamicFormFieldsProps {
  endpoint: ApiEndpoint<unknown, unknown, unknown>;
  register: UseFormRegister<any>;
  control: Control<any>;
  formState: { errors: FieldErrors };
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export function DynamicFormFields({
  endpoint,
  register,
  formState,
  watch,
}: DynamicFormFieldsProps): JSX.Element {
  const schema = useMemo(() => getFormSchema(endpoint), [endpoint]);
  const watchedValues = watch();
  const { errors } = formState;

  // Extract field metadata from schema
  const getSchemaFields = useMemo(() => {
    if (!schema) {
      return [];
    }

    // Try to extract fields from Zod schema
    try {
      // For object schemas, we can extract the shape
      if (schema.shape) {
        return Object.keys(schema.shape).map((key) => ({
          name: key,
          // Get field description from endpoint field descriptions
          description: endpoint.fieldDescriptions?.[key] || "",
          required: !schema.shape[key].isOptional?.(),
          type: getFieldType(schema.shape[key]),
          options: getEnumOptions(schema.shape[key]),
        }));
      }

      return [];
    } catch (e) {
      console.error("Error extracting schema fields", e);
      return [];
    }
  }, [schema, endpoint]);

  // Try to determine field type from Zod schema
  function getFieldType(fieldSchema: any): string {
    // Check for primitive types
    if (fieldSchema._def?.typeName === "ZodString") {
      return "string";
    }
    if (fieldSchema._def?.typeName === "ZodNumber") {
      return "number";
    }
    if (fieldSchema._def?.typeName === "ZodBoolean") {
      return "boolean";
    }
    if (fieldSchema._def?.typeName === "ZodEnum") {
      return "enum";
    }
    if (fieldSchema._def?.typeName === "ZodArray") {
      return "array";
    }
    if (fieldSchema._def?.typeName === "ZodObject") {
      return "object";
    }

    // For optional fields, check the underlying type
    if (
      fieldSchema._def?.typeName === "ZodOptional" &&
      fieldSchema._def?.innerType
    ) {
      return getFieldType(fieldSchema._def.innerType);
    }

    // Default to string if we can't determine
    return "string";
  }

  // Extract enum options if available
  function getEnumOptions(fieldSchema: any): string[] | null {
    if (fieldSchema._def?.typeName === "ZodEnum") {
      return fieldSchema._def.values || [];
    }

    // Handle optional enums
    if (
      fieldSchema._def?.typeName === "ZodOptional" &&
      fieldSchema._def?.innerType?._def?.typeName === "ZodEnum"
    ) {
      return fieldSchema._def.innerType._def.values || [];
    }

    return null;
  }

  // Render a field based on its type
  const renderField = (field: {
    name: string;
    description: string;
    required: boolean;
    type: string;
    options: string[] | null;
  }): JSX.Element => {
    const fieldValue = watchedValues[field.name];
    const fieldError = errors[field.name];

    return (
      <div key={field.name} className="mb-4">
        <div className="flex items-center space-x-2 mb-1">
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{field.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {field.type === "boolean" ? (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              {...register(field.name)}
              checked={!!fieldValue}
            />
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {fieldValue ? "Yes" : "No"}
            </label>
          </div>
        ) : field.type === "enum" && field.options ? (
          <Select {...register(field.name)} value={fieldValue || ""}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "object" ? (
          <Textarea
            id={field.name}
            {...register(field.name)}
            className="font-mono text-sm"
            placeholder={`{\n  "key": "value"\n}`}
            rows={4}
          />
        ) : field.type === "array" ? (
          <Textarea
            id={field.name}
            {...register(field.name)}
            className="font-mono text-sm"
            placeholder={`[\n  "item1",\n  "item2"\n]`}
            rows={4}
          />
        ) : (
          <Input
            id={field.name}
            type={field.type === "number" ? "number" : "text"}
            {...register(field.name)}
            placeholder={`Enter ${field.name}`}
          />
        )}

        {fieldError && (
          <p className="text-red-500 text-xs mt-1">
            {fieldError.message?.toString()}
          </p>
        )}
      </div>
    );
  };

  if (!schema) {
    return (
      <div className="text-center p-4 text-gray-500">
        No request schema defined for this endpoint.
      </div>
    );
  }

  // If there's an example, show a button to use it
  const hasExample = endpoint.examples?.payloads?.default;

  return (
    <div className="space-y-4">
      {hasExample && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="text-xs"
            onClick={() => {
              // Reset to example values
              if (endpoint.examples?.payloads?.default) {
                Object.entries(endpoint.examples.payloads.default).forEach(
                  ([key, value]) => {
                    document
                      .getElementById(key)
                      ?.dispatchEvent(new Event("input", { bubbles: true }));
                  },
                );
              }
            }}
          >
            Use Example Values
          </Button>
        </div>
      )}

      <form className="space-y-4">
        {getSchemaFields.length > 0 ? (
          getSchemaFields.map(renderField)
        ) : (
          <p className="text-center text-gray-500">
            No fields could be determined from the schema.
          </p>
        )}
      </form>
    </div>
  );
}
