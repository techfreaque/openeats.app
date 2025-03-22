import { APP_NAME } from "../../constants";
import { envClient } from "../../env/env-client";
import { parseError } from "./parse-error";

export function debugLogger(message: string, ...other: unknown[]): void {
  if (
    envClient.NEXT_PUBLIC_NODE_ENV === "development" ||
    envClient.NEXT_PUBLIC_NODE_ENV === "test"
  ) {
    // eslint-disable-next-line no-console
    console.log(`[${APP_NAME}][DEBUG] ${message}`, ...other);
  }
}

export function errorLogger(
  message: string,
  error?: unknown,
  ...other: unknown[]
): void {
  const typedError = parseError(error);
  if (
    envClient.NEXT_PUBLIC_NODE_ENV === "development" ||
    envClient.NEXT_PUBLIC_NODE_ENV === "test"
  ) {
    // eslint-disable-next-line no-console
    console.error(`[${APP_NAME}][ERROR] ${message}`, typedError, ...other);
  } else {
    // TODO
    // eslint-disable-next-line no-console
    console.error(`[${APP_NAME}][ERROR] ${message}`, typedError, ...other);
  }
}
