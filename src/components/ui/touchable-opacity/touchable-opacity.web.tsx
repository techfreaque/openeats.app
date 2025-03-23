import { cn } from "next-query-portal/shared";
import type { ButtonHTMLAttributes, ReactElement } from "react";
import { forwardRef, useState } from "react";

import { touchableVariants } from "./touchable-opacity.core";
import type { BaseTouchableOpacityProps } from "./touchable-opacity.types";

export interface WebTouchableOpacityProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    BaseTouchableOpacityProps {
  variant?: "default" | "subtle" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

export const TouchableOpacity = forwardRef<
  HTMLButtonElement,
  WebTouchableOpacityProps
>(
  (
    {
      children,
      className,
      style,
      onPress,
      disabled,
      activeOpacity = 0.2,
      variant,
      padding,
      rounded,
      ...props
    },
    ref,
  ): ReactElement => {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = (): void => setIsPressed(true);
    const handleMouseUp = (): void => setIsPressed(false);
    const handleMouseLeave = (): void => setIsPressed(false);

    return (
      <button
        ref={ref}
        className={cn(
          "transition-opacity duration-150",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          touchableVariants({ variant, padding, rounded, className }),
        )}
        style={{
          ...style,
          opacity: isPressed && !disabled ? activeOpacity : 1,
          outline: "none",
          border: "none",
          backgroundColor: "transparent",
          padding: 0,
        }}
        onClick={onPress}
        disabled={disabled}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        type="button"
        {...props}
      >
        {children}
      </button>
    );
  },
);

TouchableOpacity.displayName = "TouchableOpacity";
