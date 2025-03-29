// eslint-disable-next-line node/no-process-env
if (process.env.NODE_ENV !== "test") {
  void import("@/packages/next-vibe/server/utils/server-only");
}
export {};
