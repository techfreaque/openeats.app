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
                <span className="hidden sm:inline">Delivery</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delivery to your address</p>
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
                <span className="hidden sm:inline">Pickup</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pickup from restaurant</p>
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
                <span className="hidden sm:inline">Dine-In</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Order while at restaurant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
