import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Path, Svg } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Icons ───────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <Path
      d="M2.5 7.5L5.5 10.5L11.5 3.5"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ArrowLeftIcon = ({ color = '#000000' }: { color?: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Disclaimer Screen ──────────────────────────────────────────────────────

interface DisclaimerScreenProps {
  onNext: () => void;
  onPrivacyPolicy: () => void;
}

const DisclaimerScreen: React.FC<DisclaimerScreenProps> = ({ onNext, onPrivacyPolicy }) => {
  const [checks, setChecks] = useState([false, false, false]);

  const toggleCheck = useCallback((index: number) => {
    setChecks((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  }, []);

  const allChecked = checks.every(Boolean);

  const disclaimerItems = [
    "I understand Flash doesn't control or recover my wallet.",
    'I am responsible for my wallet and recovery phrase.',
    'I am responsible for all transactions on my account.',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <View style={styles.disclaimerContent}>
        {/* Title */}
        <Text style={styles.disclaimerTitle}>Disclaimer</Text>

        {/* Checkbox Items */}
        <View style={styles.checkboxGroup}>
          {disclaimerItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checkboxRow}
              onPress={() => toggleCheck(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  checks[index] && styles.checkboxChecked,
                ]}
              >
                {checks[index] && <CheckIcon />}
              </View>
              <Text style={styles.checkboxLabel}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, !allChecked && styles.nextButtonDisabled]}
          onPress={onPrivacyPolicy}
          activeOpacity={allChecked ? 0.8 : 1}
          disabled={!allChecked}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Privacy Policy Screen ──────────────────────────────────────────────────

interface PrivacyPolicyScreenProps {
  onBack: () => void;
  onSignUp?: () => void;
  onLogin?: () => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack, onSignUp, onLogin }) => {
  const [privacyChecked, setPrivacyChecked] = useState(false);

  const togglePrivacyCheck = useCallback(() => {
    setPrivacyChecked((prev) => !prev);
  }, []);

  const sections = [
    {
      title: 'Cancellation Policy',
      body: 'Flash Merchant does not store or manage user wallets. Because your wallet is non-custodial, all actions you take—such as creating, importing, or deleting your wallet—are fully controlled by you. Once a transaction is confirmed on the blockchain, it cannot be reversed or cancelled.',
    },
    {
      title: 'How We Use Your Information',
      body: 'Your information is used to create and maintain your merchant account, provide customer support, improve app features, and ensure compliance with anti-fraud and risk-monitoring requirements. We do not sell or share personal data with third-party advertisers.',
    },
    {
      title: 'Data Security',
      body: 'We implement encryption, device-level security, and strict access control to protect your account data. However, since your wallet keys are stored by you, Flash cannot guarantee recovery in the event of loss.',
    },
    {
      title: 'Terms & Conditions',
      body: 'By using Flash Merchant, you agree to comply with our Terms & Conditions regarding merchant conduct, transaction processing, and fair use. You are responsible for ensuring your account activity follows applicable laws and our platform guidelines.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* Header */}
      <View style={styles.privacyHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon />
        </TouchableOpacity>
        <Text style={styles.privacyHeaderTitle}>Privacy Policy</Text>
        {/* Spacer for centering */}
        <View style={{ width: 50 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.privacyScrollView}
        contentContainerStyle={styles.privacyScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, index) => (
          <View key={index} style={styles.policySection}>
            <Text style={styles.policySectionTitle}>{section.title}</Text>
            <Text style={styles.policySectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Privacy Agreement Checkbox */}
      <View style={styles.privacyCheckboxContainer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={togglePrivacyCheck}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkbox,
              privacyChecked && styles.checkboxChecked,
            ]}
          >
            {privacyChecked && <CheckIcon />}
          </View>
          <Text style={styles.checkboxLabel}>I agree to the Privacy Policy</Text>
        </TouchableOpacity>

        {/* Sign Up and Login Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.signUpButton, !privacyChecked && styles.buttonDisabled]}
            onPress={onSignUp}
            activeOpacity={privacyChecked ? 0.8 : 1}
            disabled={!privacyChecked}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.loginButton, !privacyChecked && styles.buttonDisabled]}
            onPress={onLogin}
            activeOpacity={privacyChecked ? 0.8 : 1}
            disabled={!privacyChecked}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Main Combined Screen ───────────────────────────────────────────────────

const DisclaimerAndPrivacy: React.FC = () => {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<'disclaimer' | 'privacy'>('disclaimer');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Navigation handlers with error handling
  const handleSignUp = useCallback(() => {
    try {
      router.push('/auth/signup' as const);
    } catch (error) {
      console.error('Navigation to signup failed:', error);
    }
  }, [router]);

  const handleLogin = useCallback(() => {
    try {
      router.push('/auth/login');
    } catch (error) {
      console.error('Navigation to login failed:', error);
    }
  }, [router]);

  const handleDisclaimerAccepted = useCallback(() => {
    console.log('Disclaimer accepted');
  }, []);

  const navigateTo = useCallback((screen: 'disclaimer' | 'privacy') => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen(screen);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      {currentScreen === 'disclaimer' ? (
        <DisclaimerScreen
          onNext={handleDisclaimerAccepted}
          onPrivacyPolicy={() => navigateTo('privacy')}
        />
      ) : (
        <PrivacyPolicyScreen
          onBack={() => navigateTo('disclaimer')}
          onSignUp={handleSignUp}
          onLogin={handleLogin}
        />
      )}
    </Animated.View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // ── Disclaimer ──────────────────────────────────────
  disclaimerContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 30,
  },
  disclaimerTitle: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 25,
    lineHeight: 25,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 40,
  },
  checkboxGroup: {
    gap: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F4F6F5',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 17,
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 20,
    backgroundColor: '#E7E7E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0F72C7',
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
  },
  nextButton: {
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    textAlign: 'center',
    color: '#F5F5F5',
  },
  privacyLinkContainer: {
    alignItems: 'center',
  },
  privacyLinkText: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    color: '#0F6EC0',
  },

  // ── Privacy Policy ──────────────────────────────────
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 50,
    height: 50,
    backgroundColor: '#F4F6F5',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyHeaderTitle: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 25,
    lineHeight: 25,
    textAlign: 'center',
    color: '#000000',
  },
  privacyScrollView: {
    flex: 1,
  },
  privacyScrollContent: {
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 20,
  },
  policySection: {
    gap: 15,
  },
  policySectionTitle: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 25,
    color: '#0F6EC0',
  },
  policySectionBody: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 25,
    color: '#323333',
  },
  privacyCheckboxContainer: {
    paddingHorizontal: 28,
    paddingBottom: 30,
    gap: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  signUpButton: {
    flex: 1,
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F6EC0',
  },
  signUpButtonText: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    textAlign: 'center',
    color: '#F5F5F5',
  },
  loginButtonText: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    textAlign: 'center',
    color: '#0F6EC0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default DisclaimerAndPrivacy;
