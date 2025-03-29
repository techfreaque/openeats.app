"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Language } from "./lib/i18n";
import { useTranslation } from "./lib/i18n";

export function LanguageSelector(): JSX.Element {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // List of supported languages
  const languages: { code: Language; name: string }[] = [
    { code: "de", name: t("languages.de") },
    { code: "fr", name: t("languages.fr") },
    { code: "en", name: t("languages.en") },
    { code: "es", name: t("languages.es") },
    { code: "zh", name: t("languages.zh") },
  ];

  const handleLanguageChange = (lang: Language): void => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-block">
            {languages.find((l) => l.code === language)?.name}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between"
          >
            {lang.name}
            {language === lang.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
