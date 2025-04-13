import * as LucideIcons from "lucide-react-native";
import { cn } from "next-vibe/shared/utils/utils";
import { errorLogger } from "next-vibe/shared/utils/logger";
import type { ReactElement } from "react";
import { forwardRef } from "react";
import type { SvgProps } from "react-native-svg";

import type { IconProps } from "./icon.types";

export const Icon = forwardRef<SVGSVGElement, IconProps & SvgProps>(
  (
    {
      name,
      size = 24,
      color = "black",
      className,
      style,
      strokeWidth = 2,
      ...props
    },
    ref,
  ): ReactElement | null => {
    // Get the icon component from lucide-react-native
    const IconComponent = LucideIcons[
      name as keyof typeof LucideIcons
    ] as React.FC<
      SvgProps & { size?: number; color?: string; strokeWidth?: number }
    >;

    if (!IconComponent) {
      errorLogger(`Icon "${name}" not found`);
      return null;
    }

    return (
      <IconComponent
        ref={ref }
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
