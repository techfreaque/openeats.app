import { cn } from "next-query-portal/shared/utils/utils";
import type { ImgHTMLAttributes, ReactElement } from "react";
import { forwardRef } from "react";

import { imageVariants } from "./image.core";
import type { BaseImageProps } from "./image.types";

export interface WebImageProps
  extends ImgHTMLAttributes<HTMLImageElement>,
    BaseImageProps {
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  fit?: "cover" | "contain" | "fill" | "none" | "scaleDown";
}

export const Image = forwardRef<HTMLImageElement, WebImageProps>(
  (
    {
      source,
      className,
      style,
      alt = "",
      width,
      height,
      resizeMode,
      rounded,
      fit,
      ...props
    },
    ref,
  ): ReactElement => {
    // Handle both { uri: string } format and direct require() format
    const src = typeof source === "number" ? source : source.uri;

    // Convert resizeMode to fit if specified
    const mappedFit = resizeMode
      ? resizeMode === "cover"
        ? "cover"
        : resizeMode === "contain"
          ? "contain"
          : resizeMode === "stretch"
            ? "fill"
            : "cover"
      : fit;

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn(imageVariants({ rounded, fit: mappedFit, className }))}
        style={{
          width: width,
          height: height,
          ...style,
        }}
        {...props}
      />
    );
  },
);

Image.displayName = "Image";
