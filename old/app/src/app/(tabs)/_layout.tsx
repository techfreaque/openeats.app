import { Tabs } from "expo-router";
import {
  Home,
  List,
  Plus,
  Search,
  ShoppingBag,
  User,
} from "lucide-react-native";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import AppModeSelector from "../../components/AppModeSelector";
import { useAppModeType } from "../../lib/context/UserTypeContext";
import { useCart } from "../../lib/hooks/useCart";

// Custom tab bar to include the mode selector
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        if (options.href === null) {
          return null; // Skip hidden tabs
        }

        // For the mode selector (right-most position)
        if (index === state.routes.length - 1) {
          return (
            <View key={route.key} style={styles.tabItem}>
              <AppModeSelector isCompact={true} />
            </View>
          );
        }

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View key={route.key} style={styles.tabItem}>
            <View
              style={[styles.tabButton, isFocused && styles.activeTabButton]}
            >
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.tabButtonTouchable}
              >
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    color: isFocused ? "#FF5A5F" : "#6B7280",
                    size: 24,
                  })}
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function TabLayout(): JSX.Element {
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const { cartItems } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const { appMode } = useAppModeType();

  useEffect(() => {
    if (cartItems) {
      setCartCount(cartItems.length);
    }
  }, [cartItems]);

  // Common tab screen options
  const tabScreenOptions = {
    tabBarActiveTintColor: "#FF5A5F",
    tabBarInactiveTintColor: "#6B7280",
    tabBarStyle: {
      backgroundColor: "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor: "#E5E7EB",
      height: 60,
      paddingBottom: 10,
      paddingTop: 10,
      display: isLargeScreen ? "none" : "flex", // Hide tab bar on large screens
    },
    headerStyle: {
      backgroundColor: "#FFFFFF",
    },
    headerTitleStyle: {
      fontWeight: "bold",
      color: "#1F2937",
    },
    headerShown: !isLargeScreen, // Hide header on large screens
    tabBar: (props) => <CustomTabBar {...props} />,
  };

  // Render different tab layouts based on user type
  if (appMode === "restaurant") {
    return (
      <Tabs screenOptions={tabScreenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
            headerTitle: "Restaurant Profile",
          }}
        />
        <Tabs.Screen
          name="restaurant-editor"
          options={{
            title: "Restaurant Editor",
            tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
            headerTitle: "Restaurant Editor",
          }}
        />
        <Tabs.Screen
          name="restaurant/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        {/* Mode selector tab (hidden, just for the selector) */}
        <Tabs.Screen
          name="mode-selector"
          options={{
            title: "Mode",
            tabBarIcon: () => null,
          }}
        />
      </Tabs>
    );
  } else if (appMode === "driver") {
    return (
      <Tabs screenOptions={tabScreenOptions}>
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="driver"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
            headerTitle: "Driver Dashboard",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
            headerTitle: "Driver Profile",
          }}
        />
        <Tabs.Screen
          name="restaurant/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        {/* Mode selector tab (hidden, just for the selector) */}
        <Tabs.Screen
          name="mode-selector"
          options={{
            title: "Mode",
            tabBarIcon: () => null,
          }}
        />
      </Tabs>
    );
  }

  // Default customer view
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: "OpenEats",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          headerTitle: "Find Restaurants",
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabIconContainer}>
              <ShoppingBag size={size} color={color} />
              {cartCount > 0 && (
                <View style={styles.tabBadge}>
                  <View style={styles.tabBadgeInner}>
                    <View style={styles.tabBadgeDot} />
                  </View>
                </View>
              )}
            </View>
          ),
          headerTitle: "Your Cart",
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
          headerTitle: "Your Orders",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerTitle: "Your Profile",
        }}
      />
      <Tabs.Screen
        name="restaurant-editor"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="restaurant/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      {/* Mode selector tab (hidden, just for the selector) */}
      <Tabs.Screen
        name="mode-selector"
        options={{
          title: "Mode",
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBadge: {
    position: "absolute",
    top: -2,
    right: -6,
    backgroundColor: "transparent",
  },
  tabBadgeInner: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5A5F",
  },
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 60,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF5A5F",
  },
  tabButtonTouchable: {
    alignItems: "center",
    justifyContent: "center",
  },
});
