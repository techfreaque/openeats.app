// Import notification factories
import notificationFactories from "next-vibe/testing/data/factories/notification";
import { getEndpointExample } from "next-vibe/testing/data/integration";
import { DataVariation } from "next-vibe/testing/data/types";
import { beforeEach, describe, expect, it } from "vitest";

// Import notification API definition
import notificationDefinitions from "./definition";

describe("Notification API", () => {
  beforeEach(() => {
    // Reset any mocks or state before each test
  });

  describe("Notification Subscribe Endpoint", () => {
    it("should validate request data correctly", () => {
      // Get example data from the factory
      const subscribeRequest =
        notificationFactories.notificationSubscribeRequest.create();

      // Validate the request using the endpoint schema
      const validation =
        notificationDefinitions.SUBSCRIBE.requestSchema.safeParse(
          subscribeRequest,
        );

      // Assert that validation passes
      expect(validation.success).toBe(true);
    });

    it("should handle invalid request data", () => {
      // Create invalid request data
      const invalidRequest = {
        // Missing required fields
      };

      // Validate the request using the endpoint schema
      const validation =
        notificationDefinitions.SUBSCRIBE.requestSchema.safeParse(
          invalidRequest,
        );

      // Assert that validation fails
      expect(validation.success).toBe(false);
    });

    it("should match example data in API definition", () => {
      // Get example data from the endpoint definition
      const endpointExample = getEndpointExample(
        notificationDefinitions.SUBSCRIBE,
        "notification",
        "default",
      );

      // Get example data from the factory
      const factoryExample = {
        request: notificationFactories.notificationSubscribeRequest.create(),
        response: notificationFactories.notificationSubscribeResponse.create(),
      };

      // Assert that the examples match the schema
      const requestValidation =
        notificationDefinitions.SUBSCRIBE.requestSchema.safeParse(
          endpointExample.request,
        );
      const responseValidation =
        notificationDefinitions.SUBSCRIBE.responseSchema.safeParse(
          endpointExample.response,
        );

      expect(requestValidation.success).toBe(true);
      expect(responseValidation.success).toBe(true);

      // Assert that factory examples match the schema
      const factoryRequestValidation =
        notificationDefinitions.SUBSCRIBE.requestSchema.safeParse(
          factoryExample.request,
        );
      const factoryResponseValidation =
        notificationDefinitions.SUBSCRIBE.responseSchema.safeParse(
          factoryExample.response,
        );

      expect(factoryRequestValidation.success).toBe(true);
      expect(factoryResponseValidation.success).toBe(true);
    });
  });

  describe("Notification Send Endpoint", () => {
    it("should validate request data correctly", () => {
      // Get example data from the factory
      const sendRequest =
        notificationFactories.notificationSendRequest.create();

      // Validate the request using the endpoint schema
      const validation =
        notificationDefinitions.SEND.requestSchema.safeParse(sendRequest);

      // Assert that validation passes
      expect(validation.success).toBe(true);
    });

    it("should handle different variations of request data", () => {
      // Get minimal variation
      const minimalRequest =
        notificationFactories.notificationSendRequest.create(
          DataVariation.MINIMAL,
        );

      // Get complete variation
      const completeRequest =
        notificationFactories.notificationSendRequest.create(
          DataVariation.COMPLETE,
        );

      // Validate both variations
      const minimalValidation =
        notificationDefinitions.SEND.requestSchema.safeParse(minimalRequest);
      const completeValidation =
        notificationDefinitions.SEND.requestSchema.safeParse(completeRequest);

      // Assert that both validations pass
      expect(minimalValidation.success).toBe(true);
      expect(completeValidation.success).toBe(true);
    });
  });

  describe("Get Connections Endpoint", () => {
    it("should validate response data correctly", () => {
      // Get example data from the factory
      const connectionsResponse =
        notificationFactories.getConnectionsResponse.create();

      // Validate the response using the endpoint schema
      const validation =
        notificationDefinitions.GET_CONNECTIONS.responseSchema.safeParse(
          connectionsResponse,
        );

      // Assert that validation passes
      expect(validation.success).toBe(true);
    });

    it("should handle empty connections list", () => {
      // Get minimal variation with empty connections list
      const emptyResponse = notificationFactories.getConnectionsResponse.create(
        DataVariation.MINIMAL,
      );

      // Validate the response
      const validation =
        notificationDefinitions.GET_CONNECTIONS.responseSchema.safeParse(
          emptyResponse,
        );

      // Assert that validation passes
      expect(validation.success).toBe(true);
      expect(emptyResponse.connections.length).toBe(0);
    });
  });
});
