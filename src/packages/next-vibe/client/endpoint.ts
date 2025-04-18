import type { FieldValues } from "react-hook-form";
import type { z } from "zod";

import type { ApiSection, ExamplesList } from "../shared/types/endpoint";
import { Methods } from "../shared/types/endpoint";
import { UserRoleValue } from "../shared/types/enums";
import { getApiConfig } from "./config";
import { envClient } from "./env-client";
import type { ApiQueryOptions } from "./hooks/types";

/**
 * API endpoint configuration
 */
export class ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey> {
  description: string;
  method: Methods;
  path: string[];
  apiQueryOptions: ApiQueryOptions;
  allowedRoles: UserRoleValue[];
  requestSchema: z.ZodType<TRequest>;
  requestUrlSchema: z.ZodType<TUrlVariables>;
  responseSchema: z.ZodType<TResponse>;
  fieldDescriptions: TRequest extends undefined
    ? TUrlVariables extends undefined
      ? undefined
      : Record<keyof TUrlVariables, string>
    : TUrlVariables extends undefined
      ? Record<keyof TRequest, string>
      : Record<keyof TRequest, string> & Record<keyof TUrlVariables, string>;

  errorCodes: Record<string, string> & { 500: string };
  examples: {
    urlPathVariables: TUrlVariables extends undefined
      ? undefined
      : ExamplesList<TUrlVariables, TExampleKey>;
    payloads: TRequest extends undefined
      ? undefined
      : ExamplesList<TRequest, TExampleKey>;
    responses: TResponse extends undefined
      ? undefined
      : ExamplesList<TResponse, TExampleKey>;
  };

  constructor({
    description,
    method,
    path,
    apiQueryOptions,
    allowedRoles,
    requestSchema,
    responseSchema,
    requestUrlSchema,
    fieldDescriptions,
    errorCodes,
    examples,
  }: Omit<
    ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
    "getRequestData" | "requiresAuthentication"
  >) {
    this.description = description;
    this.method = method;
    this.path = ["api", ...path];
    this.allowedRoles = allowedRoles;
    this.requestSchema = requestSchema;
    this.requestUrlSchema = requestUrlSchema;
    this.responseSchema = responseSchema;
    this.fieldDescriptions = fieldDescriptions;
    this.errorCodes = errorCodes;
    this.examples = examples;

    const config = getApiConfig();
    this.apiQueryOptions = {
      staleTime: config.defaultStaleTime,
      cacheTime: config.defaultCacheTime,
      refetchOnWindowFocus: config.defaultRefetchOnWindowFocus,
      ...apiQueryOptions,
    };
  }

  requiresAuthentication(): boolean {
    return !this.allowedRoles.includes(UserRoleValue.PUBLIC);
  }

  getRequestData({
    requestData,
    pathParams,
  }: {
    requestData?: TRequest;
    pathParams?: TUrlVariables;
  }):
    | {
        success: true;
        message?: never;
        endpointUrl: string;
        postBody: string | undefined;
      }
    | {
        success: false;
        message: string;
        endpointUrl?: never;
        postBody?: never;
      } {
    // Validate request data if schema is provided
    if (this.requestSchema) {
      // Handle undefined values properly for GET requests
      if (requestData === undefined && this.method === Methods.GET) {
        // For GET requests, undefined is valid
        const pathStr = this.path.join("/");
        const endpointUrl = `${envClient.NEXT_PUBLIC_BACKEND_URL}/${pathStr}`;
        return { success: true, endpointUrl, postBody: undefined };
      }

      // Only validate if requestData is provided
      if (requestData) {
        const validation = this.requestSchema.safeParse(requestData);
        if (!validation.success) {
          return {
            success: false,
            message: `Request validation error: ${validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
          };
        }
      }
    }

    // Validate URL path parameters if schema is provided
    if (pathParams && this.requestUrlSchema) {
      const validation = this.requestUrlSchema.safeParse(pathParams);
      if (!validation.success) {
        return {
          success: false,
          message: `URL parameter validation error: ${validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        };
      }
    }

    // Create a safe path string
    let pathStr: string;
    if (pathParams) {
      // Format the path with the parameters
      const pathParts = this.path.map((part) => {
        if (part.startsWith(":") && pathParams) {
          const paramName = part.substring(1);
          const paramValue = pathParams[paramName as keyof TUrlVariables];
          return paramValue !== null && paramValue !== undefined
            ? String(paramValue)
            : part;
        }
        return part;
      });
      pathStr = pathParts.join("/");
    } else {
      pathStr = this.path.join("/");
    }

    // Create the endpoint URL
    let endpointUrl = `${envClient.NEXT_PUBLIC_BACKEND_URL}/${pathStr}`;

    // Add query parameters for GET requests
    if (this.method === Methods.GET && requestData) {
      // Convert requestData to a safe format for URLSearchParams
      const params: Record<string, string> = {};
      Object.entries(requestData as Record<string, unknown>).forEach(
        ([key, value]) => {
          if (value !== null && value !== undefined) {
            // Handle different types of values
            params[key] =
              typeof value === "object" ? JSON.stringify(value) : String(value);
          }
        },
      );
      endpointUrl += `?${new URLSearchParams(params).toString()}`;
    }
    return {
      success: true,
      postBody:
        this.method === Methods.GET ? undefined : JSON.stringify(requestData),
      endpointUrl,
    };
  }
}

export type CreateEndpointReturn<
  TRequest,
  TResponse,
  TUrlVariables,
  TMethods extends Methods,
  TExampleKey,
> = {
  [method in TMethods]: ApiEndpoint<
    TRequest,
    TResponse,
    TUrlVariables,
    TExampleKey
  >;
};

export function createEndpoint<
  TRequest,
  TResponse,
  TUrlVariables,
  TMethods extends Methods,
  TExampleKey,
>(
  endpoint: Omit<
    ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
    "getRequestData" | "requiresAuthentication" | "method"
  > & { method: TMethods },
): CreateEndpointReturn<
  TRequest,
  TResponse,
  TUrlVariables,
  TMethods,
  TExampleKey
> {
  return {
    [endpoint.method]: new ApiEndpoint<
      TRequest,
      TResponse,
      TUrlVariables,
      TExampleKey
    >(endpoint),
  } as CreateEndpointReturn<
    TRequest,
    TResponse,
    TUrlVariables,
    TMethods,
    TExampleKey
  >;
}

/**
 * Get example endpoint for a specific path
 */
export function getEndpointByPath<
  TRequest extends FieldValues,
  TResponse,
  TUrlVariables,
  TExampleKey extends string,
>(
  path: string[],
  method: Methods,
  endpoints: ApiSection,
): ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey> {
  const _method = method.toUpperCase() as Methods;
  const _path = [...path, _method];
  let endpoint: ApiSection = endpoints;
  for (const p of _path) {
    endpoint = endpoint[p] as ApiSection;
  }
  return endpoint as ApiEndpoint<
    TRequest,
    TResponse,
    TUrlVariables,
    TExampleKey
  >;
}
