export function parseError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  } else if (typeof error === "object" && error !== null) {
    return new Error(JSON.stringify(error));
  } else if (typeof error === "string") {
    return new Error(error);
  } else {
    return new Error(`Unknown error: ${error}`);
  }
}

export function format<T = Record<string, string>>(
  strings: string[],
  values: T,
): string[] {
  return strings.map((part) =>
    part.replace(
      /{(\w+)}/g,
      (_, key: string) => (values as Record<string, string>)[key] ?? "",
    ),
  );
}
