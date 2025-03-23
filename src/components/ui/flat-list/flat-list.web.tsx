import { cn } from "next-query-portal/shared";
import type { HTMLAttributes, JSX, ReactElement, Ref } from "react";
import { forwardRef, Fragment } from "react";

import type { FlatListProps } from "./flat-list.types";

export interface WebFlatListProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, "data">,
    FlatListProps<T> {}

function FlatListComponent<T>(
  {
    data,
    renderItem,
    keyExtractor,
    horizontal,
    numColumns = 1,
    className,
    style,
    showsHorizontalScrollIndicator = true,
    showsVerticalScrollIndicator = true,
    contentContainerStyle,
    ...props
  }: WebFlatListProps<T>,
  ref: Ref<HTMLDivElement>,
): ReactElement {
  const renderGrid = (): JSX.Element => {
    if (horizontal) {
      return (
        <div
          className={cn(
            "flex flex-row",
            {
              "overflow-x-auto": horizontal,
              "scrollbar-hide": !showsHorizontalScrollIndicator,
            },
            className,
          )}
          style={style}
          {...props}
          ref={ref}
        >
          <div className="flex" style={contentContainerStyle}>
            {data.map((item, index) => (
              <Fragment key={keyExtractor?.(item, index) || index.toString()}>
                {renderItem({ item, index })}
              </Fragment>
            ))}
          </div>
        </div>
      );
    }

    // If numColumns > 1, render as a grid
    if (numColumns > 1) {
      return (
        <div
          className={cn(
            "overflow-auto",
            {
              "scrollbar-hide": !showsVerticalScrollIndicator,
            },
            className,
          )}
          style={style}
          {...props}
          ref={ref}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
              gap: "1rem",
              ...contentContainerStyle,
            }}
          >
            {data.map((item, index) => (
              <Fragment key={keyExtractor?.(item, index) || index.toString()}>
                {renderItem({ item, index })}
              </Fragment>
            ))}
          </div>
        </div>
      );
    }

    // Default vertical list
    return (
      <div
        className={cn(
          "flex flex-col overflow-auto",
          {
            "scrollbar-hide": !showsVerticalScrollIndicator,
          },
          className,
        )}
        style={style}
        {...props}
        ref={ref}
      >
        <div className="flex flex-col" style={contentContainerStyle}>
          {data.map((item, index) => (
            <Fragment key={keyExtractor?.(item, index) || index.toString()}>
              {renderItem({ item, index })}
            </Fragment>
          ))}
        </div>
      </div>
    );
  };

  return renderGrid();
}

export const FlatList = forwardRef(FlatListComponent) as <T>(
  props: WebFlatListProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
