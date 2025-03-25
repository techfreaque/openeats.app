import Constants from "expo-constants";

// Get the backend URL from environment variables
const BACKEND_URL =
  Constants.expoConfig?.extra?.BACKEND_URL || "http://localhost:3000";

// Base API client for making authenticated requests
export async function apiRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
) {
  try {
    console.log(`Making ${method} request to ${BACKEND_URL}${endpoint}`);

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      // Include credentials to send cookies with requests
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      if (isJson) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `API request failed with status ${response.status}`,
        );
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    // Return JSON data if the response is JSON, otherwise return the response object
    return isJson ? await response.json() : { success: true };
  } catch (error) {
    console.error(`API ${method} ${endpoint} error:`, error);
    throw error;
  }
}

// Authentication API
export const authApi = {
  signup: async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    return apiRequest("/api/auth/signup", "POST", data);
  },

  login: async (data: { email: string; password: string; role?: string }) => {
    return apiRequest("/api/auth/login", "POST", data);
  },

  logout: async () => {
    return apiRequest("/api/auth/logout", "POST");
  },

  getCurrentUser: async () => {
    return apiRequest("/api/auth/me");
  },
};

// Cart API
export const cartApi = {
  getCart: async () => {
    return apiRequest("/api/cart");
  },

  addToCart: async (data: {
    menuItemId: string;
    restaurantId: string;
    quantity: number;
  }) => {
    return apiRequest("/api/cart", "POST", data);
  },

  updateCartItem: async (cartItemId: string, quantity: number) => {
    return apiRequest(`/api/cart/${cartItemId}`, "PUT", { quantity });
  },

  removeCartItem: async (cartItemId: string) => {
    return apiRequest(`/api/cart/${cartItemId}`, "DELETE");
  },

  clearCart: async () => {
    return apiRequest("/api/cart/clear", "DELETE");
  },
};

// Restaurant API
export const restaurantApi = {
  getAllRestaurants: async (params?: {
    category?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) {
      queryParams.append("category", params.category);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/restaurants${queryString ? `?${queryString}` : ""}`;

    return apiRequest(endpoint);
  },

  getRestaurant: async (id: string) => {
    return apiRequest(`/api/restaurants/${id}`);
  },

  createRestaurant: async (data: {
    name: string;
    category: string;
    image?: string;
    deliveryTime?: number;
    address: string;
    description: string;
  }) => {
    return apiRequest("/api/restaurants", "POST", data);
  },

  updateRestaurant: async (id: string, data: any) => {
    return apiRequest(`/api/restaurants/${id}`, "PUT", data);
  },
};

// Menu Items API
export const menuItemsApi = {
  getMenuItems: async (restaurantId: string) => {
    return apiRequest(`/api/restaurants/${restaurantId}/menu`);
  },

  getMenuItem: async (restaurantId: string, itemId: string) => {
    return apiRequest(`/api/restaurants/${restaurantId}/menu/${itemId}`);
  },

  createMenuItem: async (
    restaurantId: string,
    data: {
      name: string;
      description: string;
      price: number;
      category: string;
      image?: string;
    },
  ) => {
    return apiRequest(`/api/restaurants/${restaurantId}/menu`, "POST", data);
  },

  updateMenuItem: async (restaurantId: string, itemId: string, data: any) => {
    return apiRequest(
      `/api/restaurants/${restaurantId}/menu/${itemId}`,
      "PUT",
      data,
    );
  },

  deleteMenuItem: async (restaurantId: string, itemId: string) => {
    return apiRequest(
      `/api/restaurants/${restaurantId}/menu/${itemId}`,
      "DELETE",
    );
  },
};

// Orders API
export const ordersApi = {
  getOrders: async (params?: { status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/orders${queryString ? `?${queryString}` : ""}`;

    return apiRequest(endpoint);
  },

  getOrder: async (id: string) => {
    return apiRequest(`/api/orders/${id}`);
  },

  createOrder: async (data: {
    restaurantId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: Array<{
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    total: number;
    paymentMethod: string;
  }) => {
    return apiRequest("/api/orders", "POST", data);
  },

  updateOrderStatus: async (id: string, status: string) => {
    return apiRequest(`/api/orders/${id}`, "PUT", { status });
  },
};

// Driver API
export const driverApi = {
  getAllDrivers: async () => {
    return apiRequest("/api/drivers");
  },

  updateDriverProfile: async (data: {
    vehicleType: string;
    licenseNumber: string;
    isActive: boolean;
    currentLat?: number;
    currentLng?: number;
  }) => {
    return apiRequest("/api/drivers", "POST", data);
  },

  getDeliveries: async (status?: string) => {
    const queryParams = status ? `?status=${status}` : "";
    return apiRequest(`/api/driver/deliveries${queryParams}`);
  },
};

// Mock API fallback for when backend is not available
export const mockApiClient = {
  getRestaurants: async () => {
    // Return mock restaurant data
    return [
      {
        id: "1",
        name: "Burger Palace",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "American",
        rating: 4.8,
        deliveryTime: "15-25 min",
        address: "123 Main St, Anytown",
        description: "The best burgers in town",
      },
      // ...more restaurants
    ];
  },

  getMenuItems: async (restaurantId: string) => {
    // Return mock menu items
    return [
      {
        id: "101",
        restaurantId: "1",
        name: "Classic Burger",
        description: "Beef patty with lettuce, tomato, and special sauce",
        price: 9.99,
        category: "Burgers",
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        available: true,
      },
      // ...more menu items
    ];
  },
};

// Check if API is available - can be used to fall back to local storage
export async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch (error) {
    console.error("API availability check failed:", error);
    return false;
  }
}
