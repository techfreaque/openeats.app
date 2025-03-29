"use client";

import { cn } from "next-vibe/shared/utils/utils";
import type { JSX } from "react";

interface CategoryPillProps {
  name: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}

export function CategoryPill({
  name,
  icon,
  active,
  onClick,
}: CategoryPillProps): JSX.Element {
  return (
    <button
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted/50",
      )}
      onClick={onClick}
    >
      <span>{icon}</span>
      <span>{name}</span>
    </button>
  );
}
