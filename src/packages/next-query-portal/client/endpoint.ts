import type { z } from "zod";

import type { ApiSection, ExamplesList } from "../shared/types/endpoint";
import { Methods } from "../shared/types/endpoint";
import { UserRoleValue } from "../shared/types/enums";
import { format } from "../shared/utils/parse-error";
import { getApiConfig } from "./config";
import { envClient } from "./env-client";
import type { ApiQueryOptions } from "./hooks/types";

/**
 * API endpoint configuration
 */
export class ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey> {
  public description: string;
  public method: Methods;
  public path: string[];
  public apiQueryOptions: ApiQueryOptions;
  public allowedRoles: UserRoleValue[];
  public requestSchema: z.ZodType<TRequest>;
  public requestUrlSchema: z.ZodType<TUrlVariables>;
  public responseSchema: z.ZodType<TResponse>;
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
      : ExamplesList<TUrlVariables, TExampleKey>;
    payloads: TRequest extends undefined
      ? undefined
      : ExamplesList<TRequest, TExampleKey>;
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
    if (this.method === Methods.GET && requestData) {
      endpointUrl += `?${new URLSearchParams(requestData as Record<string, string>).toString()}`;
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
  TRequest,
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
  return endpoint as unknown as ApiEndpoint<
    TRequest,
    TResponse,
    TUrlVariables,
    TExampleKey
  >;
}
