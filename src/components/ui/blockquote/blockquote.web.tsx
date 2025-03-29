import { cn } from "next-query-portal/shared/utils/utils";
import type { BlockquoteHTMLAttributes, ReactElement } from "react";
import { forwardRef } from "react";

import { blockquoteVariants } from "./blockquote.core";
import type { BaseBlockquoteProps } from "./blockquote.types";

export interface WebBlockquoteProps
  extends BlockquoteHTMLAttributes<HTMLQuoteElement>,
    Omit<BaseBlockquoteProps, "style" | "className"> {
  variant?: "default" | "primary" | "secondary" | "accent";
}

export const Blockquote = forwardRef<HTMLQuoteElement, WebBlockquoteProps>(
  ({ children, className, style, variant, ...props }, ref): ReactElement => {
    return (
      <blockquote
        ref={ref}
        className={cn(blockquoteVariants({ variant, className }))}
        style={style}
        {...props}
      >
        {children}
      </blockquote>
    );
  },
);

Blockquote.displayName = "Blockquote";
