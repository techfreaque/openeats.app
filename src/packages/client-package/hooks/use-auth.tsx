"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { create } from "zustand";

import { useApiQuery } from "@/next-portal/client/api/use-api-query";
import { useApiMutation } from "@/next-portal/client/api/utils";
import {
  removeAuthToken,
  setAuthToken,
} from "@/next-portal/client/auth/auth-client";
import {
  generateStorageKey,
  setStorageItem,
} from "@/next-portal/client/storage/storage-client";
import type { UndefinedType } from "@/next-portal/types/common.schema";
import { errorLogger } from "@/next-portal/utils/logger";
import { parseError } from "@/next-portal/utils/parse-error";

import { backendPages } from "../constants";
import {
  loginEndpoint,
  logoutEndpoint,
  meEndpoint,
  registerEndpoint,
} from "../schema/api/apis";
import type {
  LoginFormType,
  LoginResponseType,
} from "../schema/api/v1/auth/public/login.schema";
import type { RegisterType } from "../schema/schemas";

interface AuthState {
  user: LoginResponseType | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isLoadingInitial: boolean;
  error: Error | null;
  statusMessage: string;
  setUser: (user: LoginResponseType | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsLoadingInitial: (isLoadingInitial: boolean) => void;
  setError: (error: Error | null) => void;
  setStatusMessage: (statusMessage: string) => void;
  login: (credentials: LoginFormType) => Promise<LoginResponseType | null>;
  logout: () => Promise<void>;
  signup: (formData: RegisterType) => Promise<LoginResponseType | null>;
}

// Create a zustand store for authentication state
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  isLoadingInitial: true,
  error: null,
  statusMessage: "",
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsLoadingInitial: (isLoadingInitial) => set({ isLoadingInitial }),
  setError: (error) => set({ error }),
  setStatusMessage: (statusMessage) => set({ statusMessage }),
  login: async () => null, // Will be implemented in the provider
  logout: async () => {}, // Will be implemented in the provider
  signup: async () => null, // Will be implemented in the provider
}));

// Provider component to initialize auth state
export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    setUser,
    setIsLoading,
    setIsLoadingInitial,
    setError,
    setStatusMessage,
  } = useAuthStore();

  // Query to fetch the current user
  const {
    data: user,
    isLoading,
    error,
    isLoadingFresh: isLoadingInitial,
    statusMessage,
  } = useApiQuery(meEndpoint, undefined, undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache the user data for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Update store when user data changes
  useEffect(() => {
    setUser(user || null);
    setIsLoading(isLoading);
    setIsLoadingInitial(isLoadingInitial);
    setError(error);
    setStatusMessage(statusMessage || "");
  }, [
    user,
    isLoading,
    isLoadingInitial,
    error,
    statusMessage,
    setUser,
    setIsLoading,
    setIsLoadingInitial,
    setError,
    setStatusMessage,
  ]);

  // Mutation for login
  const loginMutation = useApiMutation<
    LoginResponseType,
    LoginFormType,
    UndefinedType
  >(loginEndpoint, {
    onSuccess: async (data) => {
      if (data.token) {
        await setAuthToken(data.token);
        queryClient.setQueryData(loginEndpoint.apiQueryOptions.queryKey, data);
        const storageKey = generateStorageKey(
          loginEndpoint.apiQueryOptions.queryKey,
        );
        void setStorageItem<LoginResponseType>(storageKey, data);
        router.push(backendPages.home);
      }
    },
  });

  // Mutation for signup
  const signupMutation = useApiMutation<
    LoginResponseType,
    RegisterType,
    UndefinedType
  >(registerEndpoint, {
    onSuccess: async (data) => {
      if (data.token) {
        await setAuthToken(data.token);
        queryClient.setQueryData(
          registerEndpoint.apiQueryOptions.queryKey,
          data,
        );
        const storageKey = generateStorageKey(
          loginEndpoint.apiQueryOptions.queryKey,
        );
        void setStorageItem<LoginResponseType>(storageKey, data);
        router.push(backendPages.home);
      }
    },
  });

  const logoutMutation = useApiMutation(logoutEndpoint, {
    onSuccess: async () => {
      await removeAuthToken();
      queryClient.setQueryData(["user"], null);
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push(backendPages.login);
    },
    onError: async (err) => {
      errorLogger("An error occurred during logout", err);
      await removeAuthToken();
      queryClient.setQueryData(["user"], null);
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push(backendPages.login);
    },
  });

  // Implement login, logout, and signup functions once
  useEffect(() => {
    if (isInitialized) {
      return;
    }

    // Update store with actual implementation of auth methods
    useAuthStore.setState({
      login: async (
        credentials: LoginFormType,
      ): Promise<LoginResponseType | null> => {
        try {
          return loginMutation.mutateAsync(credentials);
        } catch (err) {
          const error = parseError(err);
          errorLogger(`An error occurred during login`, error);
          return null;
        }
      },
      signup: async (
        formData: RegisterType,
      ): Promise<LoginResponseType | null> => {
        try {
          return signupMutation.mutateAsync(formData);
        } catch (err) {
          const error = parseError(err);
          errorLogger(`An error occurred during signup`, error);
          return null;
        }
      },
      logout: async (): Promise<void> => {
        await logoutMutation.mutateAsync(undefined);
      },
    });

    setIsInitialized(true);
  }, [loginMutation, signupMutation, logoutMutation, isInitialized]);

  return <>{children}</>;
}

// Custom hook shorthand to use the auth store
export function useAuth() {
  return useAuthStore();
}
