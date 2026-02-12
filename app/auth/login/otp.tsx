import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CODE_LENGTH = 6;

export default function EnterCodeScreen() {
  const [code, setCode] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus the input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (text: string) => {
    // Only allow numbers and limit to CODE_LENGTH
    const cleanedText = text.replace(/[^0-9]/g, '');
    if (cleanedText.length <= CODE_LENGTH) {
      setCode(cleanedText);

      // Auto-navigate when complete
      if (cleanedText.length === CODE_LENGTH) {
        setTimeout(() => {
          router.push('/auth/login/import-wallet');
        }, 300);
      }
    }
  };

  const handleNext = () => {
    if (code.length === CODE_LENGTH) {
      router.push('/auth/login/import-wallet');
    }
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(30);
      setCode('');
      inputRef.current?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Enter code</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to your number. Enter it below
          to continue
        </Text>
      </View>

      {/* Hidden TextInput for keyboard input */}
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

      {/* Code Display Boxes */}
      <View style={styles.codeContainer}>
        {Array.from({ length: CODE_LENGTH }).map((_, index) => {
          const isFilled = index < code.length;
          const isActive = index === code.length;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.codeBox,
                isActive && styles.codeBoxActive,
                isFilled && styles.codeBoxFilled,
              ]}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={0.8}
            >
              {isFilled ? (
                <Text style={styles.codeDigit}>{code[index]}</Text>
              ) : isActive ? (
                <View style={styles.cursor} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tap to enter code hint */}
      <TouchableOpacity
        style={styles.hintContainer}
        onPress={() => inputRef.current?.focus()}
        activeOpacity={0.8}
      >
        <Text style={styles.hintText}>Tap boxes to enter code</Text>
      </TouchableOpacity>

      {/* Resend */}
      <TouchableOpacity
        style={styles.resendContainer}
        onPress={handleResend}
        disabled={resendTimer > 0}
      >
        <Text style={styles.resendText}>
          {resendTimer > 0
            ? `Resend code in ${resendTimer}s`
            : 'Resend code'}
        </Text>
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity
        style={[
          styles.nextButton,
          code.length === CODE_LENGTH && styles.nextButtonActive,
        ]}
        onPress={handleNext}
        activeOpacity={0.8}
        disabled={code.length !== CODE_LENGTH}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const codeBoxSize = Math.min((width - 60 - 50) / CODE_LENGTH, 50);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 36,
    color: '#000000',
    fontWeight: '300',
    marginTop: -4,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
    gap: 15,
  },
  title: {
    fontWeight: '600',
    fontSize: 25,
    lineHeight: 25,
    textAlign: 'center',
    color: '#000000',
  },
  subtitle: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#323333',
    paddingHorizontal: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 40,
    paddingHorizontal: 30,
  },
  codeBox: {
    width: codeBoxSize,
    height: codeBoxSize + 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  codeBoxActive: {
    borderWidth: 2,
    borderColor: '#0F6EC0',
  },
  codeBoxFilled: {
    borderColor: '#0F6EC0',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  codeDigit: {
    fontWeight: '500',
    fontSize: 20,
    textAlign: 'center',
    color: '#000000',
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: '#0F6EC0',
  },
  hintContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  hintText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#0F6EC0',
    fontWeight: '500',
  },
  nextButton: {
    marginHorizontal: 30,
    marginTop: 30,
    height: 55,
    backgroundColor: 'rgba(15, 114, 199, 0.4)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#0F6EC0',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#F5F5F5',
    textAlign: 'center',
    fontWeight: '400',
  }
});
