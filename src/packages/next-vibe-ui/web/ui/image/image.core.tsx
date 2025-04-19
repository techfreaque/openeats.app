import { cva, type VariantProps } from "class-variance-authority";

// import { Image as NativeImage } from "./image.native";
import { Image as WebImage } from "./image.web";

export type { ImageProps } from "./image.types";

export const imageVariants = cva("", {
  variants: {
    rounded: {
      none: "",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    },
    fit: {
      cover: "object-cover",
      contain: "object-contain",
      fill: "object-fill",
      none: "object-none",
      scaleDown: "object-scale-down",
    },
  },
  defaultVariants: {
    rounded: "none",
    fit: "cover",
  },
});

export type ImageVariantProps = VariantProps<typeof imageVariants>;

export const Image =
  // envClient.platform.isReactNative ? NativeImage :
  WebImage;
