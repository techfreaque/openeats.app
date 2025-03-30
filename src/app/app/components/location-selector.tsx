"use client";

import { MapPin, Navigation, Search, X } from "lucide-react";
import { errorLogger } from "next-vibe/shared/utils/logger";
import type React from "react";
import type { JSX } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { useTranslation } from "./lib/i18n";

interface LocationSelectorProps {
  currentLocation?: string;
  onLocationChange: (location: string) => void;
}

export function LocationSelector({
  currentLocation,
  onLocationChange,
}: LocationSelectorProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Mock suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 2) {
      // In a real app, this would be an API call to a geocoding service
      const mockSuggestions = [
        `${searchQuery}, Main St, Anytown`,
        `${searchQuery}, Broadway, New City`,
        `${searchQuery} Plaza, Downtown, Metropolis`,
        `${searchQuery} Heights, Uptown, Bigcity`,
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Update the error handling in the detectCurrentLocation function
  const detectCurrentLocation = (): void => {
    setIsLoading(true);
    setLocationError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we would use reverse geocoding to get the address
          // For now, we'll just use the coordinates
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          onLocationChange(locationString);
          setIsLoading(false);
          setIsOpen(false);

          toast({
            title: t("location.locationDetected"),
            description: t("location.locationDetectedDescription", {
              location: locationString,
            }),
          });
        },
        (error: GeolocationPositionError) => {
          errorLogger("Error getting location:", error);
          setIsLoading(false);
          setLocationError(t("location.locationAccessDenied"));

          // Set a default location if user denies permission
          if (error.code === error.PERMISSION_DENIED) {
            onLocationChange("New York, NY");
            toast({
              title: t("location.locationAccessDenied"),
              description: t("location.locationAccessDeniedDescription"),
              variant: "destructive",
            });
          }
        },
        { timeout: 10000, enableHighAccuracy: false },
      );
    } else {
      setIsLoading(false);
      setLocationError(t("location.locationNotSupported"));
      toast({
        title: t("location.locationNotSupported"),
        description: t("location.locationNotSupportedDescription"),
        variant: "destructive",
      });
    }
  };

  // Add proper return type to other functions
  const selectSuggestion = (suggestion: string): void => {
    onLocationChange(suggestion);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleManualSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onLocationChange(searchQuery);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 max-w-[200px] justify-start overflow-hidden"
        >
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {currentLocation || t("location.setLocation")}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("location.setLocation")}</DialogTitle>
          <DialogDescription>
            {t("location.setLocationDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={detectCurrentLocation}
            disabled={isLoading}
          >
            <Navigation className="h-4 w-4" />
            {isLoading
              ? t("location.detecting")
              : t("location.useCurrentLocation")}
          </Button>

          {locationError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
              <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{locationError}</p>
            </div>
          )}

          <div className="relative">
            <form onSubmit={handleManualSubmit}>
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("location.enterAddress")}
                className="pl-8 pr-10"
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
          </div>
          {suggestions.length > 0 && (
            <div className="mt-2 max-h-[200px] overflow-y-auto rounded-md border">
              <div className="p-2 text-xs text-muted-foreground">
                {t("location.suggestions")}
              </div>
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start px-2 py-1.5 text-sm"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery("");
              setLocationError(null);
            }}
          >
            {t("common.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
