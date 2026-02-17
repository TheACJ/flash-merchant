// settings/edit-profile.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  AtSign,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View
      style={[
        styles.inputContainer,
        value.length > 0 && styles.inputContainerActive,
      ]}
    >
      <View style={styles.inputIconWrap}>{icon}</View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  </View>
);

export default function EditProfileScreen() {
  const router = useRouter();
  const [tag, setTag] = useState('Cryptoguru');
  const [phone, setPhone] = useState('+234 800 000 0000');
  const [email, setEmail] = useState('cryptoguru@example.com');
  const [address, setAddress] = useState('123 Main Street, Lagos');

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <FormField
            label="Tag"
            icon={<AtSign size={layout.iconSize.sm} color={tag ? colors.primary : colors.textTertiary} strokeWidth={1.8} />}
            value={tag}
            onChangeText={setTag}
            placeholder="Your merchant tag"
            autoCapitalize="none"
          />

          <FormField
            label="Mobile Number"
            icon={<Phone size={layout.iconSize.sm} color={phone ? colors.primary : colors.textTertiary} strokeWidth={1.8} />}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            keyboardType="phone-pad"
          />

          <FormField
            label="Email"
            icon={<Mail size={layout.iconSize.sm} color={email ? colors.primary : colors.textTertiary} strokeWidth={1.8} />}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            label="Address"
            icon={<MapPin size={layout.iconSize.sm} color={address ? colors.primary : colors.textTertiary} strokeWidth={1.8} />}
            value={address}
            onChangeText={setAddress}
            placeholder="Business address"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
          <ChevronRight
            size={layout.iconSize.sm}
            color={colors.textWhite}
            strokeWidth={2.5}
          />
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
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
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
  inputContainer: {
    height: layout.inputHeight,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  inputContainerActive: {
    borderColor: colors.border,
  },
  inputIconWrap: {
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
  buttonContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['2xl'],
  },
  saveButton: {
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
});