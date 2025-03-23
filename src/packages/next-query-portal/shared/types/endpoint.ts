import type { ApiEndpoint } from "next-query-portal/client/endpoint";

export interface ApiSection {
  [key: string]: ApiSection | ApiEndpoint<unknown, unknown, unknown>;
}

export type Methods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ExamplesList<T> {
  default: T & { id?: string };
  [exampleKey: string]: T & { id?: string };
}
