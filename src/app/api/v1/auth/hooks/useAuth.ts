import type { ApiEndpoint } from "next-vibe/client/endpoint";
import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiForm } from "next-vibe/client/hooks/mutation-form";
import { useApiQuery } from "next-vibe/client/hooks/query";
import type { ApiFormReturn } from "next-vibe/client/hooks/types";
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

import type { UserResponseType, UserUpdateRequestType } from "../me/schema";
import type {
  LoginFormOutputType,
  LoginResponseOutputType,
} from "../public/login/schema";
import type { RegisterType } from "../public/register/schema";

/**
 * User data interface
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  [key: string]: unknown;
}

/**
 * Return type for useAuth hook
 */
export interface UseAuthReturnType {
  user: AuthUser | undefined;
  isLoggedIn: boolean;
  isLoading: boolean;
  loginForm: ApiFormReturn<
    LoginFormOutputType,
    LoginResponseOutputType,
    undefined
  >;
  signupForm: ApiFormReturn<RegisterType, LoginResponseOutputType, undefined>;
  userForm: ApiFormReturn<UserUpdateRequestType, UserResponseType, undefined>;
  logout: () => void;
}

/**
 * Hook for managing authentication state
 * @returns Authentication state and methods
 */
export function useAuth(): UseAuthReturnType {
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
        errorLogger("Auth check failed:", String(error));
      }
    };

    void checkAuthState();
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up API forms for login and signup
  // Properly type the login endpoint
  const loginForm = useApiForm<
    LoginFormOutputType,
    LoginResponseOutputType,
    undefined,
    string
  >(
    loginEndpoint.POST as unknown as ApiEndpoint<
      LoginFormOutputType,
      LoginResponseOutputType,
      undefined,
      string
    >,
    {},
    {
      onSuccess: async ({ responseData }) => {
        if (
          responseData &&
          typeof responseData === "object" &&
          "token" in responseData
        ) {
          await setAuthToken(String(responseData.token));
          await refetch();
        }
      },
    },
  );

  // Properly type the register endpoint
  const signupForm = useApiForm<
    RegisterType,
    LoginResponseOutputType,
    undefined,
    string
  >(
    registerEndpoint.POST as unknown as ApiEndpoint<
      RegisterType,
      LoginResponseOutputType,
      undefined,
      string
    >,
    {},
    {
      onSuccess: async ({ responseData }) => {
        if (
          responseData &&
          typeof responseData === "object" &&
          "token" in responseData
        ) {
          await setAuthToken(String(responseData.token));
          await refetch();
        }
      },
    },
  );

  // Properly type the me endpoint
  const userForm = useApiForm<
    UserUpdateRequestType,
    UserResponseType,
    undefined,
    string
  >(
    meEndpoint.POST as unknown as ApiEndpoint<
      UserUpdateRequestType,
      UserResponseType,
      undefined,
      string
    >,
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

  // Transform user data to match AuthUser interface
  const authUser = user?.user
    ? ({
        ...user.user,
        // Convert userRoles array to roles array
        roles: user.user.userRoles?.map((role) => String(role.role)) || [],
      } as AuthUser)
    : undefined;

  return {
    user: authUser,
    isLoggedIn: !!user && !isError,
    isLoading,
    loginForm,
    signupForm,
    userForm,
    logout: (): void =>
      logout.mutate({ requestData: undefined, urlParams: undefined }),
  };
}
