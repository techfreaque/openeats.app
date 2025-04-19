import { cn } from "next-vibe/shared/utils/utils";
import type { HTMLAttributes, JSX } from "react";

function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
