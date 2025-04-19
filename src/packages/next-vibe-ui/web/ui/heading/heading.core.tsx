// import {
//   H1 as NativeH1,
//   H2 as NativeH2,
//   H3 as NativeH3,
//   H4 as NativeH4,
//   H5 as NativeH5,
//   H6 as NativeH6,
// } from "./heading.native";
import {
  H1 as WebH1,
  H2 as WebH2,
  H3 as WebH3,
  H4 as WebH4,
  H5 as WebH5,
  H6 as WebH6,
} from "./heading.web";

export type { HeadingProps } from "./heading.types";

export const headingVariants = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
  h3: "mt-8 scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  h5: "scroll-m-20 text-lg font-semibold tracking-tight",
  h6: "scroll-m-20 text-base font-semibold tracking-tight",
};

export const H1 =
  // envClient.platform.isReactNative ? NativeH1 :
  WebH1;
export const H2 =
  // envClient.platform.isReactNative ? NativeH2 :
  WebH2;
export const H3 =
  // envClient.platform.isReactNative ? NativeH3 :
  WebH3;
export const H4 =
  // envClient.platform.isReactNative ? NativeH4 :
  WebH4;
export const H5 =
  // envClient.platform.isReactNative ? NativeH5 :
  WebH5;
export const H6 =
  // envClient.platform.isReactNative ? NativeH6 :
  WebH6;
