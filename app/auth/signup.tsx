import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Warning Icon Component
const WarningIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 12 12">
    <Circle cx="6" cy="6" r="5.5" fill="#FF9934" stroke="#FF9934" strokeWidth="1" />
    <Text
      x="6"
      y="9"
      fontSize="8"
      fontWeight="bold"
      fill="#FFFFFF"
      textAnchor="middle"
    >
      !
    </Text>
  </Svg>
);

// Folder Icon Component
const FolderMinusIcon = () => (
  <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <Path
      d="M5 7.5C5 6.67157 5.67157 6 6.5 6H11.5L13.5 9H23.5C24.3284 9 25 9.67157 25 10.5V22.5C25 23.3284 24.3284 24 23.5 24H6.5C5.67157 24 5 23.3284 5 22.5V7.5Z"
      stroke="#0F6EC0"
      strokeWidth="2"
      fill="none"
    />
    <Path d="M11 16H19" stroke="#0F6EC0" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FolderPlusIcon = () => (
  <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <Path
      d="M5 7.5C5 6.67157 5.67157 6 6.5 6H11.5L13.5 9H23.5C24.3284 9 25 9.67157 25 10.5V22.5C25 23.3284 24.3284 24 23.5 24H6.5C5.67157 24 5 23.3284 5 22.5V7.5Z"
      stroke="#0F6EC0"
      strokeWidth="2"
      fill="none"
    />
    <Path
      d="M15 12V20M11 16H19"
      stroke="#0F6EC0"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// Screen 1: Basic Information
const SignupScreen1 = ({ onNext }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleCreateAccount = () => {
    if (phoneNumber && email && address) {
      onNext({ phoneNumber, email, address });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create your flash account</Text>
          <Text style={styles.subtitle}>Your decentralized POS</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter your mobile number</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.labelSmall}>Enter your email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter your address</Text>
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#999"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              (!phoneNumber || !email || !address) && styles.buttonDisabled,
            ]}
            onPress={handleCreateAccount}
            disabled={!phoneNumber || !email || !address}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.footerText}>
              Already registered?{' '}
              <Text style={styles.linkText}>signin</Text>
            </Text>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Screen 2: Email Validation
const SignupScreen2 = ({ onNext, userData }) => {
  const [phoneNumber] = useState(userData?.phoneNumber || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [address] = useState(userData?.address || '');
  const [emailError, setEmailError] = useState(false);

  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(text.length > 0 && !emailRegex.test(text));
  };

  const handleNext = () => {
    if (email && !emailError) {
      onNext({ phoneNumber, email, address });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create your flash account</Text>
          <Text style={styles.subtitle}>Your decentralized POS</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter your mobile number</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={phoneNumber}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.labelSmall}>Enter your email</Text>
            <View>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Email address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError && (
                <View style={styles.errorContainer}>
                  <View style={styles.warningIconContainer}>
                    <WarningIcon />
                  </View>
                  <Text style={styles.errorText}>use a valid email address</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter your address</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={address}
              editable={false}
            />
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonPrimary,
              (emailError || !email) && styles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={!email || emailError}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.footerText}>
              Already registered?{' '}
              <Text style={styles.linkText}>signin</Text>
            </Text>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Screen 3: Verification Code
const SignupScreen3 = ({ onNext, userData }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleCodeChange = (text, index) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleNext = () => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6) {
      onNext({ ...userData, verificationCode });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerVerification}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.verificationSubtitle}>
            We've emailed a 6-digit verification code to your number. Enter it
            below to continue
          </Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
                index === code.findIndex((d) => !d) && styles.codeInputActive,
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonPrimary,
            styles.nextButton,
            code.join('').length !== 6 && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={code.join('').length !== 6}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>


      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Screen 4: Create Wallet
const SignupScreen4 = ({ onComplete, userData }) => {
  const [selectedOption, setSelectedOption] = useState('create');

  const handleCreateWallet = () => {
    setSelectedOption('create');
    setTimeout(() => {
      onComplete({ ...userData, walletType: 'create' });
    }, 300);
  };

  const handleImportWallet = () => {
    setSelectedOption('import');
    setTimeout(() => {
      onComplete({ ...userData, walletType: 'import' });
    }, 300);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <View style={styles.headerWallet}>
        <Text style={styles.title}>Create a wallet</Text>
        <Text style={styles.walletSubtitle}>
          Create or import your merchant wallet
        </Text>
      </View>

      <View style={styles.walletOptionsContainer}>
        <TouchableOpacity
          style={[
            styles.walletOption,
            selectedOption === 'create' && styles.walletOptionSelected,
          ]}
          onPress={handleCreateWallet}
          activeOpacity={0.8}
        >
          <View style={styles.walletOptionContent}>
            <FolderMinusIcon />
            <Text style={styles.walletOptionText}>Create wallet</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.walletOption,
            selectedOption === 'import' && styles.walletOptionSelected,
          ]}
          onPress={handleImportWallet}
          activeOpacity={0.8}
        >
          <View style={styles.walletOptionContent}>
            <FolderPlusIcon />
            <Text style={styles.walletOptionText}>Import wallet</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 52,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  headerVerification: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  headerWallet: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'SF Pro',
    fontWeight: '600',
    fontSize: 25,
    lineHeight: 25,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 15,
    width: '100%',
  },
  subtitle: {
    fontFamily: 'SF Pro',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 25,
    textAlign: 'center',
    color: '#323333',
  },
  verificationSubtitle: {
    fontFamily: 'SF Pro',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    color: '#323333',
    maxWidth: 377,
  },
  walletSubtitle: {
    fontFamily: 'SF Pro',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    color: '#323333',
  },
  formContainer: {
    gap: 25,
    marginBottom: 50,
  },
  inputGroup: {
    gap: 15,
  },
  label: {
    fontFamily: 'SF Pro',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
  },
  labelSmall: {
    fontFamily: 'SF Pro',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 22,
    color: '#000000',
  },
  input: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D2D6E1',
    borderRadius: 15,
    paddingHorizontal: 20,
    fontFamily: 'SF Pro',
    fontSize: 16,
    color: '#000000',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#999',
  },
  inputError: {
    borderColor: '#FF9934',
    borderWidth: 1.5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 12,
  },
  warningIconContainer: {
    width: 12,
    height: 12,
  },
  errorText: {
    fontFamily: 'SF Pro',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 12,
    color: '#FF9934',
  },
  bottomContainer: {
    gap: 20,
    marginBottom: 40,
  },
  button: {
    height: 60,
    backgroundColor: 'rgba(15, 114, 199, 0.7)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F6EC0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: '#0F6EC0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'SF Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    textAlign: 'center',
    color: '#F5F5F5',
  },
  footerText: {
    fontFamily: 'SF Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    textAlign: 'center',
    color: '#323333',
  },
  linkText: {
    color: '#0F6EC0',
    textDecorationLine: 'underline',
  },
  keyboard: {
    gap: 18,
    marginTop: 50,
    alignItems: 'center',
  },
  keyboardRow: {
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'center',
  },
  key: {
    width: 104,
    height: 58,
    backgroundColor: 'rgba(15, 114, 199, 0.07)',
    borderWidth: 1,
    borderColor: '#D2D6E1',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontFamily: 'SF Pro',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 18,
    textAlign: 'center',
    color: '#000000',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 30,
    marginBottom: 80,
  },
  codeInput: {
    width: 70,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    textAlign: 'center',
    fontFamily: 'SF Pro',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 21,
    color: '#000000',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  codeInputFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D2D6E1',
  },
  codeInputActive: {
    borderWidth: 1,
    borderColor: '#0F6EC0',
  },
  nextButton: {
    marginHorizontal: 0,
  },
  walletOptionsContainer: {
    gap: 15,
    paddingHorizontal: 52,
  },
  walletOption: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  walletOptionSelected: {
    borderWidth: 1.5,
    borderColor: '#0F6EC0',
  },
  walletOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  walletOptionText: {
    fontFamily: 'SF Pro',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 15,
    color: '#000000',
  },
});

export { SignupScreen1, SignupScreen2, SignupScreen3, SignupScreen4 };

// Default export for route navigation - Multi-step signup flow
const SignupScreen = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({});

  const handleNext = (data: object) => {
    setUserData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleComplete = (data: object) => {
    const finalData = { ...userData, ...data };
    console.log('Signup completed:', finalData);
    
    // Navigate based on wallet type
    if (finalData.walletType === 'create') {
      router.push('/auth/create-wallet/seed_phrase');
    } else if (finalData.walletType === 'import') {
      router.push('/auth/login/seed-phrase');
    }
  };

  switch (currentStep) {
    case 1:
      return <SignupScreen1 onNext={handleNext} />;
    case 2:
      return <SignupScreen2 onNext={handleNext} userData={userData} />;
    case 3:
      return <SignupScreen3 onNext={handleNext} userData={userData} />;
    case 4:
      return <SignupScreen4 onComplete={handleComplete} userData={userData} />;
    default:
      return <SignupScreen1 onNext={handleNext} />;
  }
};

export default SignupScreen;
