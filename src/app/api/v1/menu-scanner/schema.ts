import { z } from "zod";

/**
 * Menu Scanner API schemas
 * Provides menu scanning functionality using AI
 */

/**
 * Menu scanner request schema
 * Note: This is for form data, not JSON
 */
export const menuScannerRequestSchema = z.object({
  image: z.instanceof(File),
  restaurantId: z.string().uuid(),
});
export type MenuScannerRequestType = z.infer<typeof menuScannerRequestSchema>;

/**
 * Menu item from scanner schema
 */
export const menuItemFromScannerSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
});
export type MenuItemFromScannerType = z.infer<typeof menuItemFromScannerSchema>;

/**
 * Menu scanner response schema
 */
export const menuScannerResponseSchema = z.object({
  menuItems: z.array(menuItemFromScannerSchema),
  raw: z.string().optional(),
});
export type MenuScannerResponseType = z.infer<typeof menuScannerResponseSchema>;
