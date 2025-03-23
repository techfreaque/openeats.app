// import { Icon as NativeIcon } from "./icon.native";
import { Icon as WebIcon } from "./icon.web";

export type { IconProps } from "./icon.types";

export const Icon =
  // envClient.platform.isReactNative ? NativeIcon :
  WebIcon;
