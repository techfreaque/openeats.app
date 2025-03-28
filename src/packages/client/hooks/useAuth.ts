import { useApiForm } from "@/packages/next-vibe/client/hooks/form";
import { useApiMutation } from "next-vibeibe/client/hooks/mutation";
import { useApiQuery } from "next-vibeibe/client/hooks/query";
import {
  isAuthenticated,
  removeAuthToken,
  setAuthToken,
} from "next-vibeibe/client/storage/auth-client";
import type { UndefinedType } from "next-vibeibe/shared/types/common.schema";
import { errorLogger } from "next-vibeibe/shared/utils/logger";
import { useEffect } from "react";

import logoutEndpoint from "@/app/api/v1/auth/logout/definition";
import meEndpoint from "@/app/api/v1/auth/me/definition";
import type { UserResponseType } from "@/app/api/v1/auth/me/schema/user.schema";
import loginEndpoint from "@/app/api/v1/auth/public/login/definition";
import type {
  LoginFormType,
  LoginResponseType,
} from "@/app/api/v1/auth/public/login/schema";
import registerEndpoint from "@/app/api/v1/auth/public/register/definition";
import type { RegisterType } from "@/app/api/v1/auth/public/register/schema";

export interface AuthState {
  user: UserResponseType | undefined;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export interface UseAuthReturn extends AuthState {
  loginForm: ReturnType<
    typeof useApiForm<LoginFormType, UndefinedType, LoginResponseType>
  >;
  signupForm: ReturnType<
    typeof useApiForm<RegisterType, UndefinedType, LoginResponseType>
  >;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  // Use useApiQuery for ME endpoint with proper dependencies
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useApiQuery(meEndpoint.GET, {
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
        if (responseData?.token) {
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
        if (responseData?.token) {
          await setAuthToken(responseData.token);
          await refetch();
        }
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
    user: user?.user || undefined,
    isLoggedIn: !!user && !isError,
    isLoading,
    loginForm,
    signupForm,
    logout: () =>
      logout.mutate({ requestData: undefined, urlParams: undefined }),
  };
}
