"use client";

import { useParams } from "next/navigation";
import type { JSX } from "react";
import { useState } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import { useRestaurants } from "@/app/api/v1/restaurants/hooks";
import type { MenuItemType } from "@/app/app/components/lib/types";
import { ReviewForm } from "@/app/app/components/review-form";
import { ReviewsList } from "@/app/app/components/reviews-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function RestaurantReviewsPage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { getRestaurantById, getMenuItemsByRestaurantId } = useRestaurants();
  const { user } = useAuth();
  const { toast } = useToast();

  const restaurant = getRestaurantById(id);
  const menuItems = getMenuItemsByRestaurantId(id);

  const [activeTab, setActiveTab] = useState<string>("read");
  const [selectedItems, setSelectedItems] = useState<MenuItemType[]>([]);

  const handleAddReviewClick = (): void => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      return;
    }

    // In a real app, we would check if the user has ordered from this restaurant
    // For now, we'll just show a sample of menu items
    setSelectedItems(menuItems.slice(0, 3));
    setActiveTab("write");
  };

  const handleReviewSuccess = (): void => {
    setActiveTab("read");
    toast({
      title: "Review submitted",
      description: "Thank you for your feedback!",
    });
  };

  if (!restaurant) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="container px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reviews</h1>
          <p className="text-muted-foreground">
            See what others are saying about {restaurant.name} or share your own
            experience
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="read">Read Reviews</TabsTrigger>
              <TabsTrigger value="write">Write a Review</TabsTrigger>
            </TabsList>

            {activeTab === "read" && (
              <Button onClick={handleAddReviewClick}>Write a Review</Button>
            )}
          </div>

          <TabsContent value="read">
            <ReviewsList restaurantId={restaurant.id} />
          </TabsContent>

          <TabsContent value="write">
            {user ? (
              <div className="max-w-2xl mx-auto">
                <ReviewForm
                  restaurantId={restaurant.id}
                  orderedItems={selectedItems}
                  onSuccess={handleReviewSuccess}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Please sign in to leave a review
                </p>
                <Button asChild>
                  <a href="/app/signin">Sign In</a>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
