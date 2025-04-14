"use client";

import type { ReactNode } from "react";
import type { JSX } from "react";
import { useCallback } from "react";
import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { useApiStore } from "next-vibe/client/hooks/store";
import type { ReviewType } from "../lib/types";
import { translations } from "@/translations";

/**
 * Create a type-safe translation function
 */
const createTranslator = () => {
  return (key: string, fallback?: string): string => {
    const parts = key.split(".");
    let current: Record<string, unknown> = translations.EN;
    
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        const value = current[part];
        current = value as Record<string, unknown>;
      } else {
        return fallback || key;
      }
    }
    
    return typeof current === "string" ? current : fallback || key;
  };
};

const mockReviews: ReviewType[] = [
  {
    id: "review1",
    userId: "1",
    userName: "John Doe",
    userAvatar: "/placeholder.svg?height=40&width=40",
    restaurantId: "1",
    restaurantRating: 4.5,
    restaurantComment: "Great atmosphere and service!",
    productReviews: [
      {
        productId: "101",
        productName: "Classic Cheeseburger",
        rating: 5,
        comment: "Best burger I've ever had!",
      },
      {
        productId: "104",
        productName: "French Fries",
        rating: 4,
        comment: "Crispy and delicious",
      },
    ],
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "review2",
    userId: "2",
    userName: "Jane Smith",
    userAvatar: "/placeholder.svg?height=40&width=40",
    restaurantId: "1",
    restaurantRating: 4.0,
    restaurantComment: "Good food but a bit slow on delivery",
    productReviews: [
      {
        productId: "102",
        productName: "Bacon Deluxe Burger",
        rating: 4.5,
        comment: "Delicious, but could use more bacon",
      },
    ],
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "review3",
    userId: "3",
    userName: "Mike Johnson",
    userAvatar: "/placeholder.svg?height=40&width=40",
    restaurantId: "2",
    restaurantRating: 5.0,
    restaurantComment: "Amazing pizza place!",
    productReviews: [
      {
        productId: "201",
        productName: "Margherita Pizza",
        rating: 5,
        comment: "Authentic Italian taste",
      },
      {
        productId: "204",
        productName: "Garlic Bread",
        rating: 4.5,
        comment: "Perfect side dish",
      },
    ],
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "review4",
    userId: "1",
    userName: "John Doe",
    userAvatar: "/placeholder.svg?height=40&width=40",
    restaurantId: "3",
    restaurantRating: 4.0,
    restaurantComment: "Great sushi, a bit pricey",
    productReviews: [
      {
        productId: "301",
        productName: "California Roll",
        rating: 4,
        comment: "Fresh and tasty",
      },
    ],
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
 * This is a zustand-based implementation that will be connected to the API
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
  const { user } = useAuth();
  const t = createTranslator();
  
  const reviews = mockReviews;
  const isLoading = false;
  const error = null;
  
  const userReviews = user 
    ? reviews.filter((review) => review.userId === user.id)
    : [];
  
  const restaurantReviews = useCallback(
    (restaurantId: string): ReviewType[] => {
      return reviews.filter((review) => review.restaurantId === restaurantId);
    },
    [reviews]
  );
  
  const productReviews = useCallback(
    (productId: string): ReviewType[] => {
      return reviews.filter((review) =>
        review.productReviews.some((pr) => pr.productId === productId)
      );
    },
    [reviews]
  );
  
  const getAverageRestaurantRating = useCallback(
    (restaurantId: string): number => {
      const restaurantReviewsList = restaurantReviews(restaurantId);
      if (restaurantReviewsList.length === 0) {
        return 0;
      }
      
      const sum = restaurantReviewsList.reduce(
        (acc, review) => acc + review.restaurantRating,
        0
      );
      return Number.parseFloat((sum / restaurantReviewsList.length).toFixed(1));
    },
    [restaurantReviews]
  );
  
  const getAverageProductRating = useCallback(
    (productId: string): number => {
      const productReviewsList = productReviews(productId);
      if (productReviewsList.length === 0) {
        return 0;
      }
      
      let totalRating = 0;
      let count = 0;
      
      productReviewsList.forEach((review) => {
        const productReview = review.productReviews.find(
          (pr) => pr.productId === productId
        );
        if (productReview) {
          totalRating += productReview.rating;
          count++;
        }
      });
      
      return count > 0 ? Number.parseFloat((totalRating / count).toFixed(1)) : 0;
    },
    [productReviews]
  );
  
  const addReview = useCallback(
    async (
      data: Omit<
        ReviewType,
        "id" | "userId" | "userName" | "userAvatar" | "date"
      >
    ): Promise<boolean> => {
      if (!user) {
        toast({
          title: t("auth.signInRequired", "Authentication required"),
          description: t("auth.signInToReview", "Please sign in to leave a review"),
          variant: "destructive",
        });
        return false;
      }
      
      try {
        console.log("Adding review:", data);
        
        toast({
          title: t("review.added", "Review submitted"),
          description: t("review.addedDescription", "Thank you for your feedback!"),
        });
        
        useApiStore.getState().invalidateQueries(["reviews"]);
        
        return true;
      } catch (err) {
        toast({
          title: t("error", "Error"),
          description: t("review.errorAdding", "Failed to submit your review. Please try again."),
          variant: "destructive",
        });
        return false;
      }
    },
    [user, t]
  );
  
  const updateReview = useCallback(
    async (id: string, data: Partial<ReviewType>): Promise<boolean> => {
      if (!user) {
        toast({
          title: t("auth.signInRequired", "Authentication required"),
          description: t("auth.signInToUpdateReview", "Please sign in to update a review"),
          variant: "destructive",
        });
        return false;
      }
      
      try {
        console.log("Updating review:", id, data);
        
        toast({
          title: t("review.updated", "Review updated"),
          description: t("review.updatedDescription", "Your review has been updated successfully"),
        });
        
        useApiStore.getState().invalidateQueries(["reviews"]);
        
        return true;
      } catch (err) {
        toast({
          title: t("error", "Error"),
          description: t("review.errorUpdating", "Failed to update your review. Please try again."),
          variant: "destructive",
        });
        return false;
      }
    },
    [user, t]
  );
  
  const deleteReview = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) {
        toast({
          title: t("auth.signInRequired", "Authentication required"),
          description: t("auth.signInToDeleteReview", "Please sign in to delete a review"),
          variant: "destructive",
        });
        return false;
      }
      
      try {
        console.log("Deleting review:", id);
        
        toast({
          title: t("review.deleted", "Review deleted"),
          description: t("review.deletedDescription", "Your review has been deleted successfully"),
        });
        
        useApiStore.getState().invalidateQueries(["reviews"]);
        
        return true;
      } catch (err) {
        toast({
          title: t("error", "Error"),
          description: t("review.errorDeleting", "Failed to delete your review. Please try again."),
          variant: "destructive",
        });
        return false;
      }
    },
    [user, t]
  );
  
  return {
    reviews,
    userReviews,
    restaurantReviews,
    productReviews,
    isLoading,
    error,
    addReview,
    updateReview,
    deleteReview,
    getAverageRestaurantRating,
    getAverageProductRating,
  };
}
