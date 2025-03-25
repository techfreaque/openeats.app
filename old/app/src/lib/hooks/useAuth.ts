import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { useUserType } from "../../app/context/UserTypeContext";
import type { User } from "../../types";
import { authApi, isApiAvailable } from "../api-client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUserType } = useUserType();

  // Function to check current authentication status
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to get from API
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        const response = await authApi.getCurrentUser();
        if (response.user) {
          const userData = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            phone: "", // API might not provide this
            image: "", // API might not provide this
            type: response.user.role,
          };
          setUser(userData);

          // Update user type context
          setUserType(userData.type);

          // Store in local storage as backup
          await AsyncStorage.setItem("user", JSON.stringify(userData));

          return userData;
        }
      }

      // If API is not available or user is not authenticated, try local storage
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser) as User;
        setUser(userData);
        setUserType(userData.type);
        return userData;
      }

      // No authenticated user found
      setUser(null);
      return null;
    } catch (err) {
      console.error("Error checking auth status:", err);
      setError("Authentication check failed");

      // Try local storage as fallback
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser) as User;
          setUser(userData);
          setUserType(userData.type);
          return userData;
        }
      } catch (storageErr) {
        console.error("Error reading stored user data:", storageErr);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setUserType]);

  // Initialize on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        const response = await authApi.login({ email, password, role });
        if (response.user) {
          const userData = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            phone: "", // API might not provide this
            image: "", // API might not provide this
            type: response.user.role,
          };
          setUser(userData);
          setUserType(userData.type);
          await AsyncStorage.setItem("user", JSON.stringify(userData));
          return userData;
        }
      }

      // For demo/development, allow mock login if API is not available
      if (email === "demo@example.com" && password === "password") {
        const mockUser = {
          id: "mock-user-id",
          name: "Demo User",
          email: "demo@example.com",
          phone: "555-123-4567",
          image:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          type: (role || "customer") as any,
        };

        setUser(mockUser);
        setUserType(mockUser.type);
        await AsyncStorage.setItem("user", JSON.stringify(mockUser));
        return mockUser;
      }

      setError("Invalid email or password");
      return null;
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role?: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        const response = await authApi.signup({ name, email, password, role });
        if (response.user) {
          // In most APIs, signup doesn't automatically log in the user
          // So we'll call login after successful signup
          return await login(email, password, role);
        }
      }

      // For demo/development, allow mock signup if API is not available
      const mockUser = {
        id: `mock-user-id-${Date.now()}`,
        name,
        email,
        phone: "",
        image: "",
        type: (role || "customer") as any,
      };

      setUser(mockUser);
      setUserType(mockUser.type);
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      return mockUser;
    } catch (err) {
      console.error("Signup error:", err);
      setError("Signup failed. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        await authApi.logout();
      }

      // Clear local storage and state regardless of API status
      await AsyncStorage.removeItem("user");
      setUser(null);
      setUserType("customer"); // Reset to default user type
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuthStatus,
  };
}
