import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the context type
type DatabaseContextType = {
  isDbReady: boolean;
};

// Create the context with a default value
const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Hook for consuming the context
export function useDatabase(): DatabaseContextType {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

// Provider component
export function DatabaseProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [isDbReady, setIsDbReady] = useState(false);

  // Initialize the database on component mount
  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Check if DB was initialized before
        const dbInitialized = await AsyncStorage.getItem('db_initialized');
        if (!dbInitialized) {
          // Here you would implement any database initialization logic
          // For example, creating tables, etc.
          
          // Mark as initialized
          await AsyncStorage.setItem('db_initialized', 'true');
        }
        
        // Set database as ready
        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        // Even on error, we'll consider the DB as "ready" to not block the app
        setIsDbReady(true);
      } finally {
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []);

  // Show loading state if needed
  if (isLoading) {
    // You could return a loading component here
    // For now, return null to not show anything
    return null;
  }

  // Provide the database context value
  return (
    <DatabaseContext.Provider value={{ isDbReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}
