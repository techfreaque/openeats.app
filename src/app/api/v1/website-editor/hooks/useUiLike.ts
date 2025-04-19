import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useCallback, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import toggleLikeEndpoint from "../ui/like/definition";
import type {
  ToggleLikeRequestType,
  ToggleLikeResponseType,
} from "../ui/like/schema";

/**
 * Hook to toggle like on a UI component
 * @param initialLiked - Whether the UI component is initially liked
 * @returns The toggle like mutation
 */
export function useUiLike(initialLiked = false) {
  const [liked, setLiked] = useState(initialLiked);
  const { user, isLoggedIn } = useAuth();

  const mutation = useApiMutation<
    ToggleLikeRequestType,
    ToggleLikeResponseType
  >(toggleLikeEndpoint.POST, {
    onSuccess: ({ responseData }) => {
      if (responseData) {
        setLiked(responseData.liked);
      }
    },
    onError: (error) => {
      errorLogger("Error toggling like:", error);
    },
  });

  const toggleLike = useCallback(
    async (UIId: string) => {
      if (!isLoggedIn) {
        return { liked: false };
      }

      try {
        const result = await mutation.mutateAsync({
          requestData: { UIId },
        });

        return result.responseData || { liked: false };
      } catch (error) {
        errorLogger("Error toggling like:", error);
        return { liked: false };
      }
    },
    [isLoggedIn, mutation],
  );

  return {
    liked,
    toggleLike,
    isLoading: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error,
  };
}
