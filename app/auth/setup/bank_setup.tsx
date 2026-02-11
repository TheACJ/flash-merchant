import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Path, Svg } from "react-native-svg";

// --- Icons ---

const CaretDownIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.5 8.25L12 15.75L4.5 8.25"
      stroke="#323333"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SearchIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.875 18.75C15.2242 18.75 18.75 15.2242 18.75 10.875C18.75 6.52576 15.2242 3 10.875 3C6.52576 3 3 6.52576 3 10.875C3 15.2242 6.52576 18.75 10.875 18.75Z"
      stroke="#657084"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.4431 16.4438L20.9994 21.0001"
      stroke="#657084"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// --- Bank List ---

const BANKS = [
  "Access Bank",
  "Abbey Mortgage Bank",
  "Ecobank Nigeria",
  "Union Bank of Nigeria",
  "Stanbic IBTC Bank",
  "Sterling Bank",
  "First Bank of Nigeria",
  "Guaranty Trust Bank",
  "United Bank for Africa",
  "Zenith Bank",
  "Fidelity Bank",
  "Polaris Bank",
  "Wema Bank",
  "Keystone Bank",
  "Heritage Bank",
  "Providus Bank",
  "Jaiz Bank",
  "FCMB",
  "Citibank Nigeria",
  "Standard Chartered Bank",
];

// --- Bank Selector Bottom Sheet ---

interface BankSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (bank: string) => void;
}

const BankSelector: React.FC<BankSelectorProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState("");

  const filteredBanks = useMemo(() => {
    if (!search.trim()) return BANKS;
    return BANKS.filter((bank) =>
      bank.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSelect = (bank: string) => {
    setSearch("");
    onSelect(bank);
  };

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  const renderBankItem = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.bankItem,
        index === 0 && styles.bankItemFirst,
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.bankItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.bottomSheet}>
              {/* Handle Bar */}
              <View style={styles.handleBarContainer}>
                <View style={styles.handleBar} />
              </View>

              {/* Title */}
              <Text style={styles.sheetTitle}>Select</Text>

              {/* Search */}
              <View style={styles.searchContainer}>
                <SearchIcon />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search ..."
                  placeholderTextColor="#657084"
                  autoCorrect={false}
                />
              </View>

              {/* Bank List */}
              <FlatList
                data={filteredBanks}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={renderBankItem}
                style={styles.bankList}
                contentContainerStyle={styles.bankListContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
              />

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// --- Main Screen ---

export default function BankSetup() {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [showBankSelector, setShowBankSelector] = useState(false);

  const isFormValid =
    selectedBank.length > 0 &&
    accountNumber.trim().length > 0 &&
    accountName.trim().length > 0;

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    setShowBankSelector(false);
  };

  const handleNext = () => {
    if (isFormValid) {
      // Navigate to PIN setup
      router.push('/auth/setup/pin');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleAccountNumberChange = (value: string) => {
    // Only allow numbers, max 10 digits
    const sanitized = value.replace(/[^0-9]/g, "").slice(0, 10);
    setAccountNumber(sanitized);

    // Simulate account name resolution when 10 digits entered
    if (sanitized.length === 10 && selectedBank) {
      // In a real app, you'd call an API here
      setTimeout(() => {
        setAccountName("John Doe");
      }, 500);
    } else {
      setAccountName("");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Bank setup</Text>
              <Text style={styles.subtitle}>Setup your bank details</Text>
            </View>

            {/* Form */}
            <View style={styles.formSection}>
              {/* Bank Selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Enter your bank</Text>
                <TouchableOpacity
                  style={styles.selectorContainer}
                  onPress={() => setShowBankSelector(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.selectorContent}>
                    <Text
                      style={[
                        styles.selectorText,
                        !selectedBank && styles.selectorPlaceholder,
                      ]}
                    >
                      {selectedBank || "Select bank"}
                    </Text>
                    <CaretDownIcon />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Account Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Enter account number</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={accountNumber}
                    onChangeText={handleAccountNumberChange}
                    placeholder="account number"
                    placeholderTextColor="#657084"
                    keyboardType="number-pad"
                    maxLength={10}
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Account Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Enter account name</Text>
                <View
                  style={[
                    styles.inputContainer,
                    !accountName && styles.inputDisabled,
                  ]}
                >
                  <TextInput
                    style={[
                      styles.textInput,
                      accountName ? styles.resolvedName : {},
                    ]}
                    value={accountName}
                    onChangeText={setAccountName}
                    placeholder="account name"
                    placeholderTextColor="#657084"
                    editable={accountNumber.length === 10}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>

            {/* Bottom Buttons */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !isFormValid && styles.nextButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={!isFormValid}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.goBackButton}
                onPress={handleGoBack}
                activeOpacity={0.8}
              >
                <Text style={styles.goBackButtonText}>Go back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Bank Selector Bottom Sheet */}
      <BankSelector
        visible={showBankSelector}
        onClose={() => setShowBankSelector(false)}
        onSelect={handleBankSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- Main Screen ---
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: "center",
    gap: 15,
    marginTop: 50,
  },
  title: {
    fontFamily: "System",
    fontWeight: "600",
    fontSize: 25,
    lineHeight: 25,
    textAlign: "center",
    color: "#000000",
  },
  subtitle: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 20,
    lineHeight: 25,
    textAlign: "center",
    color: "#323333",
  },
  formSection: {
    marginTop: 30,
    gap: 25,
  },
  fieldGroup: {
    gap: 15,
  },
  fieldLabel: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "#000000",
  },

  // --- Selector ---
  selectorContainer: {
    height: 60,
    backgroundColor: "#F4F6F5",
    borderWidth: 1,
    borderColor: "#D2D6E1",
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  selectorContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 22,
    color: "#000000",
  },
  selectorPlaceholder: {
    color: "#657084",
  },

  // --- Text Input ---
  inputContainer: {
    height: 60,
    backgroundColor: "#F4F6F5",
    borderWidth: 1,
    borderColor: "#D2D6E1",
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  textInput: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 22,
    color: "#000000",
    height: "100%",
  },
  resolvedName: {
    color: "#000000",
    fontWeight: "500",
  },

  // --- Bottom Buttons ---
  bottomSection: {
    position: "absolute",
    bottom: 60,
    left: 24,
    right: 24,
    gap: 20,
  },
  nextButton: {
    backgroundColor: "#0F6EC0",
    borderRadius: 15,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#F5F5F5",
  },
  goBackButton: {
    backgroundColor: "rgba(15, 114, 199, 0.1)",
    borderRadius: 15,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  goBackButtonText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#000000",
  },

  // --- Modal / Bottom Sheet ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: "70%",
    paddingBottom: 40,
  },
  handleBarContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D2D6E1",
    borderRadius: 2,
  },
  sheetTitle: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 25,
    lineHeight: 22,
    textAlign: "center",
    color: "#000000",
    marginTop: 12,
    marginBottom: 20,
  },

  // --- Search ---
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    borderWidth: 0.5,
    borderColor: "#657084",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 15,
    color: "#000000",
    height: "100%",
  },

  // --- Bank List ---
  bankList: {
    marginTop: 20,
    maxHeight: 400,
  },
  bankListContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  bankItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minHeight: 50,
    justifyContent: "center",
  },
  bankItemFirst: {
    backgroundColor: "#F4F6F5",
  },
  bankItemText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    color: "#000000",
  },

  // --- Cancel ---
  cancelButton: {
    backgroundColor: "rgba(15, 114, 199, 0.1)",
    borderRadius: 15,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 10,
  },
  cancelButtonText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#000000",
  },
});