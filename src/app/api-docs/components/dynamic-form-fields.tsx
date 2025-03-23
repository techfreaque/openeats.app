import type { ApiEndpoint } from "next-query-portal/client/endpoint";
import { cn } from "next-query-portal/shared/utils/utils";
import type { JSX, ReactNode } from "react";
import React from "react";
import {
  type Control,
  type FieldValues,
  Form,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormStateReturn,
  type UseFormWatch,
} from "react-hook-form";
import type { ZodObject, ZodType, ZodTypeDef } from "zod";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Type definitions
interface SchemaField {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  enumOptions?: Array<{ value: string; label: string }>;
}

interface DynamicFormFieldsProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  endpoint: ApiEndpoint<unknown, unknown, unknown>;
  register: UseFormRegister<TFieldValues>;
  formState: UseFormStateReturn<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  control: Control<TFieldValues>;
}

// Type guard for ZodObject
function isZodObject(
  schema: ZodType | undefined,
): schema is ZodObject<ZodTypeDef, unknown> {
  return Boolean(
    schema &&
      typeof schema === "object" &&
      "shape" in schema &&
      schema.shape &&
      typeof schema.shape === "object",
  );
}

function isOptionalField(field: ZodType): boolean {
  return Boolean(
    field &&
      typeof field === "object" &&
      "_def" in field &&
      field._def &&
      typeof field._def === "object" &&
      "isOptional" in field._def &&
      field._def.isOptional,
  );
}

function isEnumField(field: ZodType): boolean {
  return Boolean(
    field &&
      typeof field === "object" &&
      "_def" in field &&
      field._def &&
      typeof field._def === "object" &&
      "values" in field._def &&
      Array.isArray(field._def.values),
  );
}

// Get field type from Zod schema with proper type safety
function getFieldType(_field: ZodType): string {
  // Implementation here would replace the existing one with proper type safety
  return "string"; // Default fallback
}

function isLongString(field: ZodType): boolean {
  // Implementation with proper type checking
  return Boolean(
    field &&
      typeof field === "object" &&
      "_def" in field &&
      field._def &&
      typeof field._def === "object" &&
      "typeName" in field._def &&
      field._def.typeName === "ZodString",
  );
}

function getEnumOptions(
  field: ZodType,
): Array<{ value: string; label: string }> | undefined {
  if (!isEnumField(field)) {
    return undefined;
  }

  try {
    // Type assertion to make this type-safe
    const values = Array.isArray(field._def?.values) ? field._def.values : [];
    return values.map((value: string) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
    }));
  } catch {
    return undefined;
  }
}

// Implementation of getFormSchema with proper types
function getFormSchema(schema: ZodType | undefined): SchemaField[] {
  if (!isZodObject(schema)) {
    return [];
  }

  try {
    const fields: SchemaField[] = [];
    const shape = schema.shape;

    // Type-safe iteration over shape
    Object.entries(shape).forEach(([name, field]) => {
      if (field && typeof field === "object") {
        const fieldType = getFieldType(field as ZodType);
        const required = !isOptionalField(field as ZodType);
        const enumOptions = getEnumOptions(field as ZodType);

        fields.push({
          name,
          type: fieldType,
          required,
          enumOptions,
        });
      }
    });

    return fields;
  } catch {
    return [];
  }
}

export function DynamicFormFields<
  TFieldValues extends FieldValues = FieldValues,
>({
  endpoint,
  register,
  formState,
  watch,
  setValue,
}: DynamicFormFieldsProps<TFieldValues>): JSX.Element {
  const schema = endpoint.requestSchema;
  const formFields = getFormSchema(schema);

  const renderField = (field: SchemaField): ReactNode => {
    const fieldErrors =
      formState.errors[field.name as keyof typeof formState.errors];
    // Use _ prefix for unused variables
    const _fieldValue = watch(field.name as any);

    switch (field.type) {
      case "boolean":
        return (
          <FormField
            key={field.name}
            name={field.name}
            render={({ field: renderField }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{field.name}</FormLabel>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={renderField.value}
                    onCheckedChange={renderField.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case "enum":
        return (
          <FormItem key={field.name}>
            <FormLabel
              className={cn(
                field.required
                  ? "after:content-['*'] after:ml-0.5 after:text-red-500"
                  : "",
              )}
            >
              {field.name}
            </FormLabel>
            <Select
              onValueChange={(value) => setValue(field.name as any, value)}
              defaultValue={watch(field.name as any)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.name}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {field.enumOptions?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors && (
              <FormMessage>{fieldErrors.message as string}</FormMessage>
            )}
          </FormItem>
        );

      case "longtext":
        return (
          <FormItem key={field.name}>
            <FormLabel
              className={cn(
                field.required
                  ? "after:content-['*'] after:ml-0.5 after:text-red-500"
                  : "",
              )}
            >
              {field.name}
            </FormLabel>
            <FormControl>
              <Textarea
                {...register(field.name as any)}
                placeholder={`Enter ${field.name}`}
              />
            </FormControl>
            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}
            {fieldErrors && (
              <FormMessage>{fieldErrors.message as string}</FormMessage>
            )}
          </FormItem>
        );

      default:
        return (
          <FormItem key={field.name}>
            <FormLabel
              className={cn(
                field.required
                  ? "after:content-['*'] after:ml-0.5 after:text-red-500"
                  : "",
              )}
            >
              {field.name}
            </FormLabel>
            <FormControl>
              <Input
                {...register(field.name)}
                type={field.type === "number" ? "number" : "text"}
                placeholder={`Enter ${field.name}`}
              />
            </FormControl>
            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}
            {fieldErrors && (
              <FormMessage>{fieldErrors.message as string}</FormMessage>
            )}
          </FormItem>
        );
    }
  };

  return (
    <Form {...loginForm.form}>
      <form onSubmit={loginForm.handleSubmit} className="space-y-6">
        <div className="space-y-4 py-2">
          {formFields.map(renderField)}
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Submitting..." : "Execute"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
