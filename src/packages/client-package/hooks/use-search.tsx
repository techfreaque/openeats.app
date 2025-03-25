"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { create } from "zustand";

import { useApiQuery } from "@/next-portal/client/api/use-api-query";
import { errorLogger } from "@/next-portal/utils/logger";
import { parseError } from "@/next-portal/utils/parse-error";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface SearchState {
  searchTerm: string;
  results: SearchResult[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  setSearchTerm: (term: string) => void;
  setResults: (results: SearchResult[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  performSearch: (term?: string) => Promise<void>;
  clearSearch: () => void;
}

// Search endpoint configuration
const searchEndpoint = {
  apiQueryOptions: {
    queryKey: ["search"],
    url: "/api/v1/search",
    method: "GET",
  },
};

// Create a zustand store for search state
export const useSearchStore = create<SearchState>((set, get) => ({
  searchTerm: "",
  results: [],
  isLoading: false,
  isError: false,
  error: null,
  setSearchTerm: (term) => set({ searchTerm: term }),
  setResults: (results) => set({ results }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isError: !!error }),
  performSearch: async () => {}, // Will be implemented in provider
  clearSearch: () => {}, // Will be implemented in provider
}));

// Provider component to initialize search functionality
export function SearchProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const { searchTerm, setResults, setIsLoading, setError } = useSearchStore();

  // Query to fetch search results
  const {
    data: results = [],
    isLoading,
    error,
    refetch,
  } = useApiQuery(searchEndpoint, { query: searchTerm }, undefined, {
    enabled: !!searchTerm,
    staleTime: 1000 * 60, // Cache results for 1 minute
  });

  // Update store when search results change
  useEffect(() => {
    setResults(results);
    setIsLoading(isLoading);
    setError(error || null);
  }, [results, isLoading, error, setResults, setIsLoading, setError]);

  // Implement performSearch and clearSearch once
  useEffect(() => {
    if (isInitialized) {
      return;
    }

    useSearchStore.setState({
      performSearch: async (term?: string): Promise<void> => {
        try {
          const state = useSearchStore.getState();
          const queryTerm = term !== undefined ? term : state.searchTerm;

          if (term !== undefined) {
            state.setSearchTerm(term);
          }

          if (queryTerm) {
            await refetch();
          }
        } catch (err) {
          const error = parseError(err);
          errorLogger(`An error occurred during search`, error);
        }
      },
      clearSearch: (): void => {
        useSearchStore.setState({ searchTerm: "", results: [] });
        queryClient.setQueryData(searchEndpoint.apiQueryOptions.queryKey, []);
      },
    });

    setIsInitialized(true);
  }, [queryClient, refetch, isInitialized]);

  return <>{children}</>;
}

// Custom hook to use the search state
export function useSearch() {
  return useSearchStore();
}
