import { borderRadius, colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FAQItemProps {
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, expanded, onToggle }) => (
  <View style={styles.faqItem as ViewStyle}>
    <TouchableOpacity
      style={styles.faqHeader as ViewStyle}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={styles.questionText as TextStyle}>{question}</Text>
      <Ionicons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={colors.textPrimary}
      />
    </TouchableOpacity>
    {expanded && (
      <View style={styles.faqAnswer as ViewStyle}>
        <Text style={styles.answerText as TextStyle}>{answer}</Text>
      </View>
    )}
  </View>
);

export default function FAQScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What if a transaction fails?',
      answer:
        'Failed transactions are automatically reversed. Crypto is returned to the sender within 5 minutes. Check your transaction history for details.',
    },
    {
      question: 'How do I process a physical withdrawal?',
      answer:
        "Tap the 'Withdraw' button on the dashboard, enter the customer's Flash tag, select the amount and asset, then hand the device to the customer to enter their PIN.",
    },
    {
      question: 'What are the transaction limits?',
      answer:
        'Transaction limits vary based on your account level and verification status. Please check your account settings for specific limits.',
    },
    {
      question: 'How do I handle remote requests?',
      answer:
        'Remote requests can be processed through the Request tab. Enter the customers Flash tag and amount, then send the request.',
    },
  ];

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
        <Text style={styles.headerTitle as TextStyle}>FAQ</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.content as ViewStyle}>
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            expanded={expandedIndex === index}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
          />
        ))}
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
    paddingTop: spacing.sm,
  },
  faqItem: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
    paddingRight: spacing.sm,
  },
  faqAnswer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  answerText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed,
  },
});
