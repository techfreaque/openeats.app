import type { ApiEndpoint } from "next-query-portal/client/endpoint";

export interface ApiSection {
  [key: string]: ApiSection | ApiEndpoint<unknown, unknown, unknown>;
}

export enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}
export interface ExamplesList<T> {
  default: T & { id?: string };
  [exampleKey: string]: T & { id?: string };
}
