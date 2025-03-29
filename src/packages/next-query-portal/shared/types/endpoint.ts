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
export type ExamplesList<TRequest, TKey extends string = string> = {
  [exampleKey in TKey]: TRequest & { id?: string | undefined };
} & {
  default: TRequest & { id?: string | undefined };
};
