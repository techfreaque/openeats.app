import { cn } from "next-query-portal/shared";
import type { ElementRef, ReactElement } from "react";
import { forwardRef } from "react";
import type { TouchableOpacityProps } from "react-native";
import { Text, TouchableOpacity } from "react-native";

import { buttonVariants } from "./button.core";
import type { BaseButtonProps } from "./button.types";

export interface ButtonProps extends TouchableOpacityProps, BaseButtonProps {}

/**
 * A helper to merge multiple refs without reading any ref's `current` value during render.
 */
// function mergeRefs<T>(
//   ...refs: Array<Ref<T> | undefined>
// ): RefCallback<T> {
//   return (value: T) => {
//     refs.forEach((ref) => {
//       if (!ref) {
//         return;
//       }
//       if (typeof ref === "function") {
//         ref(value);
//       } else {
//         (ref as MutableRefObject<T | null>).current = value;
//       }
//     });
//   };
// }

export const Button = forwardRef<
  ElementRef<typeof TouchableOpacity>,
  ButtonProps
>(
  (
    { className, variant, size, asChild = false, children, ...props },
    ref,
  ): ReactElement => {
    const computedClassName = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      throw new Error("asChild is not supported in native components");
    }

    // if (asChild && isValidElement(children)) {
    //   // When using asChild, we assume the child supports a ref and className.
    //   const child = children as ReactElement<{ className?: string }>;
    //   return cloneElement(child, {
    //     className: computedClassName,
    //     ref: mergeRefs(ref, child.ref),
    //     ...props,
    //   });
    // }

    return (
      <TouchableOpacity ref={ref} className={computedClassName} {...props}>
        {typeof children === "string" ? (
          <Text className="text-center">{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  },
);
Button.displayName = "Button";
