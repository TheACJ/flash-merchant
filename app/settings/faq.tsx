// settings/faq.tsx
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
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'What if a transaction fails?',
    answer:
      'Failed transactions are automatically reversed. Crypto is returned to the sender within 5 minutes. Check your transaction history for details.',
  },
  {
    question: 'How do I process a physical withdrawal?',
    answer:
      "Tap 'Withdraw' on the dashboard, enter the customer's Flash tag, select the amount and asset, then hand the device to the customer to enter their PIN.",
  },
  {
    question: 'What are the transaction limits?',
    answer:
      'Limits vary based on your verification level. Complete KYC for higher limits. Check account settings for your specific limits.',
  },
  {
    question: 'How do I handle remote requests?',
    answer:
      "Remote requests can be processed through the Requests tab. Enter the customer's Flash tag and amount, then send the request.",
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <HelpCircle
            size={layout.iconSize.md}
            color={colors.primary}
            strokeWidth={1.8}
          />
          <Text style={styles.introText}>
            Find answers to common questions about Flash Merchant
          </Text>
        </View>

        {/* FAQ Items */}
        {FAQS.map((faq, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <View
              key={index}
              style={[
                styles.faqItem,
                isExpanded && styles.faqItemExpanded,
              ]}
            >
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleItem(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.questionText}>{faq.question}</Text>
                {isExpanded ? (
                  <ChevronUp
                    size={layout.iconSize.sm}
                    color={colors.primary}
                    strokeWidth={2}
                  />
                ) : (
                  <ChevronDown
                    size={layout.iconSize.sm}
                    color={colors.textMuted}
                    strokeWidth={2}
                  />
                )}
              </TouchableOpacity>
              {isExpanded && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
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
    paddingTop: spacing.base,
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  introText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  faqItem: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  faqItemExpanded: {
    borderColor: colors.primaryMedium,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    gap: spacing.md,
  },
  questionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.snug,
  },
  faqAnswer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  answerText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
});