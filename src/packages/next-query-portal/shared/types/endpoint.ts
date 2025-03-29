import type { ApiEndpoint } from "next-query-portal/client/endpoint";

export interface ApiSection {
  [key: string]: ApiSection | ApiEndpoint<unknown, unknown, unknown, unknown>;
}

export enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}
export type ExamplesList<T, TExampleKey> = {
  [exampleKey in TExampleKey]: T & { id?: string };
  // default: T & { id?: string };
  // [exampleKey in TExampleKey]: T & { id?: string };
};
