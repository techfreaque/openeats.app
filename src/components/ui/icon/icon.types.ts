import type * as LucideIcons from "lucide-react";

export interface IconProps {
  name: keyof typeof LucideIcons;
  size?: number;
  color?: string;
  className?: string;
  style?: Record<string, string | number>;
  strokeWidth?: number;
}
