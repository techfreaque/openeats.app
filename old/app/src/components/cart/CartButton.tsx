import { ShoppingBag } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type CartButtonProps = {
  count: number;
  onPress: () => void;
};

export default function CartButton({ count, onPress }: CartButtonProps) {
  return (
    <TouchableOpacity style={styles.cartButton} onPress={onPress}>
      <ShoppingBag size={24} color="#FFFFFF" />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cartButton: {
    position: "relative",
    backgroundColor: "#FF5A5F",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#1F2937",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
