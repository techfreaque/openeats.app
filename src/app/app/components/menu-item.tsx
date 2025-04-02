"use client";

import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-vibe/i18n";
import type { JSX } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { useCart } from "./hooks/use-cart";
import type { MenuItemType } from "./lib/types";

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps): JSX.Element {
  const { addItem } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const { t } = useTranslation();

  const handleAddToCart = (): void => {
    addItem(item, quantity, specialInstructions);
    setIsDialogOpen(false);
    // Reset for next time
    setQuantity(1);
    setSpecialInstructions("");
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="p-4 md:flex-1">
            <CardContent className="p-0">
              <Link
                href={`/app/item/${item.id}`}
                className="font-medium hover:underline"
              >
                {item.name}
              </Link>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-2 font-medium">${item.price.toFixed(2)}</div>
            </CardContent>
            <CardFooter className="p-0 pt-4">
              <Button
                size="sm"
                className="h-8 gap-1"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("menuItem.add")}
              </Button>
            </CardFooter>
          </div>
          {item.image && (
            <div className="relative aspect-square h-24 w-24 overflow-hidden md:h-auto md:w-32">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>{item.description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t("menuItem.quantity")}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="special-instructions" className="font-medium">
                {t("menuItem.specialInstructions")}
              </label>
              <Textarea
                id="special-instructions"
                placeholder={t("menuItem.specialInstructionsPlaceholder")}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("menuItem.cancel")}</Button>
            </DialogClose>
            <Button onClick={handleAddToCart}>
              {t("menuItem.addToCart")} - ${(item.price * quantity).toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
