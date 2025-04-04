"use client";

import { ArrowLeft, Menu } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "next-vibe/shared/utils/utils";
import type { JSX } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useRestaurantConfig } from "./restaurant-config-provider";

interface RestaurantNavbarProps {
  restaurantName: string;
  restaurantId: string;
}

export function RestaurantNavbar({
  restaurantName,
  restaurantId,
}: RestaurantNavbarProps): JSX.Element {
  const params = useParams();
  const pathname = usePathname();
  const config = useRestaurantConfig();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<string>("home");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return (): void => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine active page from URL
  useEffect(() => {
    if (pathname.includes("/menu")) {
      setActivePage("menu");
    } else if (pathname.includes("/about")) {
      setActivePage("about");
    } else if (pathname.includes("/gallery")) {
      setActivePage("gallery");
    } else if (pathname.includes("/contact")) {
      setActivePage("contact");
    } else if (pathname.includes("/chef")) {
      setActivePage("chef");
    } else {
      setActivePage("home");
    }
  }, [pathname]);

  // Get pages from config or use defaults
  const pages = config.pages || [
    { id: "home", name: "Home", slug: "home", order: 1 },
    { id: "menu", name: "Menu", slug: "menu", order: 2 },
  ];

  // Sort pages by order
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-sm border-b shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-foreground hover:bg-background/80"
          >
            <Link href="/app">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to OpenEats</span>
            </Link>
          </Button>

          <Link
            href={`/app/restaurant/${restaurantId}`}
            className="font-semibold text-lg hidden md:block"
          >
            {restaurantName}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {sortedPages.map((page) => (
            <Link
              key={page.id}
              href={
                page.slug === "home"
                  ? `/app/restaurant/${restaurantId}`
                  : `/app/restaurant/${restaurantId}/${page.slug}`
              }
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                activePage === page.slug
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {page.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col space-y-4 mt-8">
              <Link
                href={`/app/restaurant/${restaurantId}`}
                className="text-lg font-semibold"
              >
                {restaurantName}
              </Link>

              {sortedPages.map((page) => (
                <Link
                  key={page.id}
                  href={
                    page.slug === "home"
                      ? `/app/restaurant/${restaurantId}`
                      : `/app/restaurant/${restaurantId}/${page.slug}`
                  }
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary py-2",
                    activePage === page.slug
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {page.name}
                </Link>
              ))}

              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link href={`/app/restaurant/${restaurantId}/menu`}>
                    Order Now
                  </Link>
                </Button>
              </div>

              <div className="pt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/app">Back to OpenEats</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Order Button */}
        <Button asChild className="hidden md:flex">
          <Link href={`/app/restaurant/${restaurantId}/menu`}>Order Now</Link>
        </Button>
      </div>
    </header>
  );
}
