import type { FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Extended UseFormProps interface with proper typing
 */
export interface ExtendedUseFormProps<TRequest extends FieldValues>
  extends UseFormProps<TRequest> {
  defaultValues?: Partial<TRequest>;
}

/**
 * Extended UseFormReturn interface with proper typing
 */
export type ExtendedUseFormReturn<TRequest extends FieldValues> =
  UseFormReturn<TRequest>;

/**
 * Extended ZodResolver options
 */
export interface ZodResolverOptions<TRequest extends FieldValues> {
  schema: ZodType<TRequest>;
}
