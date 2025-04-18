"use client";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Button, useSidebar } from "next-vibe-ui/ui";
import React, { useState } from "react";

import { cn } from "@/packages/next-vibe/shared/utils/utils";

// Function to generate a color based on the SUBId
const generateColor = (subId: string, isParentNode: boolean): string => {
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char * char;
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const hash = hashString(subId);
  const hue = hash % 360;
  const saturation = "100%";
  const lightness = "80%";
  return `hsl(${hue}, ${saturation}, ${lightness})`;
};

function getPredecessor(str: string): string {
  if (!str) {
    return "a-0";
  }
  const parts = str.split("-");

  if (parts.length === 2 && parts[1] === "1") {
    return `${parts[0]}-0`;
  }

  while (parts.length > 1 && parts[parts.length - 1] === "1") {
    parts.pop();

    if (parts.length === 1) {
      return `${parts[0]}-0`;
    }
  }

  const lastPart = parts.pop();
  if (!lastPart) {
    return `${parts[0]}-0`;
  }
  const numericLastPart = parseInt(lastPart, 10);

  if (!isNaN(numericLastPart) && numericLastPart > 0) {
    return `${parts.join("-")}-${numericLastPart - 1}`;
  }

  return `${parts.join("-") || parts[0]}-0`;
}

export default function Sidebar({
  subPrompts,
  setVersion,
  subid,
}: {
  subPrompts:
    | {
        id: string;
        UIId: string;
        SUBId: string;
        createdAt: Date;
        subPrompt: string;
        codeId: string;
        modelId?: string;
        code: string;
      }[][]
    | undefined;
  setVersion: (subid: string) => Promise<void>;
  subid: string;
}): React.JSX.Element {
  const { open, toggleSidebar } = useSidebar();
  const [status, setStatus] = useState(false);

  const handleToggle = (): void => {
    setStatus(true);
    toggleSidebar();
    setTimeout(() => setStatus(false), 500);
  };

  if (!subPrompts) {
    return <div />;
  }

  return (
    <nav
      className={cn(
        `relative hidden h-screen border-r pt-10 md:block`,
        status && "duration-200",
        open ? "w-44" : "w-[50px]",
      )}
    >
      <ArrowLeft
        size={22}
        className={cn(
          "absolute -right-3 top-0 cursor-pointer rounded-full border bg-background text-3xl text-foreground transition-transform duration-500",
          !open && "rotate-180",
        )}
        onClick={handleToggle}
      />
      <div className="px-3 py-2 flex justify-center h-[80vh] overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {subPrompts.map((subPrompt, i) => {
            const rightColor = generateColor(subPrompt[0].SUBId, false);
            const leftColor = generateColor(
              getPredecessor(subPrompt[0].SUBId),
              false,
            );

            return (
              <Button
                key={subPrompt[0].id}
                onClick={() => void setVersion(subPrompt[0].SUBId)}
                variant={
                  subid?.endsWith("0")
                    ? "outline"
                    : subid === subPrompt[0].SUBId
                      ? "outline"
                      : "secondary"
                }
                className={cn(
                  "text-xs font-bold  relative overflow-hidden transition-all duration-200",
                  open ? "w-40" : "w-[44px]",
                  subid === subPrompt[0].SUBId ? "ring-2 ring-white" : "",
                )}
                title={`Subid: ${subPrompt[0].id}`}
              >
                {open && (
                  <div className="absolute inset-0 z-0">
                    <div
                      className="h-full w-1/2 float-left"
                      style={{ backgroundColor: leftColor }}
                    />
                    <div
                      className="h-full w-1/2 float-right"
                      style={{ backgroundColor: rightColor }}
                    />
                  </div>
                )}
                <span className="relative z-10">
                  {i === 0 ? "V1" : subPrompt[0].SUBId}
                </span>
              </Button>
            );
          })}
          {subid === "1" && (
            <Button
              onClick={() => void setVersion("0")}
              className="text-xs font-bold text-white relative overflow-hidden"
            >
              <span className="relative z-10">
                <LoaderCircle className="h-4 w-4 ml-1 animate-spin" />
              </span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
