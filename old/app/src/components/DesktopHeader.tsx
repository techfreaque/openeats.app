import { useRouter } from "expo-router";
import {
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  Truck,
  User,
  Utensils,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { useAppModeType } from "../lib/context/UserTypeContext";
import AddressSelector from "./AddressSelector";
import AppModeSelector from "./AppModeSelector";
import UserTypeSwitcher from "./UserTypeSwitcher";

interface DesktopHeaderProps {
  currentAddress: string;
  onAddressChange: (address: string) => void;
  cartItemCount?: number;
}

export default function DesktopHeader({
  currentAddress,
  onAddressChange,
  cartItemCount = 0,
}: DesktopHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const { appMode: userType } = useAppModeType();

  const isSmallScreen = width < 768;
  const isMediumScreen = width >= 768 && width < 1024;
  const isLargeScreen = width >= 1024;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: "/search",
        params: { query: searchQuery },
      });
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get the appropriate icon based on user type
  const getUserTypeIcon = () => {
    switch (userType) {
      case "restaurant":
        return <Utensils size={24} color="#FF5A5F" />;
      case "driver":
        return <Truck size={24} color="#FF5A5F" />;
      default:
        return <User size={24} color="#FF5A5F" />;
    }
  };

  // Get the appropriate app name based on user type
  const getAppName = () => {
    switch (userType) {
      case "restaurant":
        return "OpenEats Restaurant";
      case "driver":
        return "OpenEats Driver";
      default:
        return "OpenEats";
    }
  };

  // Get the appropriate navigation links based on user type
  const getNavLinks = () => {
    if (userType === "restaurant") {
      return (
        <View style={styles.navLinks}>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => handleNavigate("/restaurant-dashboard")}
          >
            <Text style={styles.navLinkText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            onPress={() => handleNavigate("/restaurant-orders")}
          >
            <Text style={styles.navLinkText}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            onPress={() => handleNavigate("/restaurant-menu")}
          >
            <Text style={styles.navLinkText}>Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            onPress={() => handleNavigate("/profile")}
          >
            <Utensils size={24} color="#1F2937" />
            <Text style={styles.navLinkText}>Profile</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (userType === "driver") {
      return (
        <View style={styles.navLinks}>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => handleNavigate("/driver-dashboard")}
          >
            <Text style={styles.navLinkText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            onPress={() => handleNavigate("/driver-deliveries")}
          >
            <Text style={styles.navLinkText}>Deliveries</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            onPress={() => handleNavigate("/driver-history")}
          >
            <Text style={styles.navLinkText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navLink}
            onPress={() => handleNavigate("/profile")}
          >
            <Truck size={24} color="#1F2937" />
            <Text style={styles.navLinkText}>Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Default customer view
    return (
      <View style={styles.navLinks}>
        <TouchableOpacity
          style={styles.navLink}
          onPress={() => handleNavigate("/cart")}
        >
          <View style={styles.cartIconContainer}>
            <ShoppingBag size={24} color="#1F2937" />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navLinkText}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navLink}
          onPress={() => handleNavigate("/orders")}
        >
          <Text style={styles.navLinkText}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navLink}
          onPress={() => handleNavigate("/profile")}
        >
          <User size={24} color="#1F2937" />
          <Text style={styles.navLinkText}>Profile</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerContent,
          isLargeScreen && styles.largeScreenContent,
        ]}
      >
        {/* Logo and Mobile Menu Button */}
        <View style={styles.logoContainer}>
          {isSmallScreen && (
            <TouchableOpacity
              onPress={toggleMobileMenu}
              style={styles.menuButton}
            >
              {mobileMenuOpen ? (
                <X size={24} color="#1F2937" />
              ) : (
                <Menu size={24} color="#1F2937" />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              if (userType === "restaurant") {
                handleNavigate("/restaurant-dashboard");
              } else if (userType === "driver") {
                handleNavigate("/driver-dashboard");
              } else {
                handleNavigate("/");
              }
            }}
            style={styles.logoWrapper}
          >
            {getUserTypeIcon()}
            <Text style={styles.logoText}>{getAppName()}</Text>
          </TouchableOpacity>
        </View>

        {/* Address Selector - Only show for customer view on large screens */}
        {!isSmallScreen && userType === "customer" && (
          <View style={styles.addressSelectorContainer}>
            <AddressSelector
              onSelectAddress={onAddressChange}
              currentAddress={currentAddress}
              showLabel={false}
              compact={true}
            />
          </View>
        )}

        {/* Search Bar - Only show for customer view on large screens */}
        {!isSmallScreen && userType === "customer" && (
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for restaurants or cuisines"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        )}

        {/* Navigation Links - Always visible on large screens */}
        {!isSmallScreen && getNavLinks()}

        {/* Mobile-only icons */}
        {isSmallScreen && (
          <View style={styles.mobileIcons}>
            {userType === "customer" && (
              <TouchableOpacity
                style={styles.mobileIcon}
                onPress={() => handleNavigate("/cart")}
              >
                <View style={styles.cartIconContainer}>
                  <ShoppingBag size={24} color="#1F2937" />
                  {cartItemCount > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.mobileIcon}
              onPress={() => handleNavigate("/profile")}
            >
              {getUserTypeIcon()}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mobile Menu Overlay */}
      {isSmallScreen && mobileMenuOpen && (
        <View style={styles.mobileMenuOverlay}>
          <View style={styles.mobileMenu}>
            <View style={styles.mobileMenuHeader}>
              <Text style={styles.mobileMenuTitle}>Menu</Text>
              <TouchableOpacity onPress={toggleMobileMenu}>
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <View style={styles.mobileMenuContent}>
              {/* User Type Switcher */}
              <UserTypeSwitcher compact={true} />

              {userType === "customer" && (
                <>
                  <View style={styles.mobileAddressSelector}>
                    <Text style={styles.mobileMenuSectionTitle}>
                      Delivery Address
                    </Text>
                    <AddressSelector
                      onSelectAddress={onAddressChange}
                      currentAddress={currentAddress}
                      showLabel={false}
                      compact={true}
                    />
                  </View>

                  <View style={styles.mobileSearchContainer}>
                    <Text style={styles.mobileMenuSectionTitle}>Search</Text>
                    <View style={styles.mobileSearchInputContainer}>
                      <Search
                        size={20}
                        color="#6B7280"
                        style={styles.searchIcon}
                      />
                      <TextInput
                        style={styles.mobileSearchInput}
                        placeholder="Search for restaurants or cuisines"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => {
                          handleSearch();
                          toggleMobileMenu();
                        }}
                        returnKeyType="search"
                      />
                    </View>
                  </View>
                </>
              )}

              <View style={styles.mobileNavLinks}>
                <Text style={styles.mobileMenuSectionTitle}>Navigation</Text>

                {userType === "customer" && (
                  <>
                    <TouchableOpacity
                      style={styles.mobileNavLink}
                      onPress={() => handleNavigate("/")}
                    >
                      <Text style={styles.mobileNavLinkText}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mobileNavLink}
                      onPress={() => handleNavigate("/cart")}
                    >
                      <Text style={styles.mobileNavLinkText}>Cart</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mobileNavLink}
                      onPress={() => handleNavigate("/orders")}
                    >
                      <Text style={styles.mobileNavLinkText}>Orders</Text>
                    </TouchableOpacity>
                  </>
                )}

                {userType === "restaurant" && (
                  <>
                    <TouchableOpacity
                      style={styles.mobileNavLink}
                      onPress={() => handleNavigate("/restaurant-dashboard")}
                    >
                      <Text style={styles.mobileNavLinkText}>Dashboard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mobileNavLink}
                      onPress={() => handleNavigate("/restaurant-orders")}
                    >
                      <Text style={styles.mobileNavLinkText}>Orders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mobileNavLink}
                      onPress={() => handleNavigate("/restaurant-menu")}
                    >
                      <Text style={styles.mobileNavLinkText}>Menu</Text>
                    </TouchableOpacity>
                  </>
                )}

                {userType === "driver" && (
                  <>
                    <TouchableOpacity
                      style={styles.mobileNavLink}
                      onPress={() => handleNavigate("/driver-dashboard")}
                    >
                      <Text style={styles.mobileNavLinkText}>Dashboard</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mobileNavLink}
                      onPress={() => handleNavigate("/driver-deliveries")}
                    >
                      <Text style={styles.mobileNavLinkText}>Deliveries</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mobileNavLink}
                      onPress={() => handleNavigate("/driver-history")}
                    >
                      <Text style={styles.mobileNavLinkText}>History</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={styles.mobileNavLink}
                  onPress={() => handleNavigate("/profile")}
                >
                  <Text style={styles.mobileNavLinkText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.mobileNavLink, styles.logoutButton]}
                  onPress={() => {
                    // Handle logout
                    toggleMobileMenu();
                  }}
                >
                  <LogOut size={20} color="#EF4444" />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    width: "100%",
  },
  largeScreenContent: {
    maxWidth: 1200,
    alignSelf: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    marginRight: 16,
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  addressSelectorContainer: {
    flex: 1,
    maxWidth: 300,
    marginHorizontal: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    maxWidth: 400,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#1F2937",
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  navLink: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 24,
  },
  navLinkText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginLeft: 8,
  },
  cartIconContainer: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF5A5F",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  mobileIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  mobileIcon: {
    marginLeft: 16,
  },
  mobileMenuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 100,
    height: "100vh",
  },
  mobileMenu: {
    backgroundColor: "#FFFFFF",
    width: "80%",
    height: "100%",
    padding: 20,
  },
  mobileMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  mobileMenuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  mobileMenuContent: {
    flex: 1,
  },
  mobileAddressSelector: {
    marginBottom: 24,
  },
  mobileMenuSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 12,
  },
  mobileSearchContainer: {
    marginBottom: 24,
  },
  mobileSearchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mobileSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#1F2937",
  },
  mobileNavLinks: {
    marginTop: 16,
  },
  mobileNavLink: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  mobileNavLinkText: {
    fontSize: 18,
    color: "#1F2937",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 18,
    color: "#EF4444",
    marginLeft: 12,
  },
});
