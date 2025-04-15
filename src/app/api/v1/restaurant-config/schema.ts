import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }),
  image: z.string().url({ message: "Image must be a valid URL" }),
  parentCategoryId: z.string().uuid().optional().nullable(),
  published: z.boolean().optional().default(true),
});
export type CategoryCreateType = z.input<typeof categoryCreateSchema>;

export const categoryUpdateSchema = categoryCreateSchema.extend({
  id: z.string().uuid(),
});
export type CategoryUpdateType = z.input<typeof categoryUpdateSchema>;

export const categoryResponseSchema = categoryUpdateSchema;
export type CategoryResponseType = z.input<typeof categoryResponseSchema>;

export enum RestaurantLayoutType {
  STANDARD = "standard",
  FEATURED = "featured",
  GRID = "grid",
  MAGAZINE = "magazine",
  FULLWIDTH = "fullwidth",
}

export interface RestaurantConfigType {
  theme: RestaurantThemeConfigType;
  hero: RestaurantHeroType;
  layout: RestaurantThemeConfigType;
  featuredItems: string[];
  featuredCollections: RestaurantFeaturedCollectionType[];
  specialOffers?: RestaurantSpecialOfferType[];
  showReviews: boolean;
  showGallery: boolean;
  galleryStyle?: "grid" | "masonry" | "carousel";
  showChef?: boolean;
  showStory?: boolean;
  story?: RestaurantStoryType;
  showLocation?: boolean;
  showHours?: boolean;
  customSections?: RestaurantCustomSectionType[];
  socialLinks?: RestaurantSocialLinkType[];
  orderOptions: {
    delivery: boolean;
    pickup: boolean;
    dineIn: boolean;
  };
  heroContent?: {
    showLogo?: string;
    logoPosition?: string;
    title?: string;
    subtitle?: string;
    ctaLink?: string;
    ctaText?: string;
  };
  heroStyle: "carousel" | "parallax" | "split";
  heroHeight: "small" | "large";
  reservations?: boolean;
  menuStyle?: "tabs" | "accordion" | "sections" | "grid";
  menuCategories?: RestaurantMenuCategoryType[];
  pages?: RestaurantPageType[];
}

export interface RestaurantType {
  id: string;
  name: string;
  image: string;
  categories: string[];
  rating: number;
  reviews: number;
  deliveryTime: number;
  deliveryFee: number;
  promoted?: boolean;
  pickup?: boolean;
  address: string;
  description: string;
}

export interface MenuItemType {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
}

export interface ReviewType {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | undefined;
  restaurantId: string;
  restaurantRating: number;
  restaurantComment?: string | undefined;
  productReviews: {
    productId: string;
    productName: string;
    rating: number;
    comment?: string;
  }[];
  date: string;
}

export interface RestaurantPageType {
  id: string;
  name: string;
  slug: string;
  title?: string;
  content?: string;
  order: number;
}

export type OrderType = "delivery" | "pickup" | "dineIn";

export type RestaurantThemeType =
  | "default"
  | "modern"
  | "classic"
  | "minimal"
  | "elegant"
  | "bold";

export interface RestaurantThemeConfigType {
  theme: RestaurantThemeType;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export interface RestaurantHeroType {
  showHero: boolean;
  heroHeight: "small" | "medium" | "large";
  heroStyle: "image" | "video" | "carousel" | "parallax" | "split";
  heroContent?: {
    title?: string;
    subtitle?: string;
    showLogo?: boolean;
    logoPosition?: "center" | "left" | "right";
    ctaText?: string;
    ctaLink?: string;
  };
}

export interface RestaurantFeaturedCollectionType {
  id: string;
  title: string;
  description?: string;
  itemIds: string[];
  displayStyle?: "grid" | "carousel" | "list" | "featured";
  backgroundColor?: string;
}

export interface RestaurantSpecialOfferType {
  id: string;
  title: string;
  description?: string;
  discount?: string;
  validUntil?: string;
  image?: string;
  itemIds?: string[];
}

export interface RestaurantStoryType {
  title?: string;
  content?: string;
  image?: string;
}

export interface RestaurantCustomSectionType {
  id: string;
  title: string;
  content?: string;
  type: "text" | "image-text" | "gallery" | "testimonials" | "menu-preview";
  backgroundColor?: string;
  items?: Array<CustomSectionItem>;
}

export interface CustomSectionItem {
  id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  order?: number;
}

export interface RestaurantSocialLinkType {
  platform: string;
  url: string;
  icon?: string;
}

export interface RestaurantMenuCategoryType {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface FilterOptions {
  category?: string;
  priceRange?: string[];
  dietary?: string[];
  sortBy?:
    | "relevance"
    | "rating"
    | "delivery-time"
    | "price-low"
    | "price-high";
  deliveryType?: "delivery" | "pickup" | "all";
}
