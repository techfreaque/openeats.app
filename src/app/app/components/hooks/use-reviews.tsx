"use client";

import { useAuth } from "@/hooks/useAuth";
import type React from "react";
import type { JSX } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { errorLogger } from "@/packages/next-vibe/shared/utils/logger";

import { toast } from "../../../../components/ui/use-toast";
import type { ReviewType } from "../lib/types";

interface ReviewContextType {
  reviews: ReviewType[];
  userReviews: ReviewType[];
  restaurantReviews: (restaurantId: string) => ReviewType[];
  productReviews: (productId: string) => ReviewType[];
  isLoading: boolean;
  error: string | null;
  addReview: (
    review: Omit<
      ReviewType,
      "id" | "userId" | "userName" | "userAvatar" | "date"
    >,
  ) => Promise<boolean>;
  updateReview: (
    reviewId: string,
    review: Partial<ReviewType>,
  ) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  getAverageRestaurantRating: (restaurantId: string) => number;
  getAverageProductRating: (productId: string) => number;
}

// Mock reviews data
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

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setReviews(mockReviews);
      } catch (err) {
        errorLogger("Error loading reviews:", err);
        setError("Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    };

    void loadReviews();
  }, []);

  const userReviews = user
    ? reviews.filter((review) => review.userId === user.id)
    : [];

  const restaurantReviews = (restaurantId: string): ReviewType[] => {
    return reviews.filter((review) => review.restaurantId === restaurantId);
  };

  const productReviews = (productId: string): ReviewType[] => {
    return reviews.filter((review) =>
      review.productReviews.some((pr) => pr.productId === productId),
    );
  };

  const getAverageRestaurantRating = (restaurantId: string): number => {
    const restaurantReviewsList = restaurantReviews(restaurantId);
    if (restaurantReviewsList.length === 0) {
      return 0;
    }

    const sum = restaurantReviewsList.reduce(
      (acc, review) => acc + review.restaurantRating,
      0,
    );
    return Number.parseFloat((sum / restaurantReviewsList.length).toFixed(1));
  };

  const getAverageProductRating = (productId: string): number => {
    const productReviewsList = productReviews(productId);
    if (productReviewsList.length === 0) {
      return 0;
    }

    let totalRating = 0;
    let count = 0;

    productReviewsList.forEach((review) => {
      const productReview = review.productReviews.find(
        (pr) => pr.productId === productId,
      );
      if (productReview) {
        totalRating += productReview.rating;
        count++;
      }
    });

    return count > 0 ? Number.parseFloat((totalRating / count).toFixed(1)) : 0;
  };

  const addReview = async (
    review: Omit<
      ReviewType,
      "id" | "userId" | "userName" | "userAvatar" | "date"
    >,
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newReview: ReviewType = {
        id: `review${Date.now()}`,
        userId: user.id,
        userName: user.firstName,
        userAvatar: user.imageUrl,
        date: new Date().toISOString(),
        ...review,
      };

      setReviews((prevReviews) => [...prevReviews, newReview]);

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      return true;
    } catch (err) {
      errorLogger("Error adding review:", err);
      setError("Failed to submit review");

      toast({
        title: "Error",
        description: "Failed to submit your review. Please try again.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReview = async (
    reviewId: string,
    reviewUpdate: Partial<ReviewType>,
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update a review",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const reviewToUpdate = reviews.find((r) => r.id === reviewId);

      if (!reviewToUpdate) {
        setError("Review not found");
        return false;
      }

      if (reviewToUpdate.userId !== user.id) {
        setError("You can only update your own reviews");
        return false;
      }

      setReviews((prevReviews) =>
        prevReviews.map((r) =>
          r.id === reviewId ? { ...r, ...reviewUpdate } : r,
        ),
      );

      toast({
        title: "Review updated",
        description: "Your review has been updated successfully",
      });

      return true;
    } catch (err) {
      errorLogger("Error updating review:", err);
      setError("Failed to update review");

      toast({
        title: "Error",
        description: "Failed to update your review. Please try again.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete a review",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const reviewToDelete = reviews.find((r) => r.id === reviewId);

      if (!reviewToDelete) {
        setError("Review not found");
        return false;
      }

      if (reviewToDelete.userId !== user.id) {
        setError("You can only delete your own reviews");
        return false;
      }

      setReviews((prevReviews) => prevReviews.filter((r) => r.id !== reviewId));

      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully",
      });

      return true;
    } catch (err) {
      errorLogger("Error deleting review:", err);
      setError("Failed to delete review");

      toast({
        title: "Error",
        description: "Failed to delete your review. Please try again.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReviewContext.Provider
      value={{
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
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews(): ReviewContextType {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewProvider");
  }
  return context;
}
