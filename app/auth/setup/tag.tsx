// auth/setup/tag.tsx
import { ONBOARDING_STEPS } from '@/constants/storage';
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import merchantApi from '@/services/MerchantApiService';
import { setOnboardingStep } from '@/utils/onboarding';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  AtSign,
  CheckCircle2,
  ChevronRight,
  Loader2,
  XCircle,
} from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const TAKEN_TAGS = ['admin', 'flash', 'merchant', 'test', 'user'];

type TagStatus = 'idle' | 'checking' | 'available' | 'taken';

export default function CreateTag() {
  const router = useRouter();
  const [tag, setTag] = useState('');
  const [tagStatus, setTagStatus] = useState<TagStatus>('idle');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSubmittingRef = useRef(false);

  const checkTagAvailability = useCallback(async (value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length < 3) {
      setTagStatus('idle');
      return;
    }

    setTagStatus('checking');

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await merchantApi.checkTagAvailability(value.trim());
        if (response.success && response.data) {
          setTagStatus(response.data.available ? 'available' : 'taken');
        } else {
          const isTaken = TAKEN_TAGS.includes(value.trim().toLowerCase());
          setTagStatus(isTaken ? 'taken' : 'available');
        }
      } catch {
        const isTaken = TAKEN_TAGS.includes(value.trim().toLowerCase());
        setTagStatus(isTaken ? 'taken' : 'available');
      }
    }, 800);
  }, []);

  const handleTagChange = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '');
    setTag(sanitized);
    checkTagAvailability(sanitized);
  };

  const handleNext = async () => {
    if (tagStatus !== 'available') return;
    
    // Prevent double submission
    if (isSubmittingRef.current) {
      console.log('Already submitting, ignoring duplicate request');
      return;
    }
    
    isSubmittingRef.current = true;
    setLoading(true);
    
    try {
      const response = await merchantApi.addMerchantTag({ tag: tag.trim() });

      console.log('🏷️ Tag creation response:', JSON.stringify(response, null, 2));

      // Check for success - backend returns status 200 and message on success
      // The response structure is: { data: { merchant, tag }, message: "...", status: 200 }
      const isSuccess = response.status === 200 || 
                        response.message?.includes('successfully') ||
                        response.data?.merchant?.tag;
      
      if (isSuccess) {
        await setOnboardingStep(ONBOARDING_STEPS.bank_setup);
        Alert.alert('Success', response.message || 'Merchant tag created successfully!', [
          {
            text: 'Continue',
            onPress: () => router.replace('/auth/setup/bank_setup'),
          },
        ]);
      } else {
        // Check if the error is "Merchant already has a tag" - this means success in a way
        if (response.error?.includes('already has a tag') || response.data?.error?.includes('already has a tag')) {
          await setOnboardingStep(ONBOARDING_STEPS.bank_setup);
          Alert.alert('Success', 'Merchant tag already exists!', [
            {
              text: 'Continue',
              onPress: () => router.replace('/auth/setup/bank_setup'),
            },
          ]);
        } else {
          const errorMsg = response.error || response.data?.error || response.message || 'Failed to create tag';
          Alert.alert('Error', errorMsg);
        }
      }
    } catch (error) {
      console.error('🏷️ Tag creation error:', error);
      const err = merchantApi.handleError(error);
      // Check if the error is "Merchant already has a tag"
      if (err.error?.includes('already has a tag')) {
        await setOnboardingStep(ONBOARDING_STEPS.bank_setup);
        Alert.alert('Success', 'Merchant tag already exists!', [
          {
            text: 'Continue',
            onPress: () => router.replace('/auth/setup/bank_setup'),
          },
        ]);
      } else {
        Alert.alert('Error', err.error);
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const getInputBorderColor = () => {
    switch (tagStatus) {
      case 'available':
        return colors.success;
      case 'taken':
        return colors.error;
      default:
        return colors.borderLight;
    }
  };

  const getStatusConfig = () => {
    switch (tagStatus) {
      case 'available':
        return { text: 'Tag is available!', color: colors.success };
      case 'taken':
        return { text: 'Tag is already taken', color: colors.error };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

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
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Title */}
          <View style={styles.headerSection}>
            <View style={styles.titleIconContainer}>
              <AtSign
                size={layout.iconSize.xl}
                color={colors.primary}
                strokeWidth={1.8}
              />
            </View>
            <Text style={styles.title}>Create Merchant Tag</Text>
            <Text style={styles.subtitle}>
              Choose a unique identity tag for your merchant account
            </Text>
          </View>

          {/* Tag Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Merchant Tag</Text>
            <View
              style={[
                styles.inputContainer,
                { borderColor: getInputBorderColor() },
                tagStatus === 'available' && styles.inputContainerSuccess,
                tagStatus === 'taken' && styles.inputContainerError,
              ]}
            >
              <View style={styles.inputPrefix}>
                <Text style={styles.inputPrefixText}>@</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={tag}
                onChangeText={handleTagChange}
                placeholder="yourmerchantname"
                placeholderTextColor={colors.textPlaceholder}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />

              {/* Status Icon */}
              <View style={styles.statusIconContainer}>
                {tagStatus === 'checking' && (
                  <Loader2
                    size={layout.iconSize.md}
                    color={colors.primary}
                    strokeWidth={2}
                  />
                )}
                {tagStatus === 'available' && (
                  <CheckCircle2
                    size={layout.iconSize.md}
                    color={colors.success}
                    strokeWidth={2}
                  />
                )}
                {tagStatus === 'taken' && (
                  <XCircle
                    size={layout.iconSize.md}
                    color={colors.error}
                    strokeWidth={2}
                  />
                )}
              </View>
            </View>

            {/* Status Message */}
            {statusConfig && (
              <View style={styles.statusRow}>
                {tagStatus === 'available' ? (
                  <CheckCircle2
                    size={14}
                    color={statusConfig.color}
                    strokeWidth={2.5}
                  />
                ) : (
                  <XCircle
                    size={14}
                    color={statusConfig.color}
                    strokeWidth={2.5}
                  />
                )}
                <Text style={[styles.statusMessage, { color: statusConfig.color }]}>
                  {statusConfig.text}
                </Text>
              </View>
            )}

            {/* Hint */}
            {tag.length > 0 && tag.length < 3 && (
              <Text style={styles.hintText}>
                Tag must be at least 3 characters
              </Text>
            )}
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Bottom Buttons */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                (tagStatus !== 'available' || loading) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleNext}
              disabled={tagStatus !== 'available' || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.textWhite} />
              ) : null}
              <Text style={styles.nextButtonText}>
                {loading ? 'Creating…' : 'Create Tag'}
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
              style={styles.goBackButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.goBackButtonText}>Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  headerSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  titleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textAlign: 'center',
    color: colors.textTertiary,
    paddingHorizontal: spacing.lg,
  },
  inputSection: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.inputHeight,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingRight: spacing.base,
    overflow: 'hidden',
  },
  inputContainerSuccess: {
    backgroundColor: colors.successLight,
  },
  inputContainerError: {
    backgroundColor: colors.errorLight,
  },
  inputPrefix: {
    height: '100%',
    paddingHorizontal: spacing.base,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  inputPrefixText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: colors.textPrimary,
    height: '100%',
    paddingHorizontal: spacing.md,
  },
  statusIconContainer: {
    width: layout.iconSize.lg,
    height: layout.iconSize.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusMessage: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textMuted,
  },
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