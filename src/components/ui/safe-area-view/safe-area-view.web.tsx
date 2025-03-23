import { cn } from "next-query-portal/shared/utils/utils";
import type { HTMLAttributes, ReactElement } from "react";
import { forwardRef } from "react";

import type { SafeAreaViewProps } from "./safe-area-view.types";

export interface WebSafeAreaViewProps
  extends HTMLAttributes<HTMLDivElement>,
    SafeAreaViewProps {}

export const SafeAreaView = forwardRef<HTMLDivElement, WebSafeAreaViewProps>(
  ({ children, className, style, ...props }, ref): ReactElement => {
    // On web, we add padding to simulate the safe area
    return (
      <div
        ref={ref}
        className={cn("h-full", className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  },
);

SafeAreaView.displayName = "SafeAreaView";
