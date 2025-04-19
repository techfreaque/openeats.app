"use client";

import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "next-vibe-ui/ui";
import type { JSX } from "react";
import { useState } from "react";

import { useReviews } from "@/app/api/v1/reviews/hooks";

interface ReviewsListProps {
  restaurantId: string;
}

export function ReviewsList({ restaurantId }: ReviewsListProps): JSX.Element {
  const { restaurantReviews } = useReviews();
  const reviews = restaurantReviews(restaurantId);
  const [expandedReviews, setExpandedReviews] = useState<
    Record<string, boolean>
  >({});

  const toggleReviewExpansion = (reviewId: string): void => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No reviews yet. Be the first to leave a review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={
                    review.userAvatar || "/placeholder.svg?height=40&width=40"
                  }
                  alt={review.userName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{review.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.date), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">
                {review.restaurantRating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Restaurant review */}
          {review.restaurantComment && (
            <div className="text-sm">
              <p>{review.restaurantComment}</p>
            </div>
          )}

          {/* Product reviews */}
          {review.productReviews.length > 0 && (
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => toggleReviewExpansion(review.id)}
              >
                {expandedReviews[review.id] ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide item reviews
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show {review.productReviews.length} item{" "}
                    {review.productReviews.length === 1 ? "review" : "reviews"}
                  </>
                )}
              </Button>

              {expandedReviews[review.id] && (
                <div className="mt-3 space-y-3 pl-4 border-l-2">
                  {review.productReviews.map((productReview) => (
                    <div key={productReview.productId} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {productReview.productName}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">
                            {productReview.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {productReview.comment && (
                        <p className="text-xs text-muted-foreground">
                          {productReview.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
