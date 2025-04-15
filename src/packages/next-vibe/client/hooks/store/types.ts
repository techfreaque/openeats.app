/**
 * Extended ApiStore interface with customState support
 * This file adds type definitions for the customState property used in zustand stores
 */

import type { ApiStore } from "./index";

/**
 * Extended ApiStore interface with customState property
 */
export interface ExtendedApiStore extends ApiStore {
  /**
   * Custom state for storing application-specific data
   */
  customState: Record<string, unknown>;
}
