import {
  AlertCircle,
  ChevronDown,
  Truck,
  User,
  Utensils,
} from "lucide-react-native";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppModeType } from "../lib/context/UserTypeContext";

type AppModeSelectorProps = {
  isCompact?: boolean;
};

export default function AppModeSelector({
  isCompact = false,
}: AppModeSelectorProps) {
  const { appMode, setAppMode } = useAppModeType();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "restaurant":
        return <Utensils size={isCompact ? 18 : 24} color="#FF5A5F" />;
      case "driver":
        return <Truck size={isCompact ? 18 : 24} color="#FF5A5F" />;
      default:
        return <User size={isCompact ? 18 : 24} color="#FF5A5F" />;
    }
  };

  const getModeName = (mode: string) => {
    switch (mode) {
      case "restaurant":
        return "Restaurant";
      case "driver":
        return "Driver";
      default:
        return "Customer";
    }
  };

  const handleModeChange = (mode: string) => {
    setAppMode(mode);
    setIsModalVisible(false);
  };

  const renderModeOption = (mode: string) => {
    const isSelected = appMode === mode;

    return (
      <TouchableOpacity
        key={mode}
        style={[styles.modeOption, isSelected && styles.selectedOption]}
        onPress={() => handleModeChange(mode)}
      >
        <View style={styles.modeIconContainer}>{getModeIcon(mode)}</View>
        <Text
          style={[styles.modeText, isSelected && styles.selectedOptionText]}
        >
          {getModeName(mode)}
        </Text>
        {isSelected && <View style={styles.checkmark} />}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.modeSelector, isCompact && styles.compactModeSelector]}
        onPress={() => setIsModalVisible(true)}
      >
        {getModeIcon(appMode)}
        {!isCompact && (
          <>
            <Text style={styles.currentMode}>{getModeName(appMode)}</Text>
            <ChevronDown size={16} color="#6B7280" />
          </>
        )}
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Switch Mode</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.modeOptions}>
              {renderModeOption("customer")}
              {renderModeOption("restaurant")}
              {renderModeOption("driver")}
            </View>

            <View style={styles.noteContainer}>
              <AlertCircle size={16} color="#6B7280" />
              <Text style={styles.noteText}>
                Switching modes changes the app's interface and functionality
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modeSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 16,
  },
  compactModeSelector: {
    width: 36,
    height: 36,
    borderRadius: 18,
    padding: 0,
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    marginLeft: 0,
  },
  currentMode: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginLeft: 8,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "80%",
    maxWidth: 320,
    paddingVertical: 16,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },
  modeOptions: {
    paddingVertical: 8,
  },
  modeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedOption: {
    backgroundColor: "#FF5A5F10",
  },
  modeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modeText: {
    fontSize: 16,
    color: "#1F2937",
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: "600",
    color: "#FF5A5F",
  },
  checkmark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF5A5F",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
    marginLeft: 8,
  },
});
