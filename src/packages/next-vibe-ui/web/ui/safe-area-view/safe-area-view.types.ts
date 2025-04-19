import type { CSSProperties, ReactNode } from "react";

export interface SafeAreaViewProps {
  children?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}
