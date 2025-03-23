import { useApiForm } from "next-query-portal/client/hooks/form";
import { useApiMutation } from "next-query-portal/client/hooks/mutation";
import { useApiQuery } from "next-query-portal/client/hooks/query";
import {
  isAuthenticated,
  removeAuthToken,
  setAuthToken,
} from "next-query-portal/client/storage/auth-client";
import { errorLogger } from "next-query-portal/shared/utils/logger";
import { useEffect } from "react";

import logoutEndpoint from "@/app/api/auth/logout/definition";
import loginEndpoint from "@/app/api/auth/public/login/definition";
import registerEndpoint from "@/app/api/auth/public/register/definition";

import meEndpoint from "../app/api/auth/me/definition";
import type { UserResponseType } from "../app/api/auth/me/schema";

export interface AuthState {
  user: UserResponseType | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export interface UseAuthReturn extends AuthState {
  loginForm: ReturnType<typeof useApiForm<typeof loginEndpoint>>;
  signupForm: ReturnType<typeof useApiForm<typeof registerEndpoint>>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  // Use useApiQuery for ME endpoint with proper dependencies
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useApiQuery(meEndpoint, {
    // Only enable the query when authenticated
    enabled: true, // Initially disabled, we'll check auth first
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
  }, []);

  // Set up API forms for login and signup
  const loginForm = useApiForm(loginEndpoint, {
    onSuccess: async (response) => {
      if (response?.token) {
        await setAuthToken(response.token);
        await refetch();
      }
    },
  });
  const signupForm = useApiForm(registerEndpoint, {
    onSuccess: async (response) => {
      if (response?.token) {
        await setAuthToken(response.token);
        await refetch();
      }
    },
  });

  const logout = useApiMutation(logoutEndpoint, {
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
    user: user || null,
    isLoggedIn: !!user && !isError,
    isLoading,
    loginForm,
    signupForm,
    logout: () => logout.mutate({ data: undefined, urlParams: undefined }),
  };
}
