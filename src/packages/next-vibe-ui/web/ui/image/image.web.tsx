import { cn } from "next-vibe/shared/utils/utils";
import type { ImgHTMLAttributes, ReactElement } from "react";
import { forwardRef } from "react";

import { imageVariants } from "./image.core";
import type { BaseImageProps } from "./image.types";

export interface WebImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "alt">,
    BaseImageProps {
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  fit?: "cover" | "contain" | "fill" | "none" | "scaleDown";
}

export const Image = forwardRef<HTMLImageElement, WebImageProps>(
  (
    {
      src,
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
      // eslint-disable-next-line @next/next/no-img-element
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
