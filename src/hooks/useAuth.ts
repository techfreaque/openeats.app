import { useApiMutation } from "next-query-portal/client/hooks/mutation";
import { useApiQuery } from "next-query-portal/client/hooks/query";
import {
  isAuthenticated,
  removeAuthToken,
  setAuthToken,
} from "next-query-portal/client/storage/auth-client";
import type { UndefinedType } from "next-query-portal/shared/types/common.schema";
import { errorLogger } from "next-query-portal/shared/utils/logger";
import { useEffect } from "react";

import logoutEndpoint from "@/app/api/v1/auth/logout/definition";
import meEndpoint from "@/app/api/v1/auth/me/definition";
import type {
  UserResponseType,
  UserUpdateRequestType,
} from "@/app/api/v1/auth/me/schema";
import loginEndpoint from "@/app/api/v1/auth/public/login/definition";
import type {
  LoginFormType,
  LoginResponseType,
} from "@/app/api/v1/auth/public/login/schema";
import registerEndpoint from "@/app/api/v1/auth/public/register/definition";
import type { RegisterType } from "@/app/api/v1/auth/public/register/schema";
import { useApiForm } from "@/packages/next-query-portal/client/hooks/form";

export interface UseAuthReturn {
  user: UserResponseType | undefined;
  isLoggedIn: boolean;
  isLoading: boolean;
  loginForm: ReturnType<
    typeof useApiForm<
      LoginFormType,
      UndefinedType,
      LoginResponseType,
      "default"
    >
  >;
  signupForm: ReturnType<
    typeof useApiForm<RegisterType, UndefinedType, LoginResponseType, "default">
  >;
  userForm: ReturnType<
    typeof useApiForm<
      UserUpdateRequestType,
      UndefinedType,
      UserResponseType,
      "default"
    >
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
    user: user?.user || undefined,
    isLoggedIn: !!user && !isError,
    isLoading,
    loginForm,
    signupForm,
    userForm,
    logout: () =>
      logout.mutate({ requestData: undefined, urlParams: undefined }),
  };
}
