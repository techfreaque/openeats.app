"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export function RestaurantRecommendForm(): React.JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [restaurantWebsite, setRestaurantWebsite] = useState("");
  const [comments, setComments] = useState("");
  const [yourName, setYourName] = useState("");
  const [yourEmail, setYourEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!restaurantName || !restaurantAddress) {
      toast({
        title: "Missing information",
        description: "Please provide at least the restaurant name and address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would be an API call to submit the recommendation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Thank you for your recommendation!",
        description:
          "We'll reach out to this restaurant and let you know when they join OpenEats.",
      });

      // Redirect to home page
      router.push("/app");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recommend a Restaurant</CardTitle>
        <CardDescription>
          Help us grow our community by recommending a restaurant you love
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Restaurant Information</h3>

            <div className="grid gap-2">
              <Label htmlFor="restaurant-name">Restaurant Name *</Label>
              <Input
                id="restaurant-name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="restaurant-address">Address *</Label>
              <Input
                id="restaurant-address"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="restaurant-phone">Phone Number (if known)</Label>
              <Input
                id="restaurant-phone"
                type="tel"
                value={restaurantPhone}
                onChange={(e) => setRestaurantPhone(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="restaurant-website">Website (if known)</Label>
              <Input
                id="restaurant-website"
                type="url"
                value={restaurantWebsite}
                onChange={(e) => setRestaurantWebsite(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comments">
                Why do you recommend this restaurant?
              </Label>
              <Textarea
                id="comments"
                placeholder="Tell us what you love about this restaurant..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Information</h3>

            <div className="grid gap-2">
              <Label htmlFor="your-name">Your Name</Label>
              <Input
                id="your-name"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="your-email">Your Email</Label>
              <Input
                id="your-email"
                type="email"
                value={yourEmail}
                onChange={(e) => setYourEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We'll notify you when this restaurant joins OpenEats
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/app/create-restaurant")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Recommendation"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
