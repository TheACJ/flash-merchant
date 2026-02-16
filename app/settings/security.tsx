import { borderRadius, colors, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SecurityScreen() {
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const MenuItem: React.FC<{
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    showChevron?: boolean;
  }> = ({ icon, title, subtitle, onPress, showChevron = true }) => (
    <TouchableOpacity
      style={styles.menuItem as ViewStyle}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft as ViewStyle}>
        <View style={styles.iconContainer as ViewStyle}>
          <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.textContainer as ViewStyle}>
          <Text style={styles.itemTitle as TextStyle}>{title}</Text>
          <Text style={styles.itemSubtitle as TextStyle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.itemRight as ViewStyle}>
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle as TextStyle}>Security</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.section as ViewStyle}>
        <TouchableOpacity
          style={styles.menuItem as ViewStyle}
          onPress={() => setBiometricEnabled(!biometricEnabled)}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft as ViewStyle}>
            <View style={styles.iconContainer as ViewStyle}>
              <Ionicons name="finger-print-outline" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.textContainer as ViewStyle}>
              <Text style={styles.itemTitle as TextStyle}>Fingerprint</Text>
              <Text style={styles.itemSubtitle as TextStyle}>Quick login with biometric</Text>
            </View>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.backgroundInput}
          />
        </TouchableOpacity>

        <View style={styles.divider as ViewStyle} />

        <MenuItem
          icon="lock-closed-outline"
          title="Merchant PIN"
          subtitle="4-digit secure PIN"
          onPress={() => router.push('/settings/change-pin' as any)}
        />

        <View style={styles.divider as ViewStyle} />

        <MenuItem
          icon="shield-checkmark-outline"
          title="KYC settings"
          subtitle="Setup your KYC"
          onPress={() => router.push('/auth/setup/kyc' as any)}
        />
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
  section: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.sm,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingVertical: 20,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.regular,
  },
  itemSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemRight: {
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 68,
  },
});
