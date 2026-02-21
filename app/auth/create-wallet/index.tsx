// auth/create-wallet/index.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useGlobalLocation } from '@/hooks';
import { useWalletGeneration } from '@/hooks/useWalletGeneration';
import merchantApi from '@/services/MerchantApiService';
import { merchantProfileOrchestrator } from '@/services/MerchantProfileOrchestrator';
import walletWorkletService from '@/services/WalletWorkletService';
import { setAuthenticated, setSessionToken } from '@/store/slices/merchantAuthSlice';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Building2,
  Mail,
  MapPin,
  Phone,
  User
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SignupData {
  phoneNumber?: string;
  email?: string;
  name?: string;
  businessName?: string;
  address?: string;
  verificationCode?: string;
  sessionToken?: string;
  location?: {
    address?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
  merchant?: any; // Merchant data from API response
  access?: string; // Access token from API response
}

// ─── Reusable Input Component ───────────────────────────────────────────────

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: React.ReactNode;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  error,
}) => (
  <View style={inputStyles.group}>
    <Text style={inputStyles.label}>{label}</Text>
    <View
      style={[
        inputStyles.wrapper,
        !editable && inputStyles.wrapperDisabled,
        error ? inputStyles.wrapperError : null,
        value.length > 0 && !error ? inputStyles.wrapperActive : null,
      ]}
    >
      <View style={inputStyles.iconContainer}>{icon}</View>
      <TextInput
        style={[
          inputStyles.input,
          multiline && inputStyles.inputMultiline,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
      />
    </View>
    {error ? (
      <View style={inputStyles.errorRow}>
        <AlertTriangle size={12} color={colors.warning} strokeWidth={2.5} />
        <Text style={inputStyles.errorText}>{error}</Text>
      </View>
    ) : null}
  </View>
);

const inputStyles = StyleSheet.create({
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
  wrapper: {
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
  wrapperActive: {
    borderColor: colors.border,
  },
  wrapperDisabled: {
    backgroundColor: colors.backgroundInput,
    opacity: 0.7,
  },
  wrapperError: {
    borderColor: colors.warning,
    borderWidth: 1.5,
  },
  iconContainer: {
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
  inputMultiline: {
    minHeight: layout.inputHeight,
    height: undefined,
    textAlignVertical: 'top',
    paddingTop: spacing.base,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.warning,
  },
});

// ─── Step Indicator ─────────────────────────────────────────────────────────

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => (
  <View style={stepStyles.container}>
    {Array.from({ length: totalSteps }).map((_, i) => (
      <View
        key={i}
        style={[
          stepStyles.bar,
          i < currentStep ? stepStyles.barActive : stepStyles.barInactive,
          i === currentStep - 1 && stepStyles.barCurrent,
        ]}
      />
    ))}
  </View>
);

const stepStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.xl,
  },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: borderRadius.full,
  },
  barActive: {
    backgroundColor: colors.primary,
  },
  barInactive: {
    backgroundColor: colors.borderLight,
  },
  barCurrent: {
    backgroundColor: colors.primary,
  },
});

// ─── Screen 1: Account Details ──────────────────────────────────────────────

interface SignupScreen1Props {
  onNext: (data: SignupData) => void;
}

const SignupScreen1: React.FC<SignupScreen1Props> = ({ onNext }) => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const { status: walletStatus, progress } = useWalletGeneration();

  // Use global location from Redux (fetched at app startup)
  const {
    location: globalLocation,
    isLoading: locationLoading,
    fetchLocation
  } = useGlobalLocation();

  useEffect(() => {
    // Start wallet generation in the background as soon as component mounts
    walletWorkletService.startBackgroundGeneration();

    // If we don't have a global location yet, try to fetch it
    // This is a fallback in case the app root didn't fetch it yet
    if (!globalLocation) {
      fetchLocation();
    }
  }, []);

  // Update local state when global location changes
  useEffect(() => {
    if (globalLocation) {
      setLatitude(globalLocation.latitude);
      setLongitude(globalLocation.longitude);

      // Use formatted address if available, otherwise build from components
      if (globalLocation.formattedAddress) {
        setAddress(globalLocation.formattedAddress);
        setState(globalLocation.region || globalLocation.city || '');
      } else if (globalLocation.city || globalLocation.region) {
        const addressParts = [
          globalLocation.name,
          globalLocation.street,
          globalLocation.district,
          globalLocation.city,
          globalLocation.region,
        ].filter(Boolean);
        setAddress(addressParts.join(', '));
        setState(globalLocation.region || globalLocation.city || '');
      }
    }
  }, [globalLocation]);

  const isFormValid = phoneNumber && email && name && address && state;

  const handleCreateAccount = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      const response = await merchantApi.registerInitiate({
        phone_number: phoneNumber,
        email,
        name,
        business_name: businessName,
        location: { address, state, latitude, longitude },
      });

      if (response.session_token) {
        onNext({
          phoneNumber,
          email,
          name,
          businessName,
          address,
          sessionToken: response.session_token,
          location: { address, state, latitude, longitude },
        });
      } else {
        Alert.alert('Error', response.error || 'Registration failed');
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
        <StepIndicator currentStep={1} totalSteps={2} />

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>Create your account</Text>
          <Text style={styles.screenSubtitle}>
            Set up your Flash merchant POS in minutes
          </Text>

          {/* Wallet Generation Progress Indicator */}
          {walletStatus === 'generating' && (
            <View style={styles.walletProgressContainer}>
              <View style={styles.walletProgressBar}>
                <View style={[styles.walletProgressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.walletProgressText}>
                Preparing your wallets... {progress}%
              </Text>
            </View>
          )}
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <FormInput
            label="Phone Number"
            placeholder="+234 800 000 0000"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            icon={
              <Phone
                size={layout.iconSize.sm}
                color={colors.textTertiary}
                strokeWidth={1.8}
              />
            }
          />

          <FormInput
            label="Email Address"
            placeholder="merchant@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={
              <Mail
                size={layout.iconSize.sm}
                color={colors.textTertiary}
                strokeWidth={1.8}
              />
            }
          />

          <FormInput
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            icon={
              <User
                size={layout.iconSize.sm}
                color={colors.textTertiary}
                strokeWidth={1.8}
              />
            }
          />

          <FormInput
            label="Business Name"
            placeholder="Your business name"
            value={businessName}
            onChangeText={setBusinessName}
            icon={
              <Building2
                size={layout.iconSize.sm}
                color={colors.textTertiary}
                strokeWidth={1.8}
              />
            }
          />

          {/* Location Section */}
          <View style={styles.locationSection}>
            <Text style={inputStyles.label}>Location</Text>

            {locationLoading ? (
              <View style={styles.locationCard}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.locationCardText}>
                  Detecting your location…
                </Text>
              </View>
            ) : address && !locationLoading ? (
              <View style={styles.locationCard}>
                <MapPin
                  size={layout.iconSize.sm}
                  color={colors.primary}
                  strokeWidth={1.8}
                />
                <View style={styles.locationCardContent}>
                  <Text style={styles.locationCardAddress} numberOfLines={2}>
                    {address}
                  </Text>
                  {state ? (
                    <Text style={styles.locationCardState}>{state}</Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            <FormInput
              label=""
              placeholder="Enter address manually"
              value={address}
              onChangeText={setAddress}
              multiline
              icon={
                <MapPin
                  size={layout.iconSize.sm}
                  color={colors.textTertiary}
                  strokeWidth={1.8}
                />
              }
            />

            <FormInput
              label=""
              placeholder="State / Region"
              value={state}
              onChangeText={setState}
              icon={
                <MapPin
                  size={layout.iconSize.sm}
                  color={colors.textTertiary}
                  strokeWidth={1.8}
                />
              }
            />
          </View>
        </View>

        {/* Bottom */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!isFormValid || loading) && styles.buttonDisabled,
            ]}
            onPress={handleCreateAccount}
            disabled={!isFormValid || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textWhite} />
            ) : null}
            <Text style={styles.primaryButtonText}>
              {loading ? 'Sending OTP…' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.footerLink}
          >
            <Text style={styles.footerText}>
              Already registered?{' '}
              <Text style={styles.footerLinkText}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Screen 2: OTP Verification ─────────────────────────────────────────────

interface SignupScreen2Props {
  onNext: (data: SignupData) => void;
  userData: SignupData;
}

const OTP_LENGTH = 6;

const SignupScreen2: React.FC<SignupScreen2Props> = ({ onNext, userData }) => {
  const router = useRouter();
  const [code, setCode] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { status: walletStatus, isCompleted, wallets, progress } = useWalletGeneration();

  const handleCodeChange = (text: string, index: number) => {
    if (text && !/^\d+$/.test(text)) return;
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleNext = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== OTP_LENGTH) return;

    setLoading(true);
    try {
      // Wait for wallet generation to complete if not already done
      const generatedWallets = isCompleted && wallets
        ? wallets
        : await walletWorkletService.waitForCompletion();

      const response = await merchantApi.registerComplete({
        session_token: userData.sessionToken || '',
        otp: verificationCode,
        wallets: {
          ethereum: { addresses: [generatedWallets.ethereum.address] },
          solana: { addresses: [generatedWallets.solana.address] },
          bitcoin: { addresses: [generatedWallets.bitcoin.address] },
          bnb: { addresses: [generatedWallets.bnb.address] },
        },
      });

      if (response.merchant) {
        // Pass merchant data along with user data for profile initialization
        onNext({
          ...userData,
          verificationCode,
          merchant: response.merchant,
          access: response.access,
        });
      } else {
        Alert.alert('Error', response.error || 'Verification failed');
        setCode(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      const err = merchantApi.handleError(error);
      Alert.alert('Error', err.error);
      setCode(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const codeComplete = code.join('').length === OTP_LENGTH;
  const canVerify = codeComplete && (isCompleted || walletStatus === 'generating');

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
        <StepIndicator currentStep={2} totalSteps={2} />

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>Verification</Text>
          <Text style={styles.screenSubtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.highlightText}>
              {userData.phoneNumber || userData.email}
            </Text>
          </Text>

          {/* Wallet Generation Status */}
          {walletStatus === 'generating' && (
            <View style={styles.walletProgressContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.walletProgressText}>
                Securing your wallets... {progress}%
              </Text>
            </View>
          )}

          {isCompleted && (
            <View style={styles.walletCompletedContainer}>
              <Text style={styles.walletCompletedText}>✓ Wallets ready</Text>
            </View>
          )}
        </View>

        {/* OTP Inputs */}
        <Animated.View
          style={[
            styles.codeContainer,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {code.map((digit, index) => {
            const isActive = index === code.findIndex((d) => !d);
            const isFilled = digit !== '';

            return (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  isFilled && styles.codeInputFilled,
                  isActive && styles.codeInputActive,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            );
          })}
        </Animated.View>

        {/* Resend */}
        <TouchableOpacity style={styles.resendContainer} activeOpacity={0.7}>
          <Text style={styles.resendText}>
            Didn't receive the code?{' '}
            <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            (!canVerify || loading) && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canVerify || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textWhite} />
          ) : null}
          <Text style={styles.primaryButtonText}>
            {loading
              ? (walletStatus === 'generating' ? 'Securing wallets...' : 'Verifying…')
              : 'Verify & Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Main Multi-Step Flow ───────────────────────────────────────────────────

const SignupScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<SignupData>({});

  const handleNext = (data: SignupData) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleComplete = async (data: SignupData) => {
    const finalData = { ...userData, ...data };
    console.log('Signup completed:', finalData);

    // Initialize merchant profile orchestrator with merchant data
    // This will set the preferred currency based on location
    if (finalData.merchant) {
      await merchantProfileOrchestrator.initialize(finalData.merchant);

      if (finalData.access) {
        dispatch(setAuthenticated(true));
        dispatch(setSessionToken(finalData.access));
      }
    }

    router.replace('/auth/create-wallet/loading');
  };

  switch (currentStep) {
    case 1:
      return <SignupScreen1 onNext={handleNext} />;
    case 2:
      return <SignupScreen2 onNext={handleComplete} userData={userData} />;
    default:
      return <SignupScreen1 onNext={handleNext} />;
  }
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing['4xl'],
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['3xl'],
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  screenTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.tight,
  },
  screenSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  highlightText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  formContainer: {
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  locationSection: {
    gap: spacing.md,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    gap: spacing.md,
  },
  locationCardContent: {
    flex: 1,
  },
  locationCardText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  locationCardAddress: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  locationCardState: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
    marginTop: spacing['2xs'],
  },

  // Wallet Generation Progress
  walletProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.md,
  },
  walletProgressBar: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  walletProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  walletProgressText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  walletCompletedContainer: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.successLight || colors.infoLight,
    borderRadius: borderRadius.md,
  },
  walletCompletedText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success || colors.primary,
  },

  // OTP
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  codeInput: {
    width: 52,
    height: 60,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  codeInputActive: {
    borderColor: colors.primary,
    ...shadows.sm,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  resendText: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },

  // Buttons
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
  buttonDisabled: {
    opacity: 0.45,
  },

  // Footer
  bottomActions: {
    gap: spacing.lg,
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  footerText: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
  },
  footerLinkText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});

export { SignupScreen1, SignupScreen2 };
export default SignupScreen;
