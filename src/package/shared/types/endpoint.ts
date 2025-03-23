import type { ApiEndpoint } from "../../client";

export type ApiEndpoints = {
  [method in Methods]?: ApiEndpoint<unknown, unknown, unknown>;
};

export interface ApiSection {
  [key: string]: ApiSection | ApiEndpoint<unknown, unknown, unknown>;
}

export type Methods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ExamplesList<T> {
  default: T & { id?: string };
  [exampleKey: string]: T & { id?: string };
}
