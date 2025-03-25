export type Address = {
  id: string;
  address: string;
  is_default: boolean;
  synced?: boolean;
};

export type PaymentMethod = {
  id: string;
  type: string;
  last4: string;
  is_default: boolean;
  synced?: boolean;
};

export type CartItem = {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  synced?: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  available?: boolean;
  restaurantId?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
  address: string;
  description?: string;
};

export type Order = {
  id: string;
  customer_id: string;
  restaurant_id: string;
  restaurant_name: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  address: string;
  payment_method: string;
  created_at: string;
  synced?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
};

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "picked up"
  | "out for delivery"
  | "delivered"
  | "cancelled";

export type RestaurantCategory =
  | "American"
  | "Italian"
  | "Japanese"
  | "Mexican"
  | "Chinese"
  | "Healthy"
  | "Indian"
  | "Mediterranean";

export type UserType = "customer" | "restaurant" | "driver";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  type: UserType;
};

export type DeliveryPerson = {
  id: string;
  name: string;
  phone: string;
  image: string;
};

export type Delivery = {
  id: string;
  order_id: string;
  driver_id: string;
  status: "assigned" | "picked up" | "delivered" | "cancelled";
  pickup_time?: string;
  delivery_time?: string;
  estimated_delivery_time: string;
  distance: string;
};

// API response types
export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CartResponse {
  cartItems: CartItem[];
}

export interface RestaurantsResponse {
  restaurants: Restaurant[];
}

export interface RestaurantDetailResponse {
  restaurant: Restaurant;
  menuItems: MenuItem[];
}

export interface OrdersResponse {
  orders: Order[];
}

export interface OrderDetailResponse {
  order: Order;
}
