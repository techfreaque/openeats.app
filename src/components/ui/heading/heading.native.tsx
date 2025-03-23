import { cn } from "next-query-portal/shared/utils/utils";
import type { ElementRef, ReactElement } from "react";
import { forwardRef } from "react";
import type { TextProps as RNTextProps } from "react-native";
import { Text } from "react-native";

import { headingVariants } from "./heading.core";
import type { HeadingProps } from "./heading.types";

// Base heading component factory
const createHeading = (level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
  const Component = forwardRef<
    ElementRef<typeof Text>,
    RNTextProps & HeadingProps
  >(({ children, className, style, ...props }, ref): ReactElement => {
    return (
      <Text
        ref={ref}
        className={cn(headingVariants[level], className)}
        style={style}
        {...props}
      >
        {children}
      </Text>
    );
  });

  Component.displayName = level.toUpperCase();
  return Component;
};

// Create individual heading components
export const H1 = createHeading("h1");
export const H2 = createHeading("h2");
export const H3 = createHeading("h3");
export const H4 = createHeading("h4");
export const H5 = createHeading("h5");
export const H6 = createHeading("h6");
