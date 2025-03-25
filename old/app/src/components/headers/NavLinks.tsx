import {
  Home,
  Search,
  ShoppingBag,
  Truck,
  User,
  Utensils,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { UserType } from "../../types";

type NavLinksProps = {
  userType: UserType;
  handleNavigate: (path: string) => void;
};

export default function NavLinks({ userType, handleNavigate }: NavLinksProps) {
  if (userType === "restaurant") {
    return (
      <View style={styles.navLinks}>
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}

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
        {/* <TouchableOpacity
          style={styles.navLink}
          onPress={() => handleNavigate("/driver-dashboard")}
        >
          <Text style={styles.navLinkText}>Dashboard</Text>
        </TouchableOpacity> */}
{/* 
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
        </TouchableOpacity> */}

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

  // Default customer navigation links
  return (
    <View style={styles.navLinks}>
      <TouchableOpacity
        style={styles.navLink}
        onPress={() => handleNavigate("/")}
      >
        <Home size={24} color="#1F2937" />
        <Text style={styles.navLinkText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navLink}
        onPress={() => handleNavigate("/search")}
      >
        <Search size={24} color="#1F2937" />
        <Text style={styles.navLinkText}>Search</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navLink}
        onPress={() => handleNavigate("/orders")}
      >
        <ShoppingBag size={24} color="#1F2937" />
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
}

const styles = StyleSheet.create({
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
    color: "#1F2937",
    fontWeight: "500",
    marginLeft: 8,
  },
});
