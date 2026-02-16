// auth/setup/bank_setup.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Building,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Search,
  User,
  X,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
} from 'react-native';

// ─── Bank List ──────────────────────────────────────────────────────────────

const BANKS = [
  'Access Bank',
  'Abbey Mortgage Bank',
  'Ecobank Nigeria',
  'Union Bank of Nigeria',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'First Bank of Nigeria',
  'Guaranty Trust Bank',
  'United Bank for Africa',
  'Zenith Bank',
  'Fidelity Bank',
  'Polaris Bank',
  'Wema Bank',
  'Keystone Bank',
  'Heritage Bank',
  'Providus Bank',
  'Jaiz Bank',
  'FCMB',
  'Citibank Nigeria',
  'Standard Chartered Bank',
];

// ─── Bank Selector Bottom Sheet ─────────────────────────────────────────────

interface BankSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (bank: string) => void;
  selectedBank?: string;
}

const BankSelector: React.FC<BankSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  selectedBank,
}) => {
  const [search, setSearch] = useState('');

  const filteredBanks = useMemo(() => {
    if (!search.trim()) return BANKS;
    return BANKS.filter((bank) =>
      bank.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSelect = (bank: string) => {
    setSearch('');
    onSelect(bank);
  };

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={sheetStyles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={sheetStyles.sheet}>
              {/* Handle */}
              <View style={sheetStyles.handleContainer}>
                <View style={sheetStyles.handle} />
              </View>

              {/* Header */}
              <View style={sheetStyles.header}>
                <Text style={sheetStyles.title}>Select Bank</Text>
                <TouchableOpacity
                  style={sheetStyles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <X
                    size={layout.iconSize.sm}
                    color={colors.textTertiary}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <View style={sheetStyles.searchContainer}>
                <Search
                  size={layout.iconSize.sm}
                  color={colors.textTertiary}
                  strokeWidth={1.8}
                />
                <TextInput
                  style={sheetStyles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search banks…"
                  placeholderTextColor={colors.textPlaceholder}
                  autoCorrect={false}
                />
                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch('')}
                    activeOpacity={0.7}
                  >
                    <X
                      size={layout.iconSize.xs}
                      color={colors.textMuted}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Bank List */}
              <FlatList
                data={filteredBanks}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      sheetStyles.bankItem,
                      selectedBank === item && sheetStyles.bankItemSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Building
                      size={layout.iconSize.sm}
                      color={
                        selectedBank === item
                          ? colors.primary
                          : colors.textTertiary
                      }
                      strokeWidth={1.8}
                    />
                    <Text
                      style={[
                        sheetStyles.bankItemText,
                        selectedBank === item && sheetStyles.bankItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                style={sheetStyles.bankList}
                contentContainerStyle={sheetStyles.bankListContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => (
                  <View style={sheetStyles.separator} />
                )}
                ListEmptyComponent={
                  <View style={sheetStyles.emptyContainer}>
                    <Text style={sheetStyles.emptyText}>No banks found</Text>
                  </View>
                }
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing['2xl'],
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  closeButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.inputHeightSmall,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    marginHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textPrimary,
    height: '100%',
  },
  bankList: {
    marginTop: spacing.base,
  },
  bankListContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.lg,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
  },
  bankItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  bankItemText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  bankItemTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
  },
  emptyContainer: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
  },
});

// ─── Reusable Form Field ────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, icon, children }) => (
  <View style={formStyles.group}>
    <Text style={formStyles.label}>{label}</Text>
    {children}
  </View>
);

const formStyles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
});

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function BankSetup() {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [resolving, setResolving] = useState(false);

  const isFormValid =
    selectedBank.length > 0 &&
    accountNumber.trim().length > 0 &&
    accountName.trim().length > 0;

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    setShowBankSelector(false);
  };

  const handleAccountNumberChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, 10);
    setAccountNumber(sanitized);

    if (sanitized.length === 10 && selectedBank) {
      setResolving(true);
      setTimeout(() => {
        setAccountName('John Doe');
        setResolving(false);
      }, 1000);
    } else {
      setAccountName('');
    }
  };

  const handleNext = () => {
    if (isFormValid) {
      router.push('/auth/setup/pin');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft
            size={layout.iconSize.md}
            color={colors.textPrimary}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Setup</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Subtitle */}
            <View style={styles.subtitleSection}>
              <View style={styles.subtitleIcon}>
                <CreditCard
                  size={layout.iconSize.lg}
                  color={colors.primary}
                  strokeWidth={1.8}
                />
              </View>
              <Text style={styles.subtitle}>
                Link your bank account for seamless fiat withdrawals
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formSection}>
              {/* Bank Selector */}
              <FormField label="Bank" icon={null}>
                <TouchableOpacity
                  style={[
                    styles.selectorContainer,
                    selectedBank && styles.selectorContainerActive,
                  ]}
                  onPress={() => setShowBankSelector(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.selectorIcon}>
                    <Building
                      size={layout.iconSize.sm}
                      color={
                        selectedBank ? colors.primary : colors.textTertiary
                      }
                      strokeWidth={1.8}
                    />
                  </View>
                  <Text
                    style={[
                      styles.selectorText,
                      !selectedBank && styles.selectorPlaceholder,
                    ]}
                  >
                    {selectedBank || 'Select your bank'}
                  </Text>
                  <ChevronDown
                    size={layout.iconSize.sm}
                    color={colors.textTertiary}
                    strokeWidth={1.8}
                  />
                </TouchableOpacity>
              </FormField>

              {/* Account Number */}
              <FormField label="Account Number" icon={null}>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <CreditCard
                      size={layout.iconSize.sm}
                      color={
                        accountNumber ? colors.primary : colors.textTertiary
                      }
                      strokeWidth={1.8}
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={accountNumber}
                    onChangeText={handleAccountNumberChange}
                    placeholder="0000000000"
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType="number-pad"
                    maxLength={10}
                    returnKeyType="done"
                  />
                  {resolving && (
                    <ActivityIndicator size="small" color={colors.primary} />
                  )}
                </View>
              </FormField>

              {/* Account Name */}
              <FormField label="Account Name" icon={null}>
                <View
                  style={[
                    styles.inputWrapper,
                    !accountName && styles.inputWrapperDisabled,
                    accountName && styles.inputWrapperSuccess,
                  ]}
                >
                  <View style={styles.inputIconContainer}>
                    <User
                      size={layout.iconSize.sm}
                      color={
                        accountName ? colors.success : colors.textTertiary
                      }
                      strokeWidth={1.8}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      accountName && styles.textInputResolved,
                    ]}
                    value={accountName}
                    onChangeText={setAccountName}
                    placeholder="Auto-resolved from account number"
                    placeholderTextColor={colors.textPlaceholder}
                    editable={accountNumber.length === 10}
                    returnKeyType="done"
                  />
                </View>
              </FormField>
            </View>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Bottom Buttons */}
            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !isFormValid && styles.buttonDisabled,
                ]}
                onPress={handleNext}
                disabled={!isFormValid}
                activeOpacity={0.85}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <ChevronRight
                  size={layout.iconSize.sm}
                  color={colors.textWhite}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.goBackButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.goBackButtonText}>Go back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <BankSelector
        visible={showBankSelector}
        onClose={() => setShowBankSelector(false)}
        onSelect={handleBankSelect}
        selectedBank={selectedBank}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: layout.headerHeight,
    paddingHorizontal: layout.screenPaddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  subtitleSection: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  subtitleIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textAlign: 'center',
    color: colors.textTertiary,
    paddingHorizontal: spacing.xl,
  },
  formSection: {
    gap: spacing.lg,
  },

  // Selector
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.inputHeight,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  selectorContainerActive: {
    borderColor: colors.border,
  },
  selectorIcon: {
    width: layout.iconSize.md,
    alignItems: 'center',
  },
  selectorText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  selectorPlaceholder: {
    color: colors.textPlaceholder,
    fontWeight: typography.fontWeight.regular,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.inputHeight,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  inputWrapperDisabled: {
    opacity: 0.6,
  },
  inputWrapperSuccess: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  inputIconContainer: {
    width: layout.iconSize.md,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.textPrimary,
    height: '100%',
  },
  textInputResolved: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },

  // Bottom
  bottomSection: {
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  nextButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
  goBackButton: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBackButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
});