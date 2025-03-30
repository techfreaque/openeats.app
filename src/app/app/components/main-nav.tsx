"use client";

import {
  Heart,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "next-vibe/shared/utils/utils";
import { useAuth } from "@/hooks/useAuth"
import type React from "react";
import type { JSX } from "react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useCart } from "./hooks/use-cart";
import { LanguageSelector } from "./language-selector";
import { useTranslation } from "./lib/i18n";
import { LocationSelector } from "./location-selector";

export function MainNav(): JSX.Element {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<string>(() => {
    // Check if we have a saved location
    if (typeof window !== "undefined") {
      return localStorage.getItem("openeats-location") || "New York, NY";
    }
    return "New York, NY";
  });

  // Save location when it changes
  const handleLocationChange = (newLocation: string): void => {
    setLocation(newLocation);
    localStorage.setItem("openeats-location", newLocation);
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    // In a real app, we would navigate to search results page
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="border-b bg-background sticky top-0 z-50">
      {/* Top bar with logo and location */}
      <div className="container py-2 flex items-center justify-between">
        <Link href="/app" className="flex items-center gap-2">
          <span className="text-2xl">🍔</span>
          <span className="font-bold text-xl">{t("common.appName")}</span>
          <Badge variant="outline" className="hidden md:inline-flex text-xs">
            {t("common.openSource")}
          </Badge>
        </Link>

        <div className="flex items-center gap-3">
          <LocationSelector
            currentLocation={location}
            onLocationChange={handleLocationChange}
          />

          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.imageUrl} alt={user.firstName} />
                      <AvatarFallback>
                        {user.firstName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block">
                      {user.firstName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("common.myAccount")}</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/app/profile">
                      <User className="mr-2 h-4 w-4" />
                      {t("nav.profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/orders">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {t("nav.orders")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/favorites">
                      <Heart className="mr-2 h-4 w-4" />
                      {t("nav.favorites")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild>
                <Link href="/auth/public/login">{t("nav.signIn")}</Link>
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="relative md:hidden"
            asChild
          >
            <Link href="/app/cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">{t("nav.cart")}</span>
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("nav.toggleMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="py-4">
                  {user ? (
                    <div className="flex items-center gap-3 mb-6">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.imageUrl} alt={user.firstName} />
                        <AvatarFallback>
                          {user.firstName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.firstName}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button className="w-full mb-6" asChild>
                      <Link href="/auth/public/login">{t("nav.signIn")}</Link>
                    </Button>
                  )}

                  <nav className="space-y-4">
                    <Link
                      href="/app/restaurants"
                      className="flex items-center gap-2 py-2 text-base font-medium"
                    >
                      {t("nav.restaurants")}
                    </Link>
                    <Link
                      href="/app/markets"
                      className="flex items-center gap-2 py-2 text-base font-medium"
                    >
                      {t("nav.markets")}
                    </Link>
                    <Link
                      href="/app/local-shops"
                      className="flex items-center gap-2 py-2 text-base font-medium"
                    >
                      {t("nav.localShops")}
                    </Link>
                    <Link
                      href="/app/partners"
                      className="flex items-center gap-2 py-2 text-base font-medium"
                    >
                      {t("nav.partners")}
                    </Link>
                    <Link
                      href="/app/drivers"
                      className="flex items-center gap-2 py-2 text-base font-medium"
                    >
                      {t("nav.drivers")}
                    </Link>
                    <Link
                      href="/app/about"
                      className="flex items-center gap-2 py-2 text-base font-medium"
                    >
                      {t("nav.about")}
                    </Link>
                  </nav>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("nav.theme")}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                    >
                      {theme === "dark" ? (
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          <span>{t("nav.lightMode")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          <span>{t("nav.darkMode")}</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Language</span>
                    <LanguageSelector />
                  </div>

                  {user && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/app/profile">
                          <User className="mr-2 h-4 w-4" />
                          {t("nav.profile")}
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/app/orders">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {t("nav.orders")}
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/app/favorites">
                          <Heart className="mr-2 h-4 w-4" />
                          {t("nav.favorites")}
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t("nav.signOut")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container py-2 hidden md:block">
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-6">
            <Link
              href="/app/restaurants"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/restaurants"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {t("nav.restaurants")}
            </Link>
            <Link
              href="/app/markets"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/markets"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {t("nav.markets")}
            </Link>
            <Link
              href="/app/local-shops"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/local-shops"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {t("nav.localShops")}
            </Link>
            <Link
              href="/app/partners"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/partners"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {t("nav.partners")}
            </Link>
            <Link
              href="/app/drivers"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/drivers"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {t("nav.drivers")}
            </Link>
            <Link
              href="/app/about"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/about"
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {t("nav.about")}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("nav.searchPlaceholder")}
                className="pl-8 pr-10 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="absolute right-0 top-0 h-9 px-3"
                >
                  Go
                </Button>
              )}
            </form>

            <Button variant="outline" size="icon" className="relative" asChild>
              <Link href="/app/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {itemCount}
                  </Badge>
                )}
                <span className="sr-only">{t("nav.cart")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
