import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

// Create a web-compatible version of the database
const openDatabase = () => {
  if (Platform.OS === "web") {
    // Return a mock database implementation for web
    return {
      transaction: (callback) => {
        const tx = {
          executeSql: (query, params, successCallback) => {
            // For web, we'll use localStorage to simulate basic database operations
            // This is a simplified implementation for demo purposes
            if (successCallback) {
              // Mock successful query with empty results
              successCallback(tx, { rows: { _array: [], length: 0 } });
            }
            return true;
          },
        };
        callback(tx);
      },
      closeAsync: async () => {},
      deleteAsync: async () => {},
    };
  } else {
    // Use actual SQLite for native platforms
    return SQLite.openDatabase("openeats.db");
  }
};

// Open the database
export const db = openDatabase();

// Initialize the database
export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    if (Platform.OS === "web") {
      // For web, we'll use localStorage instead of SQLite
      console.log("Using localStorage for web platform instead of SQLite");
      resolve();
      return;
    }

    db.transaction((tx) => {
      // Create restaurants table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS restaurants (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          image TEXT NOT NULL,
          rating REAL NOT NULL,
          deliveryTime TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          address TEXT,
          synced INTEGER DEFAULT 0
        )`,
        [],
        () => {
          console.log("Restaurants table created successfully");
        },
        (_, error) => {
          console.error("Error creating restaurants table:", error);
          reject(error);
          return false;
        },
      );

      // Create menu_items table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS menu_items (
          id TEXT PRIMARY KEY,
          restaurant_id TEXT NOT NULL,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          image TEXT NOT NULL,
          description TEXT,
          synced INTEGER DEFAULT 0,
          FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
        )`,
        [],
        () => {
          console.log("Menu items table created successfully");
        },
        (_, error) => {
          console.error("Error creating menu items table:", error);
          reject(error);
          return false;
        },
      );

      // Create orders table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customer_id TEXT NOT NULL,
          restaurant_id TEXT NOT NULL,
          restaurant_name TEXT NOT NULL,
          items TEXT NOT NULL,
          total REAL NOT NULL,
          status TEXT NOT NULL,
          address TEXT NOT NULL,
          payment_method TEXT NOT NULL,
          created_at TEXT NOT NULL,
          synced INTEGER DEFAULT 0
        )`,
        [],
        () => {
          console.log("Orders table created successfully");
          resolve();
        },
        (_, error) => {
          console.error("Error creating orders table:", error);
          reject(error);
          return false;
        },
      );

      // Create order_items table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS order_items (
          id TEXT PRIMARY KEY,
          order_id TEXT NOT NULL,
          menu_item_id TEXT NOT NULL,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          synced INTEGER DEFAULT 0,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
        )`,
        [],
        () => {
          console.log("Order items table created successfully");
        },
        (_, error) => {
          console.error("Error creating order items table:", error);
          reject(error);
          return false;
        },
      );

      // Create addresses table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS addresses (
          id TEXT PRIMARY KEY,
          address TEXT NOT NULL,
          is_default INTEGER DEFAULT 0,
          synced INTEGER DEFAULT 0
        )`,
        [],
        () => {
          console.log("Addresses table created successfully");
        },
        (_, error) => {
          console.error("Error creating addresses table:", error);
          reject(error);
          return false;
        },
      );

      // Create payment_methods table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS payment_methods (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          last4 TEXT NOT NULL,
          is_default INTEGER DEFAULT 0,
          synced INTEGER DEFAULT 0
        )`,
        [],
        () => {
          console.log("Payment methods table created successfully");
        },
        (_, error) => {
          console.error("Error creating payment methods table:", error);
          reject(error);
          return false;
        },
      );

      // Create cart table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cart_items (
          id TEXT PRIMARY KEY,
          restaurant_id TEXT NOT NULL,
          restaurant_name TEXT NOT NULL,
          menu_item_id TEXT NOT NULL,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          image TEXT NOT NULL,
          synced INTEGER DEFAULT 0
        )`,
        [],
        () => {
          console.log("Cart items table created successfully");
          resolve();
        },
        (_, error) => {
          console.error("Error creating cart items table:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// Web storage implementation for database operations
const webStorage = {
  restaurants: [],
  menuItems: [],
  orders: [],
  orderItems: [],
  addresses: [
    { id: "1", address: "123 Main St, Anytown", is_default: 1 },
    { id: "2", address: "456 Oak St, Anytown", is_default: 0 },
  ],
  paymentMethods: [{ id: "1", type: "Visa", last4: "4242", is_default: 1 }],
  cartItems: [],
};

// Seed initial data
export const seedDatabase = async () => {
  try {
    if (Platform.OS === "web") {
      // For web, we'll use the mock data directly
      console.log("Using mock data for web platform");

      // Load mock data from api.ts
      const { mockRestaurants, mockMenuItems } = require("./api");

      // Store in web storage
      webStorage.restaurants = mockRestaurants || [];
      webStorage.menuItems = mockMenuItems || [];

      return;
    }

    // Check if we already have data
    const restaurantCount = await getCount("restaurants");

    if (restaurantCount === 0) {
      console.log("Seeding database with initial data...");

      // Fetch data from mock API
      const { mockApiSync } = require("./api");
      const { restaurants, menuItems } = await mockApiSync.fetchInitialData();

      // Insert restaurants
      for (const restaurant of restaurants) {
        await insertRestaurant(restaurant);
      }

      // Insert menu items
      for (const menuItem of menuItems) {
        await insertMenuItem(menuItem);
      }

      // Insert default address
      await insertAddress({
        id: "1",
        address: "123 Main St, Anytown",
        is_default: 1,
      });

      // Insert default payment method
      await insertPaymentMethod({
        id: "1",
        type: "Visa",
        last4: "4242",
        is_default: 1,
      });

      console.log("Database seeded successfully");
    } else {
      console.log("Database already has data, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Helper to get count of records in a table
export const getCount = (table: string): Promise<number> => {
  if (Platform.OS === "web") {
    return Promise.resolve(webStorage[table]?.length || 0);
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT COUNT(*) as count FROM ${table}`,
        [],
        (_, { rows }) => {
          resolve(rows._array[0].count);
        },
        (_, error) => {
          console.error(`Error getting count from ${table}:`, error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// Restaurant CRUD operations
export const insertRestaurant = (restaurant: any): Promise<void> => {
  if (Platform.OS === "web") {
    const index = webStorage.restaurants.findIndex(
      (r) => r.id === restaurant.id,
    );
    if (index >= 0) {
      webStorage.restaurants[index] = restaurant;
    } else {
      webStorage.restaurants.push(restaurant);
    }
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO restaurants (
          id, name, image, rating, deliveryTime, category, description, address, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          restaurant.id,
          restaurant.name,
          restaurant.image,
          restaurant.rating,
          restaurant.deliveryTime,
          restaurant.category,
          restaurant.description || "",
          restaurant.address || "",
          0, // Not synced with server yet
        ],
        () => {
          resolve();
        },
        (_, error) => {
          console.error("Error inserting restaurant:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getRestaurants = (): Promise<any[]> => {
  if (Platform.OS === "web") {
    return Promise.resolve(webStorage.restaurants);
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM restaurants",
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error("Error getting restaurants:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getRestaurantById = (id: string): Promise<any> => {
  if (Platform.OS === "web") {
    const restaurant = webStorage.restaurants.find((r) => r.id === id);
    return Promise.resolve(restaurant || null);
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM restaurants WHERE id = ?",
        [id],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows._array[0]);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error("Error getting restaurant by id:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// Menu item CRUD operations
export const insertMenuItem = (menuItem: any): Promise<void> => {
  if (Platform.OS === "web") {
    const index = webStorage.menuItems.findIndex((m) => m.id === menuItem.id);
    if (index >= 0) {
      webStorage.menuItems[index] = menuItem;
    } else {
      webStorage.menuItems.push(menuItem);
    }
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO menu_items (
          id, restaurant_id, name, price, image, description, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          menuItem.id,
          menuItem.restaurant_id,
          menuItem.name,
          menuItem.price,
          menuItem.image,
          menuItem.description || "",
          0, // Not synced with server yet
        ],
        () => {
          resolve();
        },
        (_, error) => {
          console.error("Error inserting menu item:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getMenuItemsByRestaurantId = (
  restaurantId: string,
): Promise<any[]> => {
  if (Platform.OS === "web") {
    return Promise.resolve(
      webStorage.menuItems.filter((m) => m.restaurant_id === restaurantId),
    );
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM menu_items WHERE restaurant_id = ?",
        [restaurantId],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error("Error getting menu items by restaurant id:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// Cart operations
export const addToCart = (item: any): Promise<void> => {
  if (Platform.OS === "web") {
    const index = webStorage.cartItems.findIndex(
      (i) => i.menu_item_id === item.menu_item_id,
    );
    if (index >= 0) {
      webStorage.cartItems[index].quantity += item.quantity;
    } else {
      webStorage.cartItems.push(item);
    }
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Check if item already exists in cart
      tx.executeSql(
        "SELECT * FROM cart_items WHERE menu_item_id = ?",
        [item.menu_item_id],
        (_, { rows }) => {
          if (rows.length > 0) {
            // Update quantity if item exists
            const existingItem = rows._array[0];
            const newQuantity = existingItem.quantity + item.quantity;

            tx.executeSql(
              "UPDATE cart_items SET quantity = ?, synced = 0 WHERE id = ?",
              [newQuantity, existingItem.id],
              () => {
                resolve();
              },
              (_, error) => {
                console.error("Error updating cart item:", error);
                reject(error);
                return false;
              },
            );
          } else {
            // Insert new item if it doesn't exist
            tx.executeSql(
              `INSERT INTO cart_items (
                id, restaurant_id, restaurant_name, menu_item_id, name, price, quantity, image, synced
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.restaurant_id,
                item.restaurant_name,
                item.menu_item_id,
                item.name,
                item.price,
                item.quantity,
                item.image,
                0, // Not synced with server yet
              ],
              () => {
                resolve();
              },
              (_, error) => {
                console.error("Error inserting cart item:", error);
                reject(error);
                return false;
              },
            );
          }
        },
        (_, error) => {
          console.error("Error checking cart item:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getCartItems = (): Promise<any[]> => {
  if (Platform.OS === "web") {
    return Promise.resolve(webStorage.cartItems);
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM cart_items",
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error("Error getting cart items:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const updateCartItemQuantity = (
  id: string,
  quantity: number,
): Promise<void> => {
  if (Platform.OS === "web") {
    if (quantity <= 0) {
      webStorage.cartItems = webStorage.cartItems.filter((i) => i.id !== id);
    } else {
      const index = webStorage.cartItems.findIndex((i) => i.id === id);
      if (index >= 0) {
        webStorage.cartItems[index].quantity = quantity;
      }
    }
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        tx.executeSql(
          "DELETE FROM cart_items WHERE id = ?",
          [id],
          () => {
            resolve();
          },
          (_, error) => {
            console.error("Error removing cart item:", error);
            reject(error);
            return false;
          },
        );
      } else {
        // Update quantity
        tx.executeSql(
          "UPDATE cart_items SET quantity = ?, synced = 0 WHERE id = ?",
          [quantity, id],
          () => {
            resolve();
          },
          (_, error) => {
            console.error("Error updating cart item quantity:", error);
            reject(error);
            return false;
          },
        );
      }
    });
  });
};

export const clearCart = (): Promise<void> => {
  if (Platform.OS === "web") {
    webStorage.cartItems = [];
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM cart_items",
        [],
        () => {
          resolve();
        },
        (_, error) => {
          console.error("Error clearing cart:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// Order operations
export const createOrder = (order: any): Promise<string> => {
  if (Platform.OS === "web") {
    webStorage.orders.push(order);

    // Add order items
    for (const item of order.items) {
      webStorage.orderItems.push({
        id: `${order.id}_${item.menu_item_id}`,
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      });
    }

    // Clear cart
    webStorage.cartItems = [];

    return Promise.resolve(order.id);
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Insert order
      tx.executeSql(
        `INSERT INTO orders (
          id, restaurant_id, restaurant_name, total, status, order_date, delivery_address, payment_method, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          order.restaurant_id,
          order.restaurant_name,
          order.total,
          order.status,
          order.order_date,
          order.delivery_address,
          order.payment_method,
          0, // Not synced with server yet
        ],
        async (_, result) => {
          // Insert order items
          for (const item of order.items) {
            try {
              await insertOrderItem({
                id: `${order.id}_${item.menu_item_id}`,
                order_id: order.id,
                menu_item_id: item.menu_item_id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              });
            } catch (error) {
              console.error("Error inserting order item:", error);
              reject(error);
              return;
            }
          }

          // Clear cart after successful order
          try {
            await clearCart();
            resolve(order.id);
          } catch (error) {
            console.error("Error clearing cart after order:", error);
            reject(error);
          }
        },
        (_, error) => {
          console.error("Error creating order:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const insertOrderItem = (orderItem: any): Promise<void> => {
  if (Platform.OS === "web") {
    webStorage.orderItems.push(orderItem);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO order_items (
          id, order_id, menu_item_id, name, price, quantity, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderItem.id,
          orderItem.order_id,
          orderItem.menu_item_id,
          orderItem.name,
          orderItem.price,
          orderItem.quantity,
          0, // Not synced with server yet
        ],
        () => {
          resolve();
        },
        (_, error) => {
          console.error("Error inserting order item:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getOrders = (): Promise<any[]> => {
  if (Platform.OS === "web") {
    return Promise.resolve(webStorage.orders);
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM orders ORDER BY order_date DESC",
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error("Error getting orders:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getOrderById = (id: string): Promise<any> => {
  if (Platform.OS === "web") {
    const order = webStorage.orders.find((o) => o.id === id);
    if (order) {
      order.items = webStorage.orderItems.filter((i) => i.order_id === id);
    }
    return Promise.resolve(order || null);
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM orders WHERE id = ?",
        [id],
        (_, { rows }) => {
          if (rows.length > 0) {
            const order = rows._array[0];

            // Get order items
            tx.executeSql(
              "SELECT * FROM order_items WHERE order_id = ?",
              [id],
              (_, { rows: itemRows }) => {
                order.items = itemRows._array;
                resolve(order);
              },
              (_, error) => {
                console.error("Error getting order items:", error);
                reject(error);
                return false;
              },
            );
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error("Error getting order by id:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const updateOrderStatus = (
  id: string,
  status: string,
): Promise<void> => {
  if (Platform.OS === "web") {
    const index = webStorage.orders.findIndex((o) => o.id === id);
    if (index >= 0) {
      webStorage.orders[index].status = status;
    }
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE orders SET status = ?, synced = 0 WHERE id = ?",
        [status, id],
        () => {
          resolve();
        },
        (_, error) => {
          console.error("Error updating order status:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// Address operations
export const insertAddress = (address: any): Promise<void> => {
  if (Platform.OS === "web") {
    // If this is the default address, unset any existing default
    if (address.is_default) {
      webStorage.addresses.forEach((a) => (a.is_default = 0));
    }

    const index = webStorage.addresses.findIndex((a) => a.id === address.id);
    if (index >= 0) {
      webStorage.addresses[index] = address;
    } else {
      webStorage.addresses.push(address);
    }

    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // If this is the default address, unset any existing default
      if (address.is_default) {
        tx.executeSql(
          "UPDATE addresses SET is_default = 0",
          [],
          () => {
            // Now insert or update the new address
            tx.executeSql(
              `INSERT OR REPLACE INTO addresses (
                id, address, is_default, synced
              ) VALUES (?, ?, ?, ?)`,
              [
                address.id,
                address.address,
                address.is_default ? 1 : 0,
                0, // Not synced with server yet
              ],
              () => {
                resolve();
              },
              (_, error) => {
                console.error("Error inserting address:", error);
                reject(error);
                return false;
              },
            );
          },
          (_, error) => {
            console.error("Error updating existing default addresses:", error);
            reject(error);
            return false;
          },
        );
      } else {
        // Just insert or update without changing defaults
        tx.executeSql(
          `INSERT OR REPLACE INTO addresses (
            id, address, is_default, synced
          ) VALUES (?, ?, ?, ?)`,
          [
            address.id,
            address.address,
            address.is_default ? 1 : 0,
            0, // Not synced with server yet
          ],
          () => {
            resolve();
          },
          (_, error) => {
            console.error("Error inserting address:", error);
            reject(error);
            return false;
          },
        );
      }
    });
  });
};

export const getAddresses = (): Promise<any[]> => {
  if (Platform.OS === "web") {
    // Convert SQLite integer to boolean for is_default
    return Promise.resolve(
      webStorage.addresses.map((addr) => ({
        ...addr,
        is_default: addr.is_default === 1,
        default: addr.is_default === 1, // For backward compatibility
      })),
    );
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM addresses ORDER BY is_default DESC",
        [],
        (_, { rows }) => {
          // Convert SQLite integer to boolean for is_default
          const addresses = rows._array.map((addr) => ({
            ...addr,
            is_default: addr.is_default === 1,
            default: addr.is_default === 1, // For backward compatibility
          }));
          resolve(addresses);
        },
        (_, error) => {
          console.error("Error getting addresses:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const setDefaultAddress = (id: string): Promise<void> => {
  if (Platform.OS === "web") {
    webStorage.addresses.forEach((a) => {
      a.is_default = a.id === id ? 1 : 0;
    });
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // First, set all addresses to non-default
      tx.executeSql(
        "UPDATE addresses SET is_default = 0, synced = 0",
        [],
        () => {
          // Then set the selected address as default
          tx.executeSql(
            "UPDATE addresses SET is_default = 1, synced = 0 WHERE id = ?",
            [id],
            () => {
              resolve();
            },
            (_, error) => {
              console.error("Error setting default address:", error);
              reject(error);
              return false;
            },
          );
        },
        (_, error) => {
          console.error("Error resetting default addresses:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const deleteAddress = (id: string): Promise<void> => {
  if (Platform.OS === "web") {
    webStorage.addresses = webStorage.addresses.filter((a) => a.id !== id);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM addresses WHERE id = ?",
        [id],
        () => {
          resolve();
        },
        (_, error) => {
          console.error("Error deleting address:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// Payment method operations
export const insertPaymentMethod = (paymentMethod: any): Promise<void> => {
  if (Platform.OS === "web") {
    // If this is the default payment method, unset any existing default
    if (paymentMethod.is_default) {
      webStorage.paymentMethods.forEach((p) => (p.is_default = 0));
    }

    const index = webStorage.paymentMethods.findIndex(
      (p) => p.id === paymentMethod.id,
    );
    if (index >= 0) {
      webStorage.paymentMethods[index] = paymentMethod;
    } else {
      webStorage.paymentMethods.push(paymentMethod);
    }

    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // If this is the default payment method, unset any existing default
      if (paymentMethod.is_default) {
        tx.executeSql(
          "UPDATE payment_methods SET is_default = 0",
          [],
          () => {
            // Now insert or update the new payment method
            tx.executeSql(
              `INSERT OR REPLACE INTO payment_methods (
                id, type, last4, is_default, synced
              ) VALUES (?, ?, ?, ?, ?)`,
              [
                paymentMethod.id,
                paymentMethod.type,
                paymentMethod.last4,
                paymentMethod.is_default ? 1 : 0,
                0, // Not synced with server yet
              ],
              () => {
                resolve();
              },
              (_, error) => {
                console.error("Error inserting payment method:", error);
                reject(error);
                return false;
              },
            );
          },
          (_, error) => {
            console.error(
              "Error updating existing default payment methods:",
              error,
            );
            reject(error);
            return false;
          },
        );
      } else {
        // Just insert or update without changing defaults
        tx.executeSql(
          `INSERT OR REPLACE INTO payment_methods (
            id, type, last4, is_default, synced
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            paymentMethod.id,
            paymentMethod.type,
            paymentMethod.last4,
            paymentMethod.is_default ? 1 : 0,
            0, // Not synced with server yet
          ],
          () => {
            resolve();
          },
          (_, error) => {
            console.error("Error inserting payment method:", error);
            reject(error);
            return false;
          },
        );
      }
    });
  });
};

export const getPaymentMethods = (): Promise<any[]> => {
  if (Platform.OS === "web") {
    // Convert SQLite integer to boolean for is_default
    return Promise.resolve(
      webStorage.paymentMethods.map((method) => ({
        ...method,
        is_default: method.is_default === 1,
        default: method.is_default === 1, // For backward compatibility
      })),
    );
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM payment_methods ORDER BY is_default DESC",
        [],
        (_, { rows }) => {
          // Convert SQLite integer to boolean for is_default
          const paymentMethods = rows._array.map((method) => ({
            ...method,
            is_default: method.is_default === 1,
            default: method.is_default === 1, // For backward compatibility
          }));
          resolve(paymentMethods);
        },
        (_, error) => {
          console.error("Error getting payment methods:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const setDefaultPaymentMethod = (id: string): Promise<void> => {
  if (Platform.OS === "web") {
    webStorage.paymentMethods.forEach((p) => {
      p.is_default = p.id === id ? 1 : 0;
    });
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // First, set all payment methods to non-default
      tx.executeSql(
        "UPDATE payment_methods SET is_default = 0, synced = 0",
        [],
        () => {
          // Then set the selected payment method as default
          tx.executeSql(
            "UPDATE payment_methods SET is_default = 1, synced = 0 WHERE id = ?",
            [id],
            () => {
              resolve();
            },
            (_, error) => {
              console.error("Error setting default payment method:", error);
              reject(error);
              return false;
            },
          );
        },
        (_, error) => {
          console.error("Error resetting default payment methods:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const deletePaymentMethod = (id: string): Promise<void> => {
  if (Platform.OS === "web") {
    webStorage.paymentMethods = webStorage.paymentMethods.filter(
      (p) => p.id !== id,
    );
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM payment_methods WHERE id = ?",
        [id],
        () => {
          resolve();
        },
        (_, error) => {
          console.error("Error deleting payment method:", error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// Sync operations
export const syncWithServer = async (): Promise<void> => {
  if (Platform.OS === "web") {
    console.log("Sync not implemented for web platform");
    return;
  }

  try {
    console.log("Starting sync with server...");

    // Get all unsynced data
    const unsyncedRestaurants = await getUnsyncedData("restaurants");
    const unsyncedMenuItems = await getUnsyncedData("menu_items");
    const unsyncedOrders = await getUnsyncedData("orders");
    const unsyncedOrderItems = await getUnsyncedData("order_items");
    const unsyncedAddresses = await getUnsyncedData("addresses");
    const unsyncedPaymentMethods = await getUnsyncedData("payment_methods");
    const unsyncedCartItems = await getUnsyncedData("cart_items");

    // Send unsynced data to server
    const { mockApiSync } = require("./api");

    if (unsyncedRestaurants.length > 0) {
      await mockApiSync.syncRestaurants(unsyncedRestaurants);
      await markAsSynced(
        "restaurants",
        unsyncedRestaurants.map((item) => item.id),
      );
    }

    if (unsyncedMenuItems.length > 0) {
      await mockApiSync.syncMenuItems(unsyncedMenuItems);
      await markAsSynced(
        "menu_items",
        unsyncedMenuItems.map((item) => item.id),
      );
    }

    if (unsyncedOrders.length > 0) {
      await mockApiSync.syncOrders(unsyncedOrders);
      await markAsSynced(
        "orders",
        unsyncedOrders.map((item) => item.id),
      );
    }

    if (unsyncedOrderItems.length > 0) {
      await mockApiSync.syncOrderItems(unsyncedOrderItems);
      await markAsSynced(
        "order_items",
        unsyncedOrderItems.map((item) => item.id),
      );
    }

    if (unsyncedAddresses.length > 0) {
      await mockApiSync.syncAddresses(unsyncedAddresses);
      await markAsSynced(
        "addresses",
        unsyncedAddresses.map((item) => item.id),
      );
    }

    if (unsyncedPaymentMethods.length > 0) {
      await mockApiSync.syncPaymentMethods(unsyncedPaymentMethods);
      await markAsSynced(
        "payment_methods",
        unsyncedPaymentMethods.map((item) => item.id),
      );
    }

    if (unsyncedCartItems.length > 0) {
      await mockApiSync.syncCartItems(unsyncedCartItems);
      await markAsSynced(
        "cart_items",
        unsyncedCartItems.map((item) => item.id),
      );
    }

    // Get updates from server
    const serverUpdates = await mockApiSync.getServerUpdates();

    // Apply server updates to local database
    if (serverUpdates.restaurants && serverUpdates.restaurants.length > 0) {
      for (const restaurant of serverUpdates.restaurants) {
        await insertRestaurant({ ...restaurant, synced: 1 });
      }
    }

    if (serverUpdates.menuItems && serverUpdates.menuItems.length > 0) {
      for (const menuItem of serverUpdates.menuItems) {
        await insertMenuItem({ ...menuItem, synced: 1 });
      }
    }

    if (serverUpdates.orders && serverUpdates.orders.length > 0) {
      for (const order of serverUpdates.orders) {
        // Update order status
        await updateOrderStatus(order.id, order.status);
        await markAsSynced("orders", [order.id]);
      }
    }

    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Error syncing with server:", error);
    throw error;
  }
};

// Helper to get unsynced data from a table
const getUnsyncedData = (table: string): Promise<any[]> => {
  if (Platform.OS === "web") {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${table} WHERE synced = 0`,
        [],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          console.error(`Error getting unsynced data from ${table}:`, error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// Helper to mark data as synced
const markAsSynced = (table: string, ids: string[]): Promise<void> => {
  if (ids.length === 0 || Platform.OS === "web") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      const placeholders = ids.map(() => "?").join(",");
      tx.executeSql(
        `UPDATE ${table} SET synced = 1 WHERE id IN (${placeholders})`,
        ids,
        () => {
          resolve();
        },
        (_, error) => {
          console.error(`Error marking data as synced in ${table}:`, error);
          reject(error);
          return false;
        },
      );
    });
  });
};
