import * as LucideIcons from "lucide-react";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { cn } from "next-vibe/shared/utils/utils";
import type { FC, SVGProps } from "react";
import { forwardRef } from "react";

import type { IconProps } from "./icon.types";

export const Icon = forwardRef<
  SVGSVGElement,
  IconProps & SVGProps<SVGSVGElement>
>(
  (
    {
      name,
      size = 24,
      color = "currentColor",
      className,
      style,
      strokeWidth = 2,
      ...props
    },
    ref,
  ) => {
    // Get the icon component from lucide-react

    const IconComponent = LucideIcons[name] as FC<
      SVGProps<SVGSVGElement> & {
        size?: number;
        color?: string;
        strokeWidth?: number;
      }
    >;

    if (!IconComponent) {
      errorLogger(`Icon "${name}" not found`);
      return null;
    }

    return (
      <IconComponent
        ref={ref}
        size={size}
        color={color}
        className={cn(className)}
        style={style}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  },
);

Icon.displayName = "Icon";
