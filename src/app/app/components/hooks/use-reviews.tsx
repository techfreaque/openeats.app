"use client";

import type { JSX, ReactNode } from "react";

import { useReviews as useApiReviews } from "@/app/api/v1/reviews/hooks";
import type {
  ProductReviewType,
  ReviewResponseType,
} from "@/app/api/v1/reviews/schema";

import type { ReviewType } from "../lib/types";

/**
 * Convert API review response to legacy ReviewType
 */
const convertApiReviewToLegacyReview = (
  apiReview: ReviewResponseType,
): ReviewType => {
  return {
    id: apiReview.id,
    userId: apiReview.userId,
    userName: apiReview.userName,
    userAvatar: apiReview.userAvatar,
    restaurantId: apiReview.restaurantId,
    restaurantRating: apiReview.restaurantRating,
    restaurantComment: apiReview.restaurantComment,
    productReviews: apiReview.productReviews.map((pr: ProductReviewType) => {
      const review = {
        productId: pr.productId,
        productName: pr.productName,
        rating: pr.rating,
      };

      if (pr.comment !== undefined) {
        return { ...review, comment: pr.comment };
      }

      return review;
    }),
    date: apiReview.date,
  };
};

/**
 * ReviewProvider component
 * This is a wrapper around the API reviews hook to maintain backward compatibility
 */
export function ReviewProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return <>{children}</>;
}

/**
 * Hook for using reviews
 * This is a zustand-based implementation connected to the API
 */
export function useReviews(): {
  reviews: ReviewType[];
  userReviews: ReviewType[];
  restaurantReviews: (restaurantId: string) => ReviewType[];
  productReviews: (productId: string) => ReviewType[];
  isLoading: boolean;
  error: string | null;
  addReview: (
    reviewData: Omit<
      ReviewType,
      "id" | "userId" | "userName" | "userAvatar" | "date"
    >,
  ) => Promise<boolean>;
  updateReview: (
    reviewId: string,
    reviewData: Partial<ReviewType>,
  ) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  getAverageRestaurantRating: (restaurantId: string) => number;
  getAverageProductRating: (productId: string) => number;
} {
  const {
    reviews: apiReviews,
    userReviews: apiUserReviews,
    restaurantReviews: apiRestaurantReviews,
    productReviews: apiProductReviews,
    isLoading,
    error,
    addReview: apiAddReview,
    updateReview: apiUpdateReview,
    deleteReview: apiDeleteReview,
    getAverageRestaurantRating,
    getAverageProductRating,
  } = useApiReviews();

  const reviews = apiReviews.map(convertApiReviewToLegacyReview);

  const userReviews = apiUserReviews.map(convertApiReviewToLegacyReview);

  const restaurantReviews = (restaurantId: string): ReviewType[] => {
    return apiRestaurantReviews(restaurantId).map(
      convertApiReviewToLegacyReview,
    );
  };

  const productReviews = (productId: string): ReviewType[] => {
    return apiProductReviews(productId).map(convertApiReviewToLegacyReview);
  };

  const addReview = async (
    reviewData: Omit<
      ReviewType,
      "id" | "userId" | "userName" | "userAvatar" | "date"
    >,
  ): Promise<boolean> => {
    return await apiAddReview({
      restaurantId: reviewData.restaurantId,
      restaurantRating: reviewData.restaurantRating,
      restaurantComment: reviewData.restaurantComment,
      productReviews: reviewData.productReviews,
    });
  };

  const updateReview = async (
    reviewId: string,
    reviewData: Partial<ReviewType>,
  ): Promise<boolean> => {
    return await apiUpdateReview(reviewId, {
      restaurantRating: reviewData.restaurantRating,
      restaurantComment: reviewData.restaurantComment,
      productReviews: reviewData.productReviews,
    });
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    return await apiDeleteReview(reviewId);
  };

  return {
    reviews,
    userReviews,
    restaurantReviews,
    productReviews,
    isLoading,
    error: error ? error.message : null,
    addReview,
    updateReview,
    deleteReview,
    getAverageRestaurantRating,
    getAverageProductRating,
  };
}
