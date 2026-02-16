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

export default function EditProfileScreen() {
  const router = useRouter();
  const [tag, setTag] = useState('Cryptoguru');
  const [phone, setPhone] = useState('+234 800 000 0000');
  const [email, setEmail] = useState('cryptoguru@example.com');
  const [address, setAddress] = useState('123 Main Street, Lagos');

  const handleSave = () => {
    // Save profile changes
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
        <Text style={styles.headerTitle as TextStyle}>Edit profile details</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.formContainer as ViewStyle}>
        {/* Tag Input */}
        <View style={styles.inputGroup as ViewStyle}>
          <Text style={styles.label as TextStyle}>Tag</Text>
          <View style={styles.inputContainer as ViewStyle}>
            <TextInput
              style={styles.input as TextStyle}
              value={tag}
              onChangeText={setTag}
              placeholder="Enter your tag"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        {/* Phone Input */}
        <View style={styles.inputGroup as ViewStyle}>
          <Text style={styles.label as TextStyle}>Mobile number</Text>
          <View style={styles.inputContainer as ViewStyle}>
            <TextInput
              style={styles.input as TextStyle}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup as ViewStyle}>
          <Text style={styles.label as TextStyle}>Email</Text>
          <View style={styles.inputContainer as ViewStyle}>
            <TextInput
              style={styles.input as TextStyle}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Address Input */}
        <View style={styles.inputGroup as ViewStyle}>
          <Text style={styles.label as TextStyle}>Address</Text>
          <View style={styles.inputContainer as ViewStyle}>
            <TextInput
              style={styles.input as TextStyle}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer as ViewStyle}>
        <TouchableOpacity
          style={styles.saveButton as ViewStyle}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText as TextStyle}>Save changes</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  saveButton: {
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    fontWeight: typography.fontWeight.regular,
  },
});
