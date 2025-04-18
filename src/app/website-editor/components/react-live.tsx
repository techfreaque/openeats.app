"use client";

import React, { useEffect, useState } from "react";
import { LiveError, LivePreview, LiveProvider } from "react-live";

import { errorLogger } from "@/packages/next-vibe/shared/utils/logger";

const ReactLiveContent = ({
  react_code,
  theme,
}: {
  react_code: string;
  theme: string;
}): React.JSX.Element => {
  const [scope, setScope] = useState<Record<string, any> | null>(null);
  const [codeString, setCodeString] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const loadScope = async (): Promise<void> => {
      try {
        const components = await import("next-vibe-ui/ui");

        const newScope: Record<string, any> = {
          React,
          HTMLElement,
          HTMLDivElement,
          HTMLInputElement,
          HTMLButtonElement,
          useState: React.useState,
          useEffect: React.useEffect,
          ...components,
        };

        setScope(newScope);
      } catch (error) {
        errorLogger("Failed to load components:", error);
      }
    };

    void loadScope();
  }, []);

  useEffect(() => {
    if (!scope || !react_code) {
      return;
    }
    const cleanedCodeString = react_code
      .replace(/import\s+({[^}]*})?\s+from\s+['"][^'"]+['"];\s*/g, "") // Remove all import statements
      .replace(/import\s+({[^}]*})?\s+from\s+['"][^'"]+['"]\s*/g, "") // Remove all import statements
      .replace(
        /import\s+([\w*]+(,\s*{[^}]*})?)?\s+from\s+['"][^'"]+['"];\s*/g,
        "",
      )
      .replace(/export default function \w+\s*\(\)\s*{/, "() => {") // Replace 'function FunctionName(' with '() => {'
      .trim(); // Remove leading or trailing newlines
    setCodeString(cleanedCodeString);
  }, [scope, react_code]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsFullScreen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return (): void => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!scope || !codeString) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  return (
    <div
      className={`${isFullScreen ? "fixed inset-0 z-50 bg-background overflow-y-auto" : ""}`}
    >
      <div className={`${theme} relative bg-background`}>
        <LiveProvider code={codeString} scope={scope}>
          <LiveError className="text-red-800 bg-red-100 mt-2 p-4" />
          <LivePreview />
        </LiveProvider>
      </div>
    </div>
  );
};

export default ReactLiveContent;
