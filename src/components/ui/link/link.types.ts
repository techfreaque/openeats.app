import type { ReactNode } from "react";

export interface LinkProps {
  children?: ReactNode;
  href: string;
  className?: string;
  style?: Record<string, string>;
}
