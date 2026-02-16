// auth/login/otp.tsx
import { STORAGE_KEYS } from '@/constants/storage';
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import merchantApi from '@/services/MerchantApiService';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, ChevronRight, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CODE_LENGTH = 6;

export default function EnterCodeScreen() {
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    if (cleanedText.length <= CODE_LENGTH) {
      setCode(cleanedText);

      if (cleanedText.length === CODE_LENGTH) {
        setTimeout(async () => {
          await handleOTPVerified(cleanedText);
        }, 300);
      }
    }
  };

  const handleOTPVerified = async (otp?: string) => {
    const otpCode = otp || code;
    setLoading(true);
    try {
      const response = await merchantApi.loginComplete({
        phone_number: phoneNumber,
        otp: otpCode,
      });

      if (!response.success) {
        Alert.alert('Error', response.error || 'Invalid OTP');
        setCode('');
        inputRef.current?.focus();
        setLoading(false);
        return;
      }

      const existingMnemonic = await SecureStore.getItemAsync(
        STORAGE_KEYS.wallet_mnemonic_primary
      );

      if (existingMnemonic) {
        router.replace('/(tabs)/home');
      } else {
        router.push('/auth/login/import-wallet');
      }
    } catch (error) {
      const err = merchantApi.handleError(error);
      Alert.alert('Error', err.error);
      setCode('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (code.length === CODE_LENGTH) {
      handleOTPVerified();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      const response = await merchantApi.resendOTP(phoneNumber);
      if (response.success) {
        setResendTimer(30);
        setCode('');
        inputRef.current?.focus();
        Alert.alert('Success', 'OTP resent successfully');
      } else {
        Alert.alert('Error', response.error || 'Failed to resend OTP');
      }
    } catch (error) {
      const err = merchantApi.handleError(error);
      Alert.alert('Error', err.error);
    }
  };

  const maskedPhone = phoneNumber
    ? `${phoneNumber.slice(0, 4)}****${phoneNumber.slice(-3)}`
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Hidden Input */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={code}
        onChangeText={handleCodeChange}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        autoFocus
        caretHidden
      />

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
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
          </Text>
        </View>

        {/* Code Boxes */}
        <TouchableOpacity
          style={styles.codeContainer}
          onPress={() => inputRef.current?.focus()}
          activeOpacity={1}
        >
          {Array.from({ length: CODE_LENGTH }).map((_, index) => {
            const isFilled = index < code.length;
            const isActive = index === code.length;

            return (
              <View
                key={index}
                style={[
                  styles.codeBox,
                  isActive && styles.codeBoxActive,
                  isFilled && styles.codeBoxFilled,
                ]}
              >
                {isFilled ? (
                  <Text style={styles.codeDigit}>{code[index]}</Text>
                ) : isActive ? (
                  <View style={styles.cursor} />
                ) : null}
              </View>
            );
          })}
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResend}
          disabled={resendTimer > 0}
          activeOpacity={0.7}
        >
          <RefreshCw
            size={layout.iconSize.xs}
            color={resendTimer > 0 ? colors.textMuted : colors.primary}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.resendText,
              resendTimer > 0 && styles.resendTextDisabled,
            ]}
          >
            {resendTimer > 0
              ? `Resend code in ${resendTimer}s`
              : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (code.length !== CODE_LENGTH || loading) && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={code.length !== CODE_LENGTH || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textWhite} />
          ) : null}
          <Text style={styles.nextButtonText}>
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </Text>
          {!loading && (
            <ChevronRight
              size={layout.iconSize.sm}
              color={colors.textWhite}
              strokeWidth={2.5}
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const codeBoxSize = Math.min((width - 48 - 50) / CODE_LENGTH, 52);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  header: {
    height: layout.headerHeight,
    paddingHorizontal: layout.screenPaddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
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
  phoneHighlight: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  codeBox: {
    width: codeBoxSize,
    height: codeBoxSize + 8,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  codeBoxActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.sm,
  },
  codeBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  codeDigit: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  resendText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  resendTextDisabled: {
    color: colors.textMuted,
  },
  bottomSection: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['2xl'],
  },
  nextButton: {
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
  nextButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
});