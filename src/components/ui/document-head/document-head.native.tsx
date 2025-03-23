"use client";
import { useNavigation } from "expo-router";
import type { ReactElement } from "react";
import { useEffect } from "react";

import type { DocumentHeadProps } from "./document-head.types";

export function DocumentHead({
  title,
}: DocumentHeadProps): ReactElement | null {
  // Get the native navigation object to set screen options
  const navigation = useNavigation();

  useEffect(() => {
    if (title && navigation) {
      // Set the screen title in native navigation
      navigation.setOptions({
        title,
      });
    }
  }, [title, navigation]);

  // Return null since we don't render anything in the component tree
  return null;
}

DocumentHead.displayName = "DocumentHead";
