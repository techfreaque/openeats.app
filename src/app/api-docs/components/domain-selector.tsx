"use client";

import { ENDPOINT_DOMAINS } from "next-vibe/shared/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "next-vibe-ui/ui";
import type { JSX } from "react";

interface DomainSelectorProps {
  selectedDomain: keyof typeof ENDPOINT_DOMAINS;
  onDomainChange: (domain: keyof typeof ENDPOINT_DOMAINS) => void;
}

export function DomainSelector({
  selectedDomain,
  onDomainChange,
}: DomainSelectorProps): JSX.Element {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Environment:</span>
      <Select
        value={selectedDomain}
        onValueChange={(value) =>
          onDomainChange(value as keyof typeof ENDPOINT_DOMAINS)
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={selectedDomain} />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(ENDPOINT_DOMAINS).map((domain) => (
            <SelectItem key={domain} value={domain}>
              {domain.charAt(0).toUpperCase() + domain.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
