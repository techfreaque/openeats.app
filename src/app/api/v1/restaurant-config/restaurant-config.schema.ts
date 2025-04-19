import { z } from "zod";

// Theme schema
const restaurantThemeSchema = z.object({
  theme: z.enum([
    "default",
    "modern",
    "classic",
    "minimal",
    "elegant",
    "bold",
  ]),
  primaryColor: z.string(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
});

// Hero schema
const heroContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  showLogo: z.boolean().optional(),
  logoPosition: z.enum(["center", "left", "right"]).optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
});

const restaurantHeroSchema = z.object({
  showHero: z.boolean(),
  heroHeight: z.enum(["small", "medium", "large"]),
  heroStyle: z.enum(["image", "video", "carousel", "parallax", "split"]),
  heroContent: heroContentSchema.optional(),
});

// Featured collection schema
const featuredCollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  itemIds: z.array(z.string()),
  displayStyle: z.enum(["grid", "carousel", "list", "featured"]).optional(),
  backgroundColor: z.string().optional(),
});

// Special offer schema
const specialOfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  discount: z.string().optional(),
  validUntil: z.string().optional(),
  image: z.string().optional(),
  itemIds: z.array(z.string()).optional(),
});

// Story schema
const storySchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
});

// Custom section item schema
const customSectionItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  link: z.string().optional(),
  order: z.number().optional(),
});

// Custom section schema
const customSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().optional(),
  type: z.enum([
    "text",
    "image-text",
    "gallery",
    "testimonials",
    "menu-preview",
  ]),
  backgroundColor: z.string().optional(),
  items: z.array(customSectionItemSchema).optional(),
});

// Social link schema
const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
  icon: z.string().optional(),
});

// Order options schema
const orderOptionsSchema = z.object({
  delivery: z.boolean(),
  pickup: z.boolean(),
  dineIn: z.boolean(),
});

// Menu category schema
const menuCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
});

// Page schema
const pageSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  order: z.number(),
});

// Restaurant config schema
export const restaurantConfigSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  theme: restaurantThemeSchema,
  hero: restaurantHeroSchema,
  layout: z.enum([
    "standard",
    "featured",
    "grid",
    "magazine",
    "fullwidth",
  ]),
  featuredItems: z.array(z.string()),
  featuredCollections: z.array(featuredCollectionSchema),
  specialOffers: z.array(specialOfferSchema).optional(),
  showReviews: z.boolean(),
  showGallery: z.boolean(),
  galleryStyle: z.enum(["grid", "masonry", "carousel"]).optional(),
  showChef: z.boolean().optional(),
  showStory: z.boolean().optional(),
  story: storySchema.optional(),
  showLocation: z.boolean().optional(),
  showHours: z.boolean().optional(),
  customSections: z.array(customSectionSchema).optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  orderOptions: orderOptionsSchema,
  menuStyle: z.enum(["tabs", "accordion", "sections", "grid"]).optional(),
  menuCategories: z.array(menuCategorySchema).optional(),
  pages: z.array(pageSchema).optional(),
});

export type RestaurantConfigType = z.infer<typeof restaurantConfigSchema>;

// Restaurant config get request schema
export const restaurantConfigGetSchema = z.object({
  restaurantId: z.string(),
});
export type RestaurantConfigGetType = z.infer<typeof restaurantConfigGetSchema>;
