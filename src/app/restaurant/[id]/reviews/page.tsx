"use client";

import { AlertCircle, Loader2, Search, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "next-vibe/i18n";
import { cn } from "next-vibe/shared/utils/utils";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "next-vibe-ui/ui";
import type { JSX } from "react";
import { useState } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import { useRestaurant } from "@/app/api/v1/restaurant/hooks";
import { LanguageSelector } from "@/app/app/components/language-selector";
import type { MenuItemType } from "@/app/app/components/lib/types";
import { useRestaurantConfig } from "@/app/app/components/restaurant-config-provider";
import { ReviewForm } from "@/app/app/components/review-form";
import { ReviewsList } from "@/app/app/components/reviews-list";

// Define filter type
type ReviewFilter =
  | "all"
  | "positive"
  | "negative"
  | "with-photos"
  | "with-replies";

export default function RestaurantReviewsPage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  useRestaurantConfig(); // Load restaurant config

  // API data
  const { data: restaurant, isLoading, error } = useRestaurant(id);
  const menuItems = restaurant?.menuItems || [];

  // Filter states
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "highest" | "lowest" | "most-helpful"
  >("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState<string>("read");
  const [selectedItems, setSelectedItems] = useState<MenuItemType[]>([]);

  // Calculate average rating - in a real app, this would come from the API
  const averageRating = "4.7";

  // Rating distribution - in a real app, this would come from the API
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = Math.floor(Math.random() * 20) + (rating === 5 ? 30 : 5); // More 5-star reviews
    const percentage = (100 * count) / 85; // Total of 85 reviews
    return { rating, count, percentage };
  });

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

  if (isLoading) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="text-3xl font-bold mb-4">
            {error ? "Error loading restaurant" : "Restaurant not found"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mb-6">
            {error
              ? "There was a problem loading the restaurant information. Please try again later."
              : "The restaurant you are looking for does not exist or has been removed."}
          </p>
          <Button size="lg" asChild>
            <Link href={`/restaurant/${id}`}>Back to Restaurant</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Hero section */}
      <div className="bg-muted py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {restaurant.name} -{" "}
                {t("restaurant.reviews.title", "Customer Reviews")}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                See what others are saying about our restaurant or share your
                own experience
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/restaurant/${id}`}>Back to Restaurant</Link>
              </Button>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          {/* Sidebar with rating summary */}
          <div className="space-y-6">
            {/* Rating overview */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{averageRating}</div>
                    <div className="flex mt-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-5 w-5",
                            parseFloat(averageRating) >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground",
                          )}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Based on 85 reviews
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {ratingDistribution.map((dist) => (
                    <div key={dist.rating} className="flex items-center gap-2">
                      <div className="w-12 text-sm font-medium">
                        {dist.rating} stars
                      </div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${dist.percentage}%` }}
                        />
                      </div>
                      <div className="w-10 text-sm text-muted-foreground text-right">
                        {dist.count}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleAddReviewClick}
                  disabled={!user}
                >
                  Write a Review
                </Button>
              </CardFooter>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <RadioGroup
                    value={activeFilter}
                    onValueChange={(value) =>
                      setActiveFilter(value as ReviewFilter)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">All Ratings</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="positive" id="positive" />
                      <Label htmlFor="positive">Positive (4-5 stars)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="negative" id="negative" />
                      <Label htmlFor="negative">Critical (1-3 stars)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Features</Label>
                  <RadioGroup
                    value={activeFilter}
                    onValueChange={(value) =>
                      setActiveFilter(value as ReviewFilter)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with-photos" id="with-photos" />
                      <Label htmlFor="with-photos">With Photos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with-replies" id="with-replies" />
                      <Label htmlFor="with-replies">With Owner Replies</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                      <SelectItem value="most-helpful">Most Helpful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setActiveFilter("all");
                    setSortBy("newest");
                    setSearchQuery("");
                  }}
                >
                  Reset Filters
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Reviews content */}
          <div>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
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
      </div>
    </div>
  );
}
