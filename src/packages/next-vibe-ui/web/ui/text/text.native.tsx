import { cn } from "next-vibe/shared/utils/utils";
import type { ElementRef, ReactElement } from "react";
import { forwardRef } from "react";
import type { TextProps as RNTextProps } from "react-native";
import { Text as RNText } from "react-native";

import { textVariants } from "./text.core";
import type { BaseTextProps } from "./text.types";

export interface NativeTextProps extends RNTextProps, BaseTextProps {
  variant?: "default" | "lead" | "large" | "small" | "muted";
}

export const Text = forwardRef<ElementRef<typeof RNText>, NativeTextProps>(
  ({ children, className, style, variant, ...props }, ref): ReactElement => {
    return (
      <RNText
        ref={ref}
        className={cn(textVariants({ variant, className }))}
        style={style}
        {...props}
      >
        {children}
      </RNText>
    );
  },
);

Text.displayName = "Text";
