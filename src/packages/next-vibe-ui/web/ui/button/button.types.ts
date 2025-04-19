import { type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import type { buttonVariants } from "./button.core";

export interface BaseButtonProps extends VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: ReactNode;
}
