"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";

import { cn } from "@/packages/next-vibe/shared/utils/utils";

const sidebarItems = [
  { name: "General", href: "/website-editor/settings/general" },
  { name: "Account", href: "/website-editor/settings/account" },
  { name: "Themes", href: "/website-editor/themes" },
  { name: "UI", href: "/website-editor/settings/ui" },
  { name: "LLM", href: "/website-editor/settings/llm" },
  { name: "API keys", href: "/website-editor/settings/api-key" },
  { name: "About", href: "/website-editor/settings/about" },
];

export default function SettingsSidebar(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="w-60 bg-gray-50 h-full">
      <div className="px-3 py-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm font-medium",
                  pathname === item.href
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
