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
        color="#000000"
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
          <Ionicons name="chevron-back" size={24} color="#000000" />
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
    backgroundColor: '#F5F5F5',
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
    fontSize: 25,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  faqItem: {
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    marginBottom: 12,
    padding: 15,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  answerText: {
    fontSize: 14,
    color: '#323333',
    lineHeight: 20,
  },
});
