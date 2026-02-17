// settings/bank-details.tsx
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
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BankDetailsScreen() {
  const router = useRouter();
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const isFormValid =
    bankName.length > 0 &&
    accountNumber.trim().length > 0 &&
    accountName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Account Details</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      <View style={styles.formContainer}>
        {/* Bank Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bank</Text>
          <TouchableOpacity
            style={styles.selectorContainer}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <View style={styles.inputIconWrap}>
              <Building
                size={layout.iconSize.sm}
                color={bankName ? colors.primary : colors.textTertiary}
                strokeWidth={1.8}
              />
            </View>
            <Text
              style={[
                styles.selectorText,
                !bankName && styles.placeholderText,
              ]}
            >
              {bankName || 'Select your bank'}
            </Text>
            <ChevronDown
              size={layout.iconSize.sm}
              color={colors.textTertiary}
              strokeWidth={1.8}
            />
          </TouchableOpacity>
        </View>

        {/* Account Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Number</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrap}>
              <CreditCard
                size={layout.iconSize.sm}
                color={
                  accountNumber ? colors.primary : colors.textTertiary
                }
                strokeWidth={1.8}
              />
            </View>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="0000000000"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {/* Account Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Name</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconWrap}>
              <User
                size={layout.iconSize.sm}
                color={
                  accountName ? colors.primary : colors.textTertiary
                }
                strokeWidth={1.8}
              />
            </View>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="Account holder name"
              placeholderTextColor={colors.textPlaceholder}
            />
          </View>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !isFormValid && styles.buttonDisabled,
          ]}
          onPress={() => router.back()}
          activeOpacity={0.85}
          disabled={!isFormValid}
        >
          <Text style={styles.saveButtonText}>Save Details</Text>
          <ChevronRight
            size={layout.iconSize.sm}
            color={colors.textWhite}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  selectorContainer: {
    height: layout.inputHeight,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  inputIconWrap: {
    width: layout.iconSize.md,
    alignItems: 'center',
  },
  selectorText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  placeholderText: {
    color: colors.textPlaceholder,
    fontWeight: typography.fontWeight.regular,
  },
  inputContainer: {
    height: layout.inputHeight,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.textPrimary,
    height: '100%',
  },
  buttonContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['2xl'],
  },
  saveButton: {
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
});