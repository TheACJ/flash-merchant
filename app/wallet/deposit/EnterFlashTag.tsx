import { ArrowLeft, AtSign } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface EnterFlashTagProps {
  initialValue?: string;
  onSubmit: (flashTag: string) => void;
  onBack: () => void;
}

export default function EnterFlashTag({
  initialValue = '',
  onSubmit,
  onBack,
}: EnterFlashTagProps) {
  const [flashTag, setFlashTag] = useState(initialValue);
  const [error, setError] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const validateFlashTag = (tag: string): boolean => {
    if (!tag.trim()) {
      setError('Flash tag is required');
      return false;
    }
    if (tag.length < 3) {
      setError('Flash tag must be at least 3 characters');
      return false;
    }
    if (!/^@?[a-zA-Z0-9_]+$/.test(tag)) {
      setError('Flash tag can only contain letters, numbers, and underscores');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    const normalizedTag = flashTag.startsWith('@') ? flashTag : `@${flashTag}`;
    if (validateFlashTag(normalizedTag)) {
      onSubmit(normalizedTag);
    }
  };

  const handleChangeText = (text: string) => {
    setFlashTag(text);
    if (error) setError('');
  };

  const isButtonDisabled = !flashTag.trim();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ArrowLeft size={24} color="#000000" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Physical deposit</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Enter customer's flash tag</Text>
              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  error ? styles.inputContainerError : null,
                ]}
              >
                <View style={styles.inputPrefix}>
                  <AtSign size={20} color="#657084" strokeWidth={2} />
                </View>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={flashTag.replace('@', '')}
                  onChangeText={handleChangeText}
                  placeholder="username"
                  placeholderTextColor="#AFAFB0"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onSubmitEditing={handleSubmit}
                  accessibilityLabel="Customer flash tag input"
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Text style={styles.helperText}>
                Enter the customer's unique flash tag to send them crypto
              </Text>
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                isButtonDisabled && styles.nextButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
              accessibilityLabel="Continue to next step"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.nextButtonText,
                  isButtonDisabled && styles.nextButtonTextDisabled,
                ]}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4F6F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 52,
    paddingTop: 50,
  },
  inputSection: {
    gap: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F5',
    borderWidth: 1,
    borderColor: '#D2D6E1',
    borderRadius: 15,
    height: 60,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: '#0F6EC0',
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#C31D1E',
  },
  inputPrefix: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    height: '100%',
  },
  errorText: {
    fontSize: 14,
    color: '#C31D1E',
    marginTop: -5,
  },
  helperText: {
    fontSize: 14,
    color: '#657084',
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 52,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  nextButton: {
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#DCDCDD',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5F5F5',
  },
  nextButtonTextDisabled: {
    color: '#AFAFB0',
  },
});