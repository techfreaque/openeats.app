import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// Define the different user types
export type UserType = "customer" | "restaurant" | "driver";

// Context interface
interface UserTypeContextType {
  userType: UserType;
  setUserType: (type: UserType) => Promise<void>;
  isLoading: boolean;
}

// Create the context with default values
const UserTypeContext = createContext<UserTypeContextType>({
  userType: "customer",
  setUserType: async () => {},
  isLoading: true,
});

// Custom hook to use the user type context
export const useUserType = () => useContext(UserTypeContext);

// Provider component
export const UserTypeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userType, setUserTypeState] = useState<UserType>("customer");
  const [isLoading, setIsLoading] = useState(true);

  // Load the user type from storage on mount
  useEffect(() => {
    const loadUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem("userType");
        if (storedUserType) {
          setUserTypeState(storedUserType as UserType);
        }
      } catch (error) {
        console.error("Error loading user type from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserType();
  }, []);

  // Update the user type in storage when it changes
  const setUserType = async (type: UserType) => {
    try {
      await AsyncStorage.setItem("userType", type);
      setUserTypeState(type);
    } catch (error) {
      console.error("Error saving user type to storage:", error);
    }
  };

  const value: UserTypeContextType = {
    userType,
    setUserType,
    isLoading,
  };

  return (
    <UserTypeContext.Provider value={value}>
      {children}
    </UserTypeContext.Provider>
  );
};
