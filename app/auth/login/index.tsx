// auth/login/index.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import merchantApi from '@/services/MerchantApiService';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, Phone, Zap } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleContinue = async () => {
    if (phoneNumber.length === 0) return;
    setLoading(true);
    try {
      const response = await merchantApi.loginInitiate({
        phone_number: phoneNumber,
      });

      if (response.success) {
        router.push({
          pathname: '/auth/login/otp',
          params: { phoneNumber },
        });
      } else {
        Alert.alert('Error', response.error || 'Login failed');
      }
    } catch (error) {
      const err = merchantApi.handleError(error);
      Alert.alert('Error', err.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Brand Mark */}
        <View style={styles.brandContainer}>
          <View style={styles.brandCircle}>
            <Zap
              size={layout.iconSize.xl}
              color={colors.primary}
              strokeWidth={1.8}
              fill={colors.primaryLight}
            />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in with your registered mobile number
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                phoneNumber.length > 0 && styles.inputWrapperActive,
              ]}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            >
              <View style={styles.inputIcon}>
                <Phone
                  size={layout.iconSize.sm}
                  color={
                    phoneNumber.length > 0
                      ? colors.primary
                      : colors.textTertiary
                  }
                  strokeWidth={1.8}
                />
              </View>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="+234 800 000 0000"
                placeholderTextColor={colors.textPlaceholder}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!phoneNumber || loading) && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!phoneNumber || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textWhite} />
            ) : null}
            <Text style={styles.continueButtonText}>
              {loading ? 'Sending OTP…' : 'Continue'}
            </Text>
            {!loading && (
              <ChevronRight
                size={layout.iconSize.sm}
                color={colors.textWhite}
                strokeWidth={2.5}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/create-wallet' as any)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.footerLink}
          >
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.linkText}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing['5xl'],
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['2xl'],
    flexGrow: 1,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  brandCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryMedium,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textAlign: 'center',
    color: colors.textTertiary,
  },
  formContainer: {
    marginBottom: spacing['3xl'],
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
  inputWrapperActive: {
    borderColor: colors.borderActive,
    backgroundColor: colors.backgroundCard,
  },
  inputIcon: {
    width: layout.iconSize.md,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.textPrimary,
    height: '100%',
  },
  bottomContainer: {
    gap: spacing.lg,
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
  continueButton: {
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
  continueButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  footerText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  linkText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});