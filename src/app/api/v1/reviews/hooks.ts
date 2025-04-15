"use client";

import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useApiStore } from "next-vibe/client/hooks/store";
import { useCallback, useMemo } from "react";

import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "@/translations";

import { useAuth } from "../auth/hooks/useAuth";
import reviewsEndpoints from "./definition";
import type {
  ReviewCreateType,
  ReviewResponseType,
  ReviewsResponseType,
  ReviewUpdateType,
} from "./schema";

/**
 * Hook for managing reviews
 * @returns Object with reviews data and methods to add/update/delete reviews
 */
export const useReviews = (restaurantId?: string) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const queryParams = restaurantId
    ? { restaurantId }
    : user
      ? { userId: user.id }
      : undefined;
  const queryKey = restaurantId
    ? ["reviews", restaurantId]
    : ["reviews", user?.id || "anonymous"];

  const {
    data,
    isLoading: isLoadingReviews,
    error,
  } = useApiQuery<
    Record<string, never>,
    ReviewsResponseType,
    Record<string, never>,
    "default"
  >(
    reviewsEndpoints.GET,
    {},
    {},
    {
      enabled: !!queryParams,
      queryKey,
    },
  );

  const { mutateAsync: addReviewMutation, isLoading: isAddingReview } =
    useApiMutation<
      ReviewResponseType,
      ReviewCreateType,
      Record<string, never>,
      "default"
    >(reviewsEndpoints.POST, {
      onSuccess: (responseData) => {
        toast({
          title: t("review.added", "Review submitted"),
          description: t(
            "review.addedDescription",
            "Thank you for your feedback!",
          ),
        });
        useApiStore.getState().invalidateQueries(queryKey);
      },
      onError: (data: {
        error: Error;
        requestData: ReviewCreateType;
        pathParams: Record<string, never>;
      }) => {
        toast({
          title: t("error", "Error"),
          description:
            data.error.message ||
            t("review.errorAdding", "Failed to submit review"),
          variant: "destructive",
        });
      },
    });

  const { mutateAsync: updateReviewMutation, isLoading: isUpdatingReview } =
    useApiMutation<
      ReviewResponseType,
      ReviewUpdateType,
      { id: string },
      "default"
    >(reviewsEndpoints.PUT, {
      onSuccess: (responseData) => {
        toast({
          title: t("review.updated", "Review updated"),
          description: t(
            "review.updatedDescription",
            "Your review has been updated successfully",
          ),
        });
        useApiStore.getState().invalidateQueries(queryKey);
      },
      onError: (data: {
        error: Error;
        requestData: ReviewUpdateType;
        pathParams: { id: string };
      }) => {
        toast({
          title: t("error", "Error"),
          description:
            data.error.message ||
            t("review.errorUpdating", "Failed to update review"),
          variant: "destructive",
        });
      },
    });

  const { mutateAsync: deleteReviewMutation, isLoading: isDeletingReview } =
    useApiMutation<undefined, undefined, { id: string }, "default">(
      reviewsEndpoints.DELETE,
      {
        onSuccess: () => {
          toast({
            title: t("review.deleted", "Review deleted"),
            description: t(
              "review.deletedDescription",
              "Your review has been deleted successfully",
            ),
          });
          useApiStore.getState().invalidateQueries(queryKey);
        },
        onError: (data: {
          error: Error;
          requestData: undefined;
          pathParams: { id: string };
        }) => {
          toast({
            title: t("error", "Error"),
            description:
              data.error.message ||
              t("review.errorDeleting", "Failed to delete review"),
            variant: "destructive",
          });
        },
      },
    );

  const addReview = useCallback(
    async (review: Omit<ReviewCreateType, "userId">): Promise<boolean> => {
      if (!user) {
        toast({
          title: t("auth.signInRequired", "Authentication required"),
          description: t(
            "auth.signInToReview",
            "Please sign in to leave a review",
          ),
          variant: "destructive",
        });
        return false;
      }

      try {
        await addReviewMutation({
          requestData: review as ReviewCreateType,
          urlParams: {},
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    [addReviewMutation, user, t],
  );

  const updateReview = useCallback(
    async (reviewId: string, review: ReviewUpdateType): Promise<boolean> => {
      if (!user) {
        toast({
          title: t("auth.signInRequired", "Authentication required"),
          description: t(
            "auth.signInToUpdateReview",
            "Please sign in to update a review",
          ),
          variant: "destructive",
        });
        return false;
      }

      try {
        await updateReviewMutation({
          requestData: review,
          urlParams: { id: reviewId },
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    [updateReviewMutation, user, t],
  );

  const deleteReview = useCallback(
    async (reviewId: string): Promise<boolean> => {
      if (!user) {
        toast({
          title: t("auth.signInRequired", "Authentication required"),
          description: t(
            "auth.signInToDeleteReview",
            "Please sign in to delete a review",
          ),
          variant: "destructive",
        });
        return false;
      }

      try {
        await deleteReviewMutation({
          requestData: undefined,
          urlParams: { id: reviewId },
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    [deleteReviewMutation, user, t],
  );

  const userReviews = useMemo(() => {
    if (!data || !user) {
      return [];
    }

    return data.filter((review) => review.userId === user.id);
  }, [data, user]);

  const restaurantReviews = useCallback(
    (restaurantId: string): ReviewResponseType[] => {
      if (!data) {
        return [];
      }

      return data.filter((review) => review.restaurantId === restaurantId);
    },
    [data],
  );

  const productReviews = useCallback(
    (productId: string): ReviewResponseType[] => {
      if (!data) {
        return [];
      }

      return data.filter((review) =>
        review.productReviews.some((pr) => pr.productId === productId),
      );
    },
    [data],
  );

  const getAverageRestaurantRating = useCallback(
    (restaurantId: string): number => {
      const reviews = restaurantReviews(restaurantId);
      if (reviews.length === 0) {
        return 0;
      }

      const sum = reviews.reduce(
        (acc, review) => acc + review.restaurantRating,
        0,
      );
      return Number.parseFloat((sum / reviews.length).toFixed(1));
    },
    [restaurantReviews],
  );

  const getAverageProductRating = useCallback(
    (productId: string): number => {
      const reviews = productReviews(productId);
      if (reviews.length === 0) {
        return 0;
      }

      let totalRating = 0;
      let count = 0;

      reviews.forEach((review) => {
        const productReview = review.productReviews.find(
          (pr) => pr.productId === productId,
        );
        if (productReview) {
          totalRating += productReview.rating;
          count++;
        }
      });

      return count > 0
        ? Number.parseFloat((totalRating / count).toFixed(1))
        : 0;
    },
    [productReviews],
  );

  return {
    reviews: data || [],
    userReviews,
    restaurantReviews,
    productReviews,
    isLoading:
      isLoadingReviews ||
      isAddingReview ||
      isUpdatingReview ||
      isDeletingReview,
    error,
    addReview,
    updateReview,
    deleteReview,
    getAverageRestaurantRating,
    getAverageProductRating,
  };
};
