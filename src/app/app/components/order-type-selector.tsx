"use client";
import { Home, Store, Utensils } from "lucide-react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { translations } from "@/translations";

export type OrderType = "delivery" | "pickup" | "dineIn";

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (value: OrderType) => void;
  options: {
    delivery: boolean;
    pickup: boolean;
    dineIn: boolean;
  };
}

export function OrderTypeSelector({
  value,
  onChange,
  options,
}: OrderTypeSelectorProps): JSX.Element {
  const t = (key: string, fallback?: string): string => {
    const parts = key.split(".");
    let result = translations.EN;

    for (const part of parts) {
      if (result && typeof result === "object" && part in result) {
        result = result[part] as any;
      } else {
        return fallback || key;
      }
    }

    return typeof result === "string" ? result : fallback || key;
  };

  return (
    <div className="flex gap-2">
      {options.delivery && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={value === "delivery" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => onChange("delivery")}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("restaurant.orderTypes.delivery")}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t(
                  "restaurant.orderTypes.deliveryTooltip",
                  "Delivery to your address",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {options.pickup && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={value === "pickup" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => onChange("pickup")}
              >
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("restaurant.orderTypes.pickup", "Pickup")}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t(
                  "restaurant.orderTypes.pickupTooltip",
                  "Pickup from restaurant",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {options.dineIn && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={value === "dineIn" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => onChange("dineIn")}
              >
                <Utensils className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("restaurant.orderTypes.dineIn", "Dine-In")}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {t(
                  "restaurant.orderTypes.dineInTooltip",
                  "Order while at restaurant",
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
