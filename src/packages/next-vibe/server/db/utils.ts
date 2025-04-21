/**
 * Database utilities
 * Provides helper functions for database operations
 */

import { debugLogger } from "../../shared/utils/logger";

/**
 * Safely serialize an object by removing circular references
 * This is useful for logging and debugging database objects
 * 
 * @param obj - The object to serialize
 * @returns A serializable version of the object
 */
export function safeSerialize<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Use a WeakMap to track visited objects and avoid circular references
  const seen = new WeakMap();
  
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      // Skip special properties that might cause circular references
      if (key === 'table' || key === '_') {
        return undefined;
      }
      
      // Handle non-object values normally
      if (typeof value !== 'object' || value === null) {
        return value;
      }
      
      // Handle Date objects
      if (value instanceof Date) {
        return value;
      }
      
      // Check for circular references
      if (seen.has(value)) {
        // For circular references, return a simplified version
        if (typeof value.toString === 'function' && value.toString !== Object.prototype.toString) {
          return value.toString();
        }
        return '[Circular]';
      }
      
      // Track this object to detect circular references
      seen.set(value, true);
      return value;
    })
  );
}

/**
 * Safely process database results to remove circular references
 * This is useful for returning database objects from repositories
 * 
 * @param results - The database results to process
 * @returns Processed results without circular references
 */
export function processDatabaseResults<T>(results: T): T {
  try {
    return safeSerialize(results);
  } catch (error) {
    debugLogger('Error processing database results:', error);
    // If serialization fails, return the original results
    return results;
  }
}
