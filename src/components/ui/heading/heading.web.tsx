import { cn } from "next-query-portal/shared";
import type {
  ForwardRefExoticComponent,
  HTMLAttributes,
  ReactElement,
  RefAttributes,
} from "react";
import { forwardRef } from "react";

import { headingVariants } from "./heading.core";
import type { HeadingProps } from "./heading.types";

// Base heading component factory
const createHeading = <T extends HTMLHeadingElement>(
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
): ForwardRefExoticComponent<
  HTMLAttributes<T> & HeadingProps & RefAttributes<T>
> => {
  const Component = forwardRef<T, HTMLAttributes<T> & HeadingProps>(
    ({ children, className, style, ...props }, ref): ReactElement => {
      const HeadingTag = tag;
      return (
        <HeadingTag
          ref={ref}
          className={cn(headingVariants[tag], className)}
          style={style}
          {...props}
        >
          {children}
        </HeadingTag>
      );
    },
  );

  Component.displayName = tag.toUpperCase();
  return Component;
};

// Create individual heading components
export const H1 = createHeading<HTMLHeadingElement>("h1");
export const H2 = createHeading<HTMLHeadingElement>("h2");
export const H3 = createHeading<HTMLHeadingElement>("h3");
export const H4 = createHeading<HTMLHeadingElement>("h4");
export const H5 = createHeading<HTMLHeadingElement>("h5");
export const H6 = createHeading<HTMLHeadingElement>("h6");
