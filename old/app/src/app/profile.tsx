import * as ImagePicker from "expo-image-picker";
import {
  Bell,
  Camera,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Key,
  LogOut,
  Mail,
  MapPin,
  Settings,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DesktopHeader from "../components/headers/DesktopHeader";
import { useAppModeType } from "../lib/context/UserTypeContext";

export default function ProfileScreen() {
  const { appMode: userType, setUserType } = useAppModeType();
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("(123) 456-7890");
  const [profileImage, setProfileImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;

  const handlePickImage = async () => {
    // Request permissions
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera roll permissions to change your profile picture.",
        );
        return;
      }
    }

    // Pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSaveProfile = () => {
    // In a real app, you would submit to API here
    setEditMode(false);
    Alert.alert(
      "Profile Updated",
      "Your profile has been updated successfully.",
    );
  };

  const handleLogout = () => {
    // In a real app, you would handle logout logic here
    Alert.alert("Logged Out", "You have been successfully logged out.");
  };

  const handleToggleUserType = () => {
    if (userType === "customer") {
      Alert.alert("Switch Account Type", "Choose account type:", [
        {
          text: "Restaurant Owner",
          onPress: () => setUserType("restaurant"),
        },
        {
          text: "Delivery Driver",
          onPress: () => setUserType("driver"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } else {
      setUserType("customer");
    }
  };

  const renderUserTypeLabel = () => {
    switch (userType) {
      case "restaurant":
        return "Restaurant Owner";
      case "driver":
        return "Delivery Driver";
      default:
        return "Customer";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLargeScreen && (
        <DesktopHeader
          currentAddress="Profile"
          onAddressChange={() => {}}
          cartItemCount={0}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.contentContainer,
            isLargeScreen && styles.largeScreenContentContainer,
          ]}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <User size={48} color="#9CA3AF" />
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handlePickImage}
              >
                <Camera size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {editMode ? (
              <View style={styles.editForm}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput
                    style={styles.textInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Your phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSaveProfile}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.profileName}>{name}</Text>
                <Text style={styles.profileEmail}>{email}</Text>
                <Text style={styles.profilePhone}>{phone}</Text>
                <TouchableOpacity
                  style={[styles.button, styles.editButton]}
                  onPress={() => setEditMode(true)}
                >
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Type</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleToggleUserType}
            >
              <View style={styles.menuItemIcon}>
                {userType === "restaurant" ? (
                  <Settings size={24} color="#FF5A5F" />
                ) : userType === "driver" ? (
                  <MapPin size={24} color="#FF5A5F" />
                ) : (
                  <User size={24} color="#FF5A5F" />
                )}
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Switch Account Type</Text>
                <Text style={styles.menuItemSubtitle}>
                  Currently: {renderUserTypeLabel()}
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <CreditCard size={24} color="#FF5A5F" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Payment Methods</Text>
                <Text style={styles.menuItemSubtitle}>
                  Add or remove payment options
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <MapPin size={24} color="#FF5A5F" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Addresses</Text>
                <Text style={styles.menuItemSubtitle}>
                  Manage your saved addresses
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <Key size={24} color="#FF5A5F" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Security</Text>
                <Text style={styles.menuItemSubtitle}>
                  Password and account security
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <Bell size={24} color="#FF5A5F" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Notifications</Text>
                <Text style={styles.menuItemSubtitle}>
                  Get updates about your orders
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D1D5DB", true: "#FF5A5F" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <Settings size={24} color="#FF5A5F" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Dark Mode</Text>
                <Text style={styles.menuItemSubtitle}>
                  Change app appearance
                </Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: "#D1D5DB", true: "#FF5A5F" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <HelpCircle size={24} color="#FF5A5F" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Help Center</Text>
                <Text style={styles.menuItemSubtitle}>
                  Get help with your orders
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemIcon}>
                <Mail size={24} color="#FF5A5F" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Contact Us</Text>
                <Text style={styles.menuItemSubtitle}>Send us a message</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FF5A5F" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 16,
  },
  largeScreenContentContainer: {
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF5A5F",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#F3F4F6",
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  editForm: {
    width: "100%",
    alignItems: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    width: "100%",
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#FF5A5F",
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sectionDivider: {
    height: 8,
    backgroundColor: "#F3F4F6",
    marginVertical: 8,
    borderRadius: 4,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F2",
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5A5F",
    marginLeft: 8,
  },
});
