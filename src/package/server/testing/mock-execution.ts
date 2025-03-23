import type { ApiEndpoint } from "../../client";
import type {
  ApiHandlerCallBackFunctionType,
  JwtPayloadType,
  SafeReturnType,
} from "../endpoints";
import { setDataProvider } from "../endpoints";
import { TestDataProvider } from "./test-data-provider";
import type { MockTestData } from "./types";

/**
 * Execute an API handler directly with mock data
 */
export async function mockExecute<TRequest, TResponse, TUrlVariables>({
  endpoint,
  handler,
  data,
  urlParams,
  user = { id: "admin" },
  mockData = {},
}: {
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>;
  handler: ApiHandlerCallBackFunctionType<TRequest, TResponse, TUrlVariables>;
  data?: TRequest;
  urlParams?: TUrlVariables;
  user?: JwtPayloadType;
  mockData?: MockTestData;
}): Promise<SafeReturnType<TResponse> & { status?: number }> {
  try {
    // Set up mock data provider
    const dataProvider = new TestDataProvider(mockData);
    setDataProvider(dataProvider);

    // Validate request data if schema is provided
    if (data && endpoint.requestSchema) {
      const validation = endpoint.requestSchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          errorCode: 400,
          message: `Request validation error: ${validation.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`,
        };
      }
    }

    // Validate URL params if schema is provided
    if (urlParams && endpoint.requestUrlSchema) {
      const validation = endpoint.requestUrlSchema.safeParse(urlParams);
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          errorCode: 400,
          message: `URL parameter validation error: ${validation.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`,
        };
      }
    }

    // Call the handler directly
    const result = await handler({
      data: data as TRequest,
      urlVariables: urlParams as TUrlVariables,
      user,
    });

    return {
      ...result,
      status: result.success ? 200 : result.errorCode || 400,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      errorCode: 500,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
