import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiQuery } from "next-vibe/client/hooks/query";
import {
  isAuthenticated,
  removeAuthToken,
  setAuthToken,
} from "next-vibe/client/storage/auth-client";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { useEffect } from "react";

import logoutEndpoint from "@/app/api/v1/auth/logout/definition";
import meEndpoint from "@/app/api/v1/auth/me/definition";
import loginEndpoint from "@/app/api/v1/auth/public/login/definition";
import registerEndpoint from "@/app/api/v1/auth/public/register/definition";
import { useApiForm } from "next-vibe/client/hooks/mutation-form";

export type UseAuthReturn = ReturnType<typeof useAuth>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAuth() {
  // Use useApiQuery for ME endpoint with proper dependencies
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useApiQuery(meEndpoint.GET, undefined, undefined, {
    enabled: false, // Initially disabled, we'll check auth first
  });
  // Check authentication status and enable ME query if authenticated
  useEffect(() => {
    const checkAuthState = async (): Promise<void> => {
      try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          return; // Not authenticated, no need to fetch user data
        }

        // If authenticated, refetch the ME endpoint data
        await refetch();
      } catch (error) {
        errorLogger("Auth check failed:", error);
      }
    };

    void checkAuthState();
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up API forms for login and signup
  const loginForm = useApiForm(
    loginEndpoint.POST,
    {},
    {
      onSuccess: async ({ responseData }) => {
        if (responseData.token) {
          await setAuthToken(responseData.token);
          await refetch();
        }
      },
    },
  );
  const signupForm = useApiForm(
    registerEndpoint.POST,
    {},
    {
      onSuccess: async ({ responseData }) => {
        if (responseData.token) {
          await setAuthToken(responseData.token);
          await refetch();
        }
      },
    },
  );
  const userForm = useApiForm(
    meEndpoint.POST,
    {},
    {
      onSuccess: async () => {
        await refetch();
      },
    },
  );

  const logout = useApiMutation(logoutEndpoint.GET, {
    onSuccess: async () => {
      await removeAuthToken();
      await refetch();
    },
    onError: async () => {
      await removeAuthToken();
      await refetch();
    },
  });

  return {
    user: user?.user ?? undefined,
    isLoggedIn: !!user && !isError,
    isLoading,
    loginForm,
    signupForm,
    userForm,
    logout: (): void =>
      logout.mutate({ requestData: undefined, urlParams: undefined }),
  };
}
