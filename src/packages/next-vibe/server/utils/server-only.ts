import { env } from "../env";

if (env.NODE_ENV !== "test") {
  void import("server-only");
}
export {};
