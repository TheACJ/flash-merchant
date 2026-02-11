import { ArrowLeft, Delete } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionSummary } from './types';

interface EnterPinProps {
  summary: TransactionSummary;
  onSubmit: (pin: string) => void;
  onBack: () => void;
}

const PIN_LENGTH = 6;

const KEYPAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['#', '0', 'delete'],
];

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

export default function EnterPin({ summary, onSubmit, onBack }: EnterPinProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      // Auto-submit when PIN is complete
      handleSubmit();
    }
  }, [pin]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleKeyPress = useCallback((key: string) => {
    Vibration.vibrate(10);
    setError('');

    if (key === 'delete') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }

    if (key === '#') {
      // Handle special character or ignore
      return;
    }

    if (pin.length < PIN_LENGTH) {
      setPin((prev) => prev + key);
    }
  }, [pin]);

  const handleSubmit = () => {
    if (pin.length !== PIN_LENGTH) {
      setError('Please enter complete PIN');
      triggerShake();
      return;
    }

    // In real app, validate PIN here
    onSubmit(pin);
  };

  const renderPinBoxes = () => {
    const boxes = [];
    for (let i = 0; i < PIN_LENGTH; i++) {
      const isFilled = i < pin.length;
      boxes.push(
        <Animated.View
          key={i}
          style={[
            styles.pinBox,
            isFilled && styles.pinBoxFilled,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {isFilled && <View style={styles.pinDot} />}
        </Animated.View>
      );
    }
    return boxes;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color="#000000" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter your pin</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <SummaryRow label="Amount" value={summary.amount} />
        <SummaryRow label="Exchange rate" value={summary.exchangeRate} />
        <SummaryRow label="Customer receives" value={summary.customerReceives} />
        <SummaryRow label="Network fee" value={summary.networkFee} />
      </View>

      {/* PIN Input */}
      <View style={styles.pinContainer}>
        <View style={styles.pinBoxesContainer}>{renderPinBoxes()}</View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Submit Button */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            pin.length !== PIN_LENGTH && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={pin.length !== PIN_LENGTH}
          activeOpacity={0.8}
          accessibilityLabel="Confirm transaction"
        >
          <Text
            style={[
              styles.submitButtonText,
              pin.length !== PIN_LENGTH && styles.submitButtonTextDisabled,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>

      {/* Keypad */}
      <View style={styles.keypadContainer}>
        {KEYPAD_KEYS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.keypadKey,
                  key === 'delete' && styles.keypadKeyDelete,
                ]}
                onPress={() => handleKeyPress(key)}
                activeOpacity={0.6}
                accessibilityLabel={
                  key === 'delete' ? 'Delete' : key === '#' ? 'Hash' : key
                }
              >
                {key === 'delete' ? (
                  <Delete size={24} color="#000000" strokeWidth={2} />
                ) : (
                  <Text style={styles.keypadKeyText}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
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
  summaryCard: {
    marginHorizontal: 52,
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    gap: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#323333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#323333',
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  pinContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 52,
  },
  pinBoxesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  pinBox: {
    width: 70,
    height: 70,
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBoxFilled: {
    backgroundColor: '#E8F4FD',
    borderWidth: 2,
    borderColor: '#0F6EC0',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0F6EC0',
  },
  errorText: {
    fontSize: 14,
    color: '#C31D1E',
    marginTop: 15,
    textAlign: 'center',
  },
  submitButtonContainer: {
    paddingHorizontal: 52,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(15, 114, 199, 0.3)',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5F5F5',
  },
  submitButtonTextDisabled: {
    color: '#F5F5F5',
    opacity: 0.7,
  },
  keypadContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 52,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    gap: 18,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
  },
  keypadKey: {
    flex: 1,
    height: 58,
    backgroundColor: 'rgba(15, 114, 199, 0.07)',
    borderWidth: 1,
    borderColor: '#D2D6E1',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadKeyDelete: {
    backgroundColor: 'rgba(15, 114, 199, 0.07)',
  },
  keypadKeyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
});