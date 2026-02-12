import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');

  const handleNumberPress = (number: string) => {
    if (pin.length < 6) {
      setPin(pin + number);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

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
        <Text style={styles.headerTitle as TextStyle}>Change PIN</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.content as ViewStyle}>
        <Text style={styles.instructionText as TextStyle}>
          Enter your new 6-digit PIN
        </Text>

        <View style={styles.pinContainer as ViewStyle}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              style={[
                styles.pinDot as ViewStyle,
                pin.length > index && styles.pinDotFilled as ViewStyle,
              ]}
            />
          ))}
        </View>

        <Text style={styles.hintText as TextStyle}>
          {6 - pin.length} digits remaining
        </Text>
      </View>

      <View style={styles.keypad as ViewStyle}>
        <View style={styles.keypadRow as ViewStyle}>
          {[1, 2, 3].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.keyButton as ViewStyle}
              onPress={() => handleNumberPress(num.toString())}
              activeOpacity={0.7}
            >
              <Text style={styles.keyButtonText as TextStyle}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow as ViewStyle}>
          {[4, 5, 6].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.keyButton as ViewStyle}
              onPress={() => handleNumberPress(num.toString())}
              activeOpacity={0.7}
            >
              <Text style={styles.keyButtonText as TextStyle}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow as ViewStyle}>
          {[7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.keyButton as ViewStyle}
              onPress={() => handleNumberPress(num.toString())}
              activeOpacity={0.7}
            >
              <Text style={styles.keyButtonText as TextStyle}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow as ViewStyle}>
          <TouchableOpacity
            style={styles.keyButton as ViewStyle}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Text style={styles.keyButtonText as TextStyle} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keyButton as ViewStyle}
            onPress={() => handleNumberPress('0')}
            activeOpacity={0.7}
          >
            <Text style={styles.keyButtonText as TextStyle}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keyButton as ViewStyle}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="backspace-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 40,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  pinDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#D2D6E1',
  },
  pinDotFilled: {
    backgroundColor: '#0F6EC0',
    borderColor: '#0F6EC0',
  },
  hintText: {
    fontSize: 14,
    color: '#323333',
  },
  keypad: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  keyButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F4F6F5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  keyButtonText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#000000',
  },
});
