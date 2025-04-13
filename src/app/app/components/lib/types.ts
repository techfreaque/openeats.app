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

export interface RestaurantThemeType {
  theme: "default" | "modern" | "classic" | "minimal" | "elegant" | "bold";
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
  items?: any[];
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

export interface RestaurantConfigType {
  theme: RestaurantThemeType;
  hero: RestaurantHeroType;
  layout: "standard" | "featured" | "grid" | "magazine" | "fullwidth";
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
    showLogo?: boolean;
    logoPosition?: "center" | "left" | "right";
    title?: string;
    subtitle?: string;
    ctaLink?: string;
    ctaText?: string;
  };
  heroStyle?: "carousel" | "parallax" | "split" | "image";
  heroHeight?: "small" | "medium" | "large";
  reservations?: boolean;
  menuStyle?: "tabs" | "accordion" | "sections" | "grid";
  menuCategories?: RestaurantMenuCategoryType[];
  pages?: RestaurantPageType[];
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
