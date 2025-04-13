/**
 * Integration utilities for connecting data factories with API definitions
 *
 * This module provides utilities for integrating the data factory system
 * with API endpoint definitions, making it easy to use the same data
 * for examples, tests, and database seeding.
 */

import type { ApiEndpoint } from "../../client/endpoint";
import { dataRepository } from "./repository";
import { DataVariation } from "./types";

/**
 * Generate example data for an API endpoint
 * @param entityName - Name of the entity in the data repository
 * @param variation - Variation of data to generate
 * @returns Function that generates example data for the endpoint
 */
export function createExampleGenerator<TRequest, TResponse, TUrlVariables>(
  entityName: string,
  variation: DataVariation = DataVariation.DEFAULT,
): {
  request: (overrides?: Partial<TRequest>) => TRequest;
  response: (overrides?: Partial<TResponse>) => TResponse;
  urlParams: (overrides?: Partial<TUrlVariables>) => TUrlVariables;
} {
  return {
    request: (overrides?: Partial<TRequest>): TRequest => {
      return dataRepository.create<TRequest>(entityName, variation, overrides);
    },
    response: (overrides?: Partial<TResponse>): TResponse => {
      return dataRepository.create<TResponse>(
        `${entityName}Response`,
        variation,
        overrides,
      );
    },
    urlParams: (overrides?: Partial<TUrlVariables>): TUrlVariables => {
      return dataRepository.create<TUrlVariables>(
        `${entityName}UrlParams`,
        variation,
        overrides,
      );
    },
  };
}

/**
 * Register examples for an API endpoint
 * @param endpoint - API endpoint
 * @param entityName - Name of the entity in the data repository
 */
export function registerEndpointExamples<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey extends string,
>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  entityName: string,
): void {
  // Get all examples from the endpoint
  const examples = endpoint.examples || {};

  // Register each example with the data repository
  Object.entries(examples).forEach(([key, exampleEntry]) => {
    const example = exampleEntry as {
      request?: TRequest;
      response?: TResponse;
      urlParams?: TUrlVariables;
    };
    
    if (example.request) {
      dataRepository.register(`${entityName}_${key}_request`, {
        create: () => example.request as TRequest,
        createMany: (count) => Array(count).fill(example.request as TRequest),
        getById: () => example.request as TRequest,
      });
    }

    if (example.response) {
      dataRepository.register(`${entityName}_${key}_response`, {
        create: () => example.response as TResponse,
        createMany: (count) => Array(count).fill(example.response as TResponse),
        getById: () => example.response as TResponse,
      });
    }

    if (example.urlParams) {
      dataRepository.register(`${entityName}_${key}_urlParams`, {
        create: () => example.urlParams as TUrlVariables,
        createMany: (count) =>
          Array(count).fill(example.urlParams as TUrlVariables),
        getById: () => example.urlParams as TUrlVariables,
      });
    }
  });
}

/**
 * Get example data from an API endpoint
 * @param endpoint - API endpoint
 * @param entityName - Name of the entity in the data repository
 * @param exampleKey - Key of the example to get
 * @returns Example data for the endpoint
 */
export function getEndpointExample<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey extends string,
>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  _entityName: string, // Unused parameter, prefixed with underscore
  exampleKey: TExampleKey,
): {
  request: TRequest;
  response: TResponse;
  urlParams: TUrlVariables;
} {
  const examples = endpoint.examples || {};
  
  const payloads = examples.payloads as Record<TExampleKey, TRequest> | undefined;
  const responses = examples.responses as Record<TExampleKey, TResponse> | undefined;
  const urlPathVariables = examples.urlPathVariables as Record<TExampleKey, TUrlVariables> | undefined;
  
  if (!payloads?.[exampleKey] && !responses?.[exampleKey] && !urlPathVariables?.[exampleKey]) {
    throw new Error(
      `Example "${String(exampleKey)}" not found for endpoint "${endpoint.path.join("/")}"`,
    );
  }

  return {
    request: payloads?.[exampleKey] as TRequest,
    response: responses?.[exampleKey] as TResponse,
    urlParams: urlPathVariables?.[exampleKey] as TUrlVariables,
  };
}
