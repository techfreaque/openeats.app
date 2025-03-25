import { Truck, User, Utensils } from "lucide-react-native";
import type { JSX } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import type { UserType } from "../app/context/UserTypeContext";
import { useUserType } from "../app/context/UserTypeContext";

interface UserTypeSwitcherProps {
  compact?: boolean;
}

export default function UserTypeSwitcher({
  compact = false,
}: UserTypeSwitcherProps): JSX.Element {
  const { userType, setUserType } = useUserType();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;

  const handleUserTypeChange = async (type: UserType) => {
    await setUserType(type);
  };

  return (
    <View
      style={[
        styles.container,
        compact && styles.compactContainer,
        isLargeScreen && styles.largeScreenContainer,
      ]}
    >
      <Text
        style={[
          styles.title,
          compact && styles.compactTitle,
          isLargeScreen && styles.largeScreenTitle,
        ]}
      >
        Switch View
      </Text>

      <View
        style={[
          styles.buttonContainer,
          compact && styles.compactButtonContainer,
          isLargeScreen && styles.largeScreenButtonContainer,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            userType === "customer" && styles.activeButton,
            compact && styles.compactButton,
            isLargeScreen && styles.largeScreenButton,
          ]}
          onPress={() => handleUserTypeChange("customer")}
        >
          <User
            size={compact ? 16 : 20}
            color={userType === "customer" ? "#FFFFFF" : "#4B5563"}
          />
          <Text
            style={[
              styles.buttonText,
              userType === "customer" && styles.activeButtonText,
              compact && styles.compactButtonText,
              isLargeScreen && styles.largeScreenButtonText,
            ]}
          >
            Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            userType === "restaurant" && styles.activeButton,
            compact && styles.compactButton,
            isLargeScreen && styles.largeScreenButton,
          ]}
          onPress={() => handleUserTypeChange("restaurant")}
        >
          <Utensils
            size={compact ? 16 : 20}
            color={userType === "restaurant" ? "#FFFFFF" : "#4B5563"}
          />
          <Text
            style={[
              styles.buttonText,
              userType === "restaurant" && styles.activeButtonText,
              compact && styles.compactButtonText,
              isLargeScreen && styles.largeScreenButtonText,
            ]}
          >
            Restaurant
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            userType === "driver" && styles.activeButton,
            compact && styles.compactButton,
            isLargeScreen && styles.largeScreenButton,
          ]}
          onPress={() => handleUserTypeChange("driver")}
        >
          <Truck
            size={compact ? 16 : 20}
            color={userType === "driver" ? "#FFFFFF" : "#4B5563"}
          />
          <Text
            style={[
              styles.buttonText,
              userType === "driver" && styles.activeButtonText,
              compact && styles.compactButtonText,
              isLargeScreen && styles.largeScreenButtonText,
            ]}
          >
            Driver
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContainer: {
    padding: 12,
    marginBottom: 12,
  },
  largeScreenContainer: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  compactTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  largeScreenTitle: {
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  compactButtonContainer: {
    flexDirection: "column",
  },
  largeScreenButtonContainer: {
    justifyContent: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  compactButton: {
    padding: 8,
    marginBottom: 8,
    marginHorizontal: 0,
  },
  largeScreenButton: {
    padding: 16,
    marginHorizontal: 8,
  },
  activeButton: {
    backgroundColor: "#FF5A5F",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginLeft: 8,
  },
  compactButtonText: {
    fontSize: 12,
  },
  largeScreenButtonText: {
    fontSize: 16,
  },
  activeButtonText: {
    color: "#FFFFFF",
  },
});
