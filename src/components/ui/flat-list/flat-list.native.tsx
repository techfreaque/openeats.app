import { cn } from "next-query-portal/shared";
import type { ReactElement, Ref } from "react";
import { forwardRef } from "react";
import {
  FlatList as RNFlatList,
  type FlatListProps as RNFlatListProps,
} from "react-native";

import type { FlatListProps } from "./flat-list.types";

export interface NativeFlatListProps<T>
  extends Omit<RNFlatListProps<T>, "renderItem">,
    FlatListProps<T> {}

function FlatListComponent<T>(
  {
    data,
    renderItem,
    keyExtractor,
    horizontal,
    numColumns,
    className,
    style,
    showsHorizontalScrollIndicator,
    showsVerticalScrollIndicator,
    contentContainerStyle,
    ...props
  }: NativeFlatListProps<T>,
  ref: Ref<RNFlatList<T>>,
): ReactElement {
  return (
    <RNFlatList
      ref={ref}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal={horizontal}
      numColumns={numColumns}
      className={cn(className)}
      style={style}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      contentContainerStyle={contentContainerStyle}
      {...props}
    />
  );
}

export const FlatList = forwardRef(FlatListComponent) as <T>(
  props: NativeFlatListProps<T> & {
    ref?: Ref<RNFlatList<T>>;
  },
) => ReactElement;
