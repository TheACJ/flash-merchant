import { borderRadius, colors, typography } from '@/constants/theme';
import { Delete } from 'lucide-react-native';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  showDecimal?: boolean;
  showSpecialKey?: boolean;
  specialKeyLabel?: string;
}

const KEYPAD_KEYS_WITH_DECIMAL = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'delete'],
];

const KEYPAD_KEYS_WITHOUT_DECIMAL = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['#', '0', 'delete'],
];

export default function NumericKeypad({
  onKeyPress,
  showDecimal = true,
  showSpecialKey = false,
  specialKeyLabel = '#',
}: NumericKeypadProps) {
  const keys = showDecimal
    ? KEYPAD_KEYS_WITH_DECIMAL
    : KEYPAD_KEYS_WITHOUT_DECIMAL;

  const handlePress = (key: string) => {
    Vibration.vibrate(10);
    onKeyPress(key);
  };

  return (
    <View style={styles.container}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            const displayKey =
              key === '#' && showSpecialKey ? specialKeyLabel : key;

            return (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={() => handlePress(key)}
                activeOpacity={0.6}
                accessibilityLabel={
                  key === 'delete'
                    ? 'Delete'
                    : key === '.'
                    ? 'Decimal point'
                    : displayKey
                }
              >
                {key === 'delete' ? (
                  <Delete size={24} color={colors.textPrimary} strokeWidth={2} />
                ) : (
                  <Text style={styles.keyText}>{displayKey}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
  },
  key: {
    flex: 1,
    height: 58,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
});