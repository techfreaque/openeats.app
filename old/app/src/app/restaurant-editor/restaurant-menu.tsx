import { useRouter } from "expo-router";
import {
  Camera,
  CreditCard as Edit2,
  DollarSign,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DesktopHeader from "../../components/DesktopHeader";
import { useAppModeType } from "../../lib/context/UserTypeContext";

// Mock data for menu items
const initialMenuItems = [
  {
    id: "item-001",
    name: "Double Cheeseburger",
    description:
      "Two beef patties with cheddar cheese, lettuce, tomato, onion, and special sauce.",
    price: 8.99,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    category: "Burgers",
    available: true,
  },
  {
    id: "item-002",
    name: "Bacon Burger",
    description:
      "Beef patty with bacon, cheddar cheese, lettuce, tomato, and BBQ sauce.",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    category: "Burgers",
    available: true,
  },
  {
    id: "item-003",
    name: "Veggie Burger",
    description:
      "Plant-based patty with lettuce, tomato, onion, and vegan mayo.",
    price: 7.99,
    image:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    category: "Burgers",
    available: true,
  },
  {
    id: "item-004",
    name: "French Fries",
    description: "Crispy golden fries seasoned with sea salt.",
    price: 3.99,
    image:
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    category: "Sides",
    available: true,
  },
  {
    id: "item-005",
    name: "Onion Rings",
    description: "Crispy battered onion rings served with dipping sauce.",
    price: 4.49,
    image:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    category: "Sides",
    available: true,
  },
  {
    id: "item-006",
    name: "Chocolate Milkshake",
    description: "Creamy chocolate milkshake topped with whipped cream.",
    price: 4.99,
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    category: "Drinks",
    available: true,
  },
  {
    id: "item-007",
    name: "Soda",
    description: "Your choice of soft drink.",
    price: 2.99,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    category: "Drinks",
    available: true,
  },
];

// Menu categories
const categories = ["All", "Burgers", "Sides", "Drinks"];

export default function RestaurantMenuScreen() {
  const router = useRouter();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const { appMode: userType } = useAppModeType();

  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedItem, setEditedItem] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "Burgers",
    available: true,
  });

  // Redirect if not a restaurant user
  useEffect(() => {
    if (userType !== "restaurant") {
      router.replace("/");
    }
  }, [userType, router]);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddItem = () => {
    setSelectedItem(null);
    setEditedItem({
      name: "",
      description: "",
      price: "",
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      category: "Burgers",
      available: true,
    });
    setEditModalVisible(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setEditedItem({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      available: item.available,
    });
    setEditModalVisible(true);
  };

  const handleDeleteItem = (item) => {
    setSelectedItem(item);
    setDeleteModalVisible(true);
  };

  const handleSaveItem = () => {
    if (!editedItem.name || !editedItem.price || !editedItem.image) {
      Alert.alert("Error", "Name, price, and image are required");
      return;
    }

    if (selectedItem) {
      // Update existing item
      setMenuItems(
        menuItems.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                name: editedItem.name,
                description: editedItem.description,
                price: parseFloat(editedItem.price),
                image: editedItem.image,
                category: editedItem.category,
                available: editedItem.available,
              }
            : item,
        ),
      );
    } else {
      // Add new item
      const newItem = {
        id: `item-${Date.now()}`,
        name: editedItem.name,
        description: editedItem.description,
        price: parseFloat(editedItem.price),
        image: editedItem.image,
        category: editedItem.category,
        available: editedItem.available,
      };
      setMenuItems([...menuItems, newItem]);
    }

    setEditModalVisible(false);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      setMenuItems(menuItems.filter((item) => item.id !== selectedItem.id));
      setDeleteModalVisible(false);
    }
  };

  const handleToggleAvailability = (item) => {
    setMenuItems(
      menuItems.map((menuItem) =>
        menuItem.id === item.id
          ? { ...menuItem, available: !menuItem.available }
          : menuItem,
      ),
    );
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLargeScreen && (
        <DesktopHeader
          currentAddress="Restaurant Menu"
          onAddressChange={() => {}}
          cartItemCount={0}
        />
      )}
      <ScrollView>
        <View
          style={[
            styles.contentContainer,
            isLargeScreen && styles.largeScreenContentContainer,
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.headerTitle,
                isLargeScreen && styles.largeScreenHeaderTitle,
              ]}
            >
              Menu Management
            </Text>
            <Text style={styles.headerSubtitle}>
              Add, edit, or remove menu items
            </Text>
          </View>

          {/* Search and Add */}
          <View style={styles.searchAddContainer}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search menu items"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={styles.clearButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilterContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category &&
                    styles.selectedCategoryButton,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category &&
                      styles.selectedCategoryButtonText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Menu Items */}
          <View style={styles.menuItemsContainer}>
            {filteredItems.length > 0 ? (
              <View style={isLargeScreen && styles.menuItemsGrid}>
                {filteredItems.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.menuItemCard,
                      !item.available && styles.unavailableItem,
                      isLargeScreen && styles.largeScreenMenuItemCard,
                    ]}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.menuItemImage}
                    />
                    <View style={styles.menuItemInfo}>
                      <View style={styles.menuItemHeader}>
                        <Text style={styles.menuItemName}>{item.name}</Text>
                        <Text style={styles.menuItemPrice}>
                          {formatCurrency(item.price)}
                        </Text>
                      </View>
                      <Text
                        style={styles.menuItemDescription}
                        numberOfLines={2}
                      >
                        {item.description}
                      </Text>
                      <View style={styles.menuItemCategory}>
                        <Text style={styles.menuItemCategoryText}>
                          {item.category}
                        </Text>
                      </View>
                      <View style={styles.menuItemActions}>
                        <TouchableOpacity
                          style={[
                            styles.availabilityButton,
                            item.available
                              ? styles.availableButton
                              : styles.unavailableButton,
                          ]}
                          onPress={() => handleToggleAvailability(item)}
                        >
                          <Text style={styles.availabilityButtonText}>
                            {item.available ? "Available" : "Unavailable"}
                          </Text>
                        </TouchableOpacity>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleEditItem(item)}
                          >
                            <Edit2 size={16} color="#4B5563" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteItem(item)}
                          >
                            <Trash2 size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Menu Items Found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "No items match your search criteria"
                    : "You don't have any items in this category"}
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddButton}
                  onPress={handleAddItem}
                >
                  <Text style={styles.emptyAddButtonText}>Add New Item</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Edit Item Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              isLargeScreen && styles.largeScreenModalContent,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedItem ? "Edit Menu Item" : "Add Menu Item"}
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editFormContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Item Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editedItem.name}
                  onChangeText={(text) =>
                    setEditedItem({ ...editedItem, name: text })
                  }
                  placeholder="Enter item name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={editedItem.description}
                  onChangeText={(text) =>
                    setEditedItem({ ...editedItem, description: text })
                  }
                  placeholder="Enter item description"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Price</Text>
                <View style={styles.priceInputContainer}>
                  <DollarSign size={20} color="#6B7280" />
                  <TextInput
                    style={styles.priceInput}
                    value={editedItem.price}
                    onChangeText={(text) =>
                      setEditedItem({ ...editedItem, price: text })
                    }
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <View style={styles.categoryPickerContainer}>
                  {categories
                    .filter((cat) => cat !== "All")
                    .map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryPickerButton,
                          editedItem.category === category &&
                            styles.selectedCategoryPickerButton,
                        ]}
                        onPress={() =>
                          setEditedItem({ ...editedItem, category })
                        }
                      >
                        <Text
                          style={[
                            styles.categoryPickerButtonText,
                            editedItem.category === category &&
                              styles.selectedCategoryPickerButtonText,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Image URL</Text>
                <TextInput
                  style={styles.formInput}
                  value={editedItem.image}
                  onChangeText={(text) =>
                    setEditedItem({ ...editedItem, image: text })
                  }
                  placeholder="Enter image URL"
                />
                <View style={styles.imagePreviewContainer}>
                  {editedItem.image ? (
                    <Image
                      source={{ uri: editedItem.image }}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <View style={styles.noImagePreview}>
                      <Camera size={24} color="#9CA3AF" />
                      <Text style={styles.noImageText}>No image</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Availability</Text>
                <View style={styles.availabilityContainer}>
                  <TouchableOpacity
                    style={[
                      styles.availabilityOption,
                      editedItem.available && styles.selectedAvailabilityOption,
                    ]}
                    onPress={() =>
                      setEditedItem({ ...editedItem, available: true })
                    }
                  >
                    <Text
                      style={[
                        styles.availabilityOptionText,
                        editedItem.available &&
                          styles.selectedAvailabilityOptionText,
                      ]}
                    >
                      Available
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.availabilityOption,
                      !editedItem.available &&
                        styles.selectedAvailabilityOption,
                    ]}
                    onPress={() =>
                      setEditedItem({ ...editedItem, available: false })
                    }
                  >
                    <Text
                      style={[
                        styles.availabilityOptionText,
                        !editedItem.available &&
                          styles.selectedAvailabilityOptionText,
                      ]}
                    >
                      Unavailable
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveItem}
              >
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              styles.deleteModalContent,
              isLargeScreen && styles.largeScreenDeleteModalContent,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Menu Item</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteConfirmText}>
              Are you sure you want to delete "{selectedItem?.name}"? This
              action cannot be undone.
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={handleConfirmDelete}
              >
                <Trash2 size={20} color="#FFFFFF" />
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    padding: 16,
  },
  largeScreenContentContainer: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  largeScreenHeaderTitle: {
    fontSize: 28,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  searchAddContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  clearButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  categoryFilterContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: "#FF5A5F",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectedCategoryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  menuItemsContainer: {
    marginBottom: 24,
  },
  menuItemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  largeScreenMenuItemCard: {
    width: "48%",
  },
  unavailableItem: {
    opacity: 0.7,
  },
  menuItemImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  menuItemInfo: {
    padding: 16,
  },
  menuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF5A5F",
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  menuItemCategory: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  menuItemCategoryText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  menuItemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availabilityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availableButton: {
    backgroundColor: "#DCFCE7",
  },
  unavailableButton: {
    backgroundColor: "#FEE2E2",
  },
  availabilityButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  actionButtons: {
    flexDirection: "row",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyAddButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  largeScreenModalContent: {
    maxWidth: 600,
    alignSelf: "center",
    marginTop: 60,
    marginBottom: 60,
    borderRadius: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteModalContent: {
    maxHeight: "50%",
  },
  largeScreenDeleteModalContent: {
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  editFormContainer: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 8,
  },
  categoryPickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryPickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryPickerButton: {
    backgroundColor: "#FF5A5F",
  },
  categoryPickerButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectedCategoryPickerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imagePreviewContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  noImagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 8,
  },
  availabilityContainer: {
    flexDirection: "row",
  },
  availabilityOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    borderRadius: 8,
  },
  selectedAvailabilityOption: {
    backgroundColor: "#FF5A5F",
  },
  availabilityOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  selectedAvailabilityOptionText: {
    color: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  deleteConfirmText: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 24,
    textAlign: "center",
  },
  deleteModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteConfirmButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  deleteConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});
