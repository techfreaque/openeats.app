import { type VariantProps } from "class-variance-authority";

import type { imageVariants } from "./image.core";

export interface BaseImageProps {
  source: { uri: string } | number;
  className?: string;
  style?: Record<string, string | number>;
  alt?: string;
  width?: number | string;
  height?: number | string;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
}

export interface ImageProps
  extends BaseImageProps,
    VariantProps<typeof imageVariants> {}
