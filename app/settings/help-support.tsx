import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SupportItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  showChevron?: boolean;
  subtitleColor?: string;
}

const SupportItem: React.FC<SupportItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  subtitleColor = colors.primary,
}) => (
  <TouchableOpacity
    style={styles.supportItem as ViewStyle}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft as ViewStyle}>
      <View style={styles.iconContainer as ViewStyle}>
        <Ionicons name={icon as any} size={20} color={colors.textSecondary} />
      </View>
      <View style={styles.textContainer as ViewStyle}>
        <Text style={styles.itemTitle as TextStyle}>{title}</Text>
        <Text style={[styles.itemSubtitle as TextStyle, { color: subtitleColor }]}>
          {subtitle}
        </Text>
      </View>
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
    )}
  </TouchableOpacity>
);

export default function HelpSupportScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle as TextStyle}>Help and support</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.content as ViewStyle}>
        <View style={styles.supportCard as ViewStyle}>
          <SupportItem
            icon="call-outline"
            title="Phone Support"
            subtitle="+234 800 FLASH 00"
            onPress={() => {}}
          />

          <View style={styles.divider as ViewStyle} />

          <SupportItem
            icon="mail-outline"
            title="Email Support"
            subtitle="merchant@flash.support"
            onPress={() => {}}
          />

          <View style={styles.divider as ViewStyle} />

          <SupportItem
            icon="help-circle-outline"
            title="Frequently Asked Questions"
            subtitle="common questions and tips"
            onPress={() => router.push('/settings/faq' as any)}
          />

          <View style={styles.divider as ViewStyle} />

          <SupportItem
            icon="chatbubbles-outline"
            title="Chat with support"
            subtitle="Get instant help from flash team"
            onPress={() => router.push('/misc/chat' as any)}
          />
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  supportCard: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
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
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.regular,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing['3xl'],
    marginVertical: spacing.xs,
  },
});
