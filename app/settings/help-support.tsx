// settings/help-support.tsx
import {
  borderRadius,
  colors,
  layout,
  spacing,
  typography,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SupportOption {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export default function HelpSupportScreen() {
  const router = useRouter();

  const options: SupportOption[] = [
    {
      icon: <Phone size={layout.iconSize.sm} color={colors.textSecondary} strokeWidth={1.8} />,
      title: 'Phone Support',
      subtitle: '+234 800 FLASH 00',
      onPress: () => {},
    },
    {
      icon: <Mail size={layout.iconSize.sm} color={colors.textSecondary} strokeWidth={1.8} />,
      title: 'Email Support',
      subtitle: 'merchant@flash.support',
      onPress: () => {},
    },
    {
      icon: <HelpCircle size={layout.iconSize.sm} color={colors.textSecondary} strokeWidth={1.8} />,
      title: 'Frequently Asked Questions',
      subtitle: 'Common questions and tips',
      onPress: () => router.push('/settings/faq' as any),
    },
    {
      icon: <MessageCircle size={layout.iconSize.sm} color={colors.textSecondary} strokeWidth={1.8} />,
      title: 'Chat with Support',
      subtitle: 'Get instant help from the Flash team',
      onPress: () => router.push('/misc/chat' as any),
    },
  ];

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {options.map((option, index) => (
            <React.Fragment key={option.title}>
              <TouchableOpacity
                style={styles.supportItem}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconContainer}>
                    {option.icon}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.itemTitle}>{option.title}</Text>
                    <Text style={styles.itemSubtitle}>
                      {option.subtitle}
                    </Text>
                  </View>
                </View>
                <ChevronRight
                  size={layout.iconSize.sm}
                  color={colors.textMuted}
                  strokeWidth={2}
                />
              </TouchableOpacity>
              {index < options.length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          ))}
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
  content: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: spacing['2xs'],
  },
  itemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 68,
  },
});