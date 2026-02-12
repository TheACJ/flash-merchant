import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BankDetailsScreen() {
  const router = useRouter();
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleNext = () => {
    router.back();
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
        <Text style={styles.headerTitle as TextStyle}>Account details</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.formContainer as ViewStyle}>
        {/* Bank Name Input */}
        <View style={styles.inputGroup as ViewStyle}>
          <Text style={styles.label as TextStyle}>Enter your bank</Text>
          <TouchableOpacity
            style={styles.inputContainer as ViewStyle}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Text style={styles.placeholderText as TextStyle}>Select bank</Text>
            <Ionicons name="chevron-down" size={20} color="#323333" />
          </TouchableOpacity>
        </View>

        {/* Account Number Input */}
        <View style={styles.inputGroup as ViewStyle}>
          <Text style={styles.label as TextStyle}>Enter account number</Text>
          <View style={styles.inputContainer as ViewStyle}>
            <TextInput
              style={styles.input as TextStyle}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Account number"
              placeholderTextColor="#657084"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {/* Account Name Input */}
        <View style={styles.inputGroup as ViewStyle}>
          <Text style={styles.label as TextStyle}>Enter account name</Text>
          <View style={styles.inputContainer as ViewStyle}>
            <TextInput
              style={styles.input as TextStyle}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="Account name"
              placeholderTextColor="#657084"
            />
          </View>
        </View>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer as ViewStyle}>
        <TouchableOpacity
          style={styles.nextButton as ViewStyle}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText as TextStyle}>Next</Text>
        </TouchableOpacity>
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
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  inputContainer: {
    height: 60,
    backgroundColor: '#F4F6F5',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D2D6E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#657084',
  },
  input: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    height: 60,
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#F5F5F5',
    fontWeight: '400',
  },
});
