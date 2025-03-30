import React from "react";
import { StyleSheet, Text, View } from "react-native";

type LogoProps = {
  width?: number;
  height?: number;
};

export default function Logo({ width = 120, height = 40 }: LogoProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={styles.openText}>Open</Text>
      <Text style={styles.deliveryText}>Delivery</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  openText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF5A5F",
  },
  deliveryText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
});
