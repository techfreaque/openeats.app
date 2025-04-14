import type { ApiEndpoint } from "../../client/endpoint";

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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  [exampleKey in TExampleKey]: T & { id?: string };
};
