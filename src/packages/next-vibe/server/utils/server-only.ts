// eslint-disable-next-line node/no-process-env
if (process.env.NODE_ENV !== "test") {
  void import("server-only");
}
export {};
