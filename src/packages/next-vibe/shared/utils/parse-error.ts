export function parseError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  } else if (typeof error === "object" && error !== null) {
    return new Error(JSON.stringify(error));
  } else if (typeof error === "string") {
    return new Error(error);
  } else if (error === undefined) {
    return new Error("No error details available");
  } else {
    return new Error(`Unknown error: ${String(error)}`);
  }
}

export function format<
  T extends Record<string, string | number | boolean | null>,
>(strings: string[], values: T): string[] {
  return strings.map((part) =>
    part.replace(/{(\w+)}/g, (_, key: string) => {
      const value = values[key];
      return value !== undefined && value !== null ? String(value) : "";
    }),
  );
}
