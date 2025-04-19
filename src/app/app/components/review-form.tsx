"use client";

import { Star } from "lucide-react";
import { Button, Textarea, useToast } from "next-vibe-ui/ui";
import type React from "react";
import type { JSX } from "react";
import { useState } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import { useReviews } from "@/app/api/v1/reviews/hooks";

import type { MenuItemType } from "./lib/types";

interface ReviewFormProps {
  restaurantId: string;
  orderedItems: MenuItemType[];
  onSuccess?: () => void;
}

export function ReviewForm({
  restaurantId,
  orderedItems,
  onSuccess,
}: ReviewFormProps): JSX.Element {
  const { addReview, isLoading } = useReviews();
  const { user } = useAuth();
  const { toast } = useToast();

  const [restaurantRating, setRestaurantRating] = useState<number>(0);
  const [restaurantComment, setRestaurantComment] = useState<string>("");
  const [productReviews, setProductReviews] = useState<
    {
      productId: string;
      productName: string;
      rating: number;
      comment: string;
    }[]
  >(
    orderedItems.map((item) => ({
      productId: item.id,
      productName: item.name,
      rating: 0,
      comment: "",
    })),
  );

  // Add proper return type to the handleProductRatingChange function
  const handleProductRatingChange = (index: number, rating: number): void => {
    const updatedReviews = [...productReviews];
    updatedReviews[index].rating = rating;
    setProductReviews(updatedReviews);
  };

  // Add proper return type to the handleProductCommentChange function
  const handleProductCommentChange = (index: number, comment: string): void => {
    const updatedReviews = [...productReviews];
    updatedReviews[index].comment = comment;
    setProductReviews(updatedReviews);
  };

  // Add proper return type to the handleSubmit function
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      return;
    }

    if (restaurantRating === 0) {
      toast({
        title: "Rating required",
        description: "Please rate the restaurant",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one product has been rated
    const hasProductRating = productReviews.some((review) => review.rating > 0);
    if (!hasProductRating) {
      toast({
        title: "Product rating required",
        description: "Please rate at least one product",
        variant: "destructive",
      });
      return;
    }

    // Filter out unrated products
    const validProductReviews = productReviews.filter(
      (review) => review.rating > 0,
    );

    const success = await addReview({
      restaurantId,
      restaurantRating,
      restaurantComment,
      productReviews: validProductReviews,
    });

    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Rate the Restaurant</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                className="focus:outline-none"
                onClick={() => setRestaurantRating(rating)}
              >
                <Star
                  className={`h-6 w-6 ${
                    rating <= restaurantRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {restaurantRating > 0
                ? `${restaurantRating} stars`
                : "Select rating"}
            </span>
          </div>

          <Textarea
            placeholder="Share your experience with this restaurant..."
            value={restaurantComment}
            onChange={(e) => setRestaurantComment(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Rate the Items You Ordered</h3>
        <p className="text-sm text-muted-foreground">
          Please rate at least one item
        </p>

        {productReviews.map((review, index) => (
          <div key={review.productId} className="space-y-2 border-b pb-4">
            <h4 className="font-medium">{review.productName}</h4>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => handleProductRatingChange(index, rating)}
                >
                  <Star
                    className={`h-5 w-5 ${
                      rating <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {review.rating > 0 ? `${review.rating} stars` : "Select rating"}
              </span>
            </div>

            <Textarea
              placeholder={`What did you think of the ${review.productName}?`}
              value={review.comment}
              onChange={(e) =>
                handleProductCommentChange(index, e.target.value)
              }
              className="min-h-[80px]"
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
