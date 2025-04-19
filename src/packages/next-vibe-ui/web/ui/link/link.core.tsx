// import { Link as NativeLink } from "./link.native";
import { Link as WebLink } from "./link.web";

export type { LinkProps } from "./link.types";

export const Link =
  // envClient.platform.isReactNative ? NativeLink :
  WebLink;
