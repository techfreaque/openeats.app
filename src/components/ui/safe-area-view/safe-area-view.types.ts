import type { ReactNode } from "react";

export interface SafeAreaViewProps {
  children?: ReactNode;
  className?: string;
  style?: Record<string, string | number>;
}
