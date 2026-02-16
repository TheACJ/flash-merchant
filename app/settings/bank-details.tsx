import { borderRadius, colors, layout, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BankDetailsScreen() {
  const router = useRouter();
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleNext = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity
          style={styles.backButton as ViewStyle}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle as TextStyle}>Account details</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.formContainer as ViewStyle}>
        {/* Bank Name Input */}
        <View style={styles.inputGroup as ViewStyle}>
          <Text style={styles.label as TextStyle}>Enter your bank</Text>
          <TouchableOpacity
            style={styles.inputContainer as ViewStyle}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Text style={styles.placeholderText as TextStyle}>Select bank</Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Account Number Input */}
        <View style={styles.inputGroup as ViewStyle}>
          <Text style={styles.label as TextStyle}>Enter account number</Text>
          <View style={styles.inputContainer as ViewStyle}>
            <TextInput
              style={styles.input as TextStyle}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Account number"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {/* Account Name Input */}
        <View style={styles.inputGroup as ViewStyle}>
          <Text style={styles.label as TextStyle}>Enter account name</Text>
          <View style={styles.inputContainer as ViewStyle}>
            <TextInput
              style={styles.input as TextStyle}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="Account name"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer as ViewStyle}>
        <TouchableOpacity
          style={styles.nextButton as ViewStyle}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText as TextStyle}>Next</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    height: layout.inputHeight,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: typography.fontSize.md,
    color: colors.textTertiary,
  },
  input: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    fontWeight: typography.fontWeight.regular,
  },
});
