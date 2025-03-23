import { cn } from "next-query-portal/shared/utils/utils";
import type { ElementRef, ReactElement } from "react";
import { forwardRef } from "react";
import {
  Image as RNImage,
  type ImageProps as RNImageProps,
} from "react-native";

import { imageVariants } from "./image.core";
import type { BaseImageProps } from "./image.types";

export interface NativeImageProps extends RNImageProps, BaseImageProps {
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  fit?: "cover" | "contain" | "fill" | "none" | "scaleDown";
}

export const Image = forwardRef<ElementRef<typeof RNImage>, NativeImageProps>(
  (
    {
      source,
      className,
      style,
      width,
      height,
      resizeMode,
      rounded,
      fit,
      ...props
    },
    ref,
  ): ReactElement => {
    // Map fit to resizeMode if not specified
    const mappedResizeMode =
      resizeMode ||
      (fit === "cover"
        ? "cover"
        : fit === "contain"
          ? "contain"
          : fit === "fill"
            ? "stretch"
            : "cover");

    return (
      <RNImage
        ref={ref}
        source={source}
        className={cn(imageVariants({ rounded, className }))}
        resizeMode={mappedResizeMode}
        style={[{ width, height }, style]}
        {...props}
      />
    );
  },
);

Image.displayName = "Image";
