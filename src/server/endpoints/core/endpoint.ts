import type { z } from "zod";

import type { ApiQueryOptions } from "../../../client/hooks/types";
import { envClient } from "../../../env/env-client";
import { UserRoleValue } from "../../../shared/types/enums";
import { format } from "../../../shared/utils/parse-error";
import { getApiConfig } from "../../config";

export interface ExamplesList<T> {
  default: T & { id: string };
  [exampleKey: string]: T & { id: string };
}

/**
 * API endpoint configuration
 */
export class ApiEndpoint<TRequest, TResponse, TUrlVariables> {
  public description: string;
  public method: string;
  public path: string[];
  public apiQueryOptions: ApiQueryOptions;
  public allowedRoles: UserRoleValue[];
  public requestSchema: z.ZodType<TRequest>;
  public requestUrlSchema: z.ZodType<TUrlVariables>;
  public responseSchema: z.ZodType<TResponse, z.ZodTypeDef, TResponse>;
  public fieldDescriptions: TRequest extends undefined
    ? TUrlVariables extends undefined
      ? undefined
      : Record<keyof TUrlVariables, string>
    : TUrlVariables extends undefined
      ? Record<keyof TRequest, string>
      : Record<keyof TRequest, string> & Record<keyof TUrlVariables, string>;

  public errorCodes: Record<string, string> & { 500: string };
  public examples: {
    urlPathVariables: TUrlVariables extends undefined
      ? undefined
      : ExamplesList<z.ZodType<TUrlVariables>>;
    payloads: TRequest extends undefined ? undefined : ExamplesList<TRequest>;
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
    ApiEndpoint<TRequest, TResponse, TUrlVariables>,
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

  public requiresAuthentication(): boolean {
    return !this.allowedRoles.includes(UserRoleValue.PUBLIC);
  }

  public getRequestData({
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
    if (requestData && this.requestSchema) {
      const validation = this.requestSchema.safeParse(requestData);
      if (!validation.success) {
        return {
          success: false,
          message: `Request validation error: ${validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        };
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

    const path = pathParams
      ? format<TUrlVariables>(this.path, pathParams)
      : this.path;
    let endpointUrl = `${envClient.NEXT_PUBLIC_BACKEND_URL}/${path.join("/")}`;
    if (this.method === "GET" && requestData) {
      endpointUrl += `?${new URLSearchParams(requestData as Record<string, string>).toString()}`;
    }
    return {
      success: true,
      postBody: this.method === "GET" ? undefined : JSON.stringify(requestData),
      endpointUrl,
    };
  }
}

export type Methods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type ApiEndpoints = {
  [method in Methods]?: ApiEndpoint<unknown, unknown, unknown>;
};

export interface ApiSection {
  [key: string]: ApiSection | ApiEndpoint<unknown, unknown, unknown>;
}

export function createEndpoint<TRequest, TResponse, TUrlVariables>(
  endpoint: Omit<
    ApiEndpoint<TRequest, TResponse, TUrlVariables>,
    "getRequestData" | "requiresAuthentication"
  >,
): ApiEndpoint<TRequest, TResponse, TUrlVariables> {
  return new ApiEndpoint<TRequest, TResponse, TUrlVariables>(endpoint);
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
