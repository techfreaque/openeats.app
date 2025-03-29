import { type VariantProps } from "class-variance-authority";
import type { CSSProperties } from "react";

import type { imageVariants } from "./image.core";

export interface BaseImageProps {
  source: { uri: string };
  className?: string | undefined;
  style?: CSSProperties | undefined;
  alt: string;
  width?: number | string | undefined;
  height?: number | string | undefined;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
}

export interface ImageProps
  extends BaseImageProps,
    VariantProps<typeof imageVariants> {}
