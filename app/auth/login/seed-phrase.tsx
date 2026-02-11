import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const TOTAL_PHRASES = 12;

export default function SeedPhraseScreen() {
  const [seedPhrases, setSeedPhrases] = useState<string[]>(
    Array(TOTAL_PHRASES).fill('')
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const updated = [...seedPhrases];
    updated[index] = text.trim();
    setSeedPhrases(updated);

    // Move to next slot if text is entered
    if (text.length > 0 && index < TOTAL_PHRASES - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to go to previous slot
    if (e.nativeEvent.key === 'Backspace' && seedPhrases[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const allFilled = seedPhrases.every((phrase) => phrase.trim() !== '');
    const filledCount = seedPhrases.filter((p) => p.trim() !== '').length;

    if (allFilled) {
      // Log the seed phrase for verification
      console.log('Seed phrases entered:', seedPhrases.join(' '));
      
      Alert.alert('Success', 'Wallet imported successfully!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/auth/create-wallet/notice'),
        },
      ]);
    } else {
      Alert.alert(
        'Incomplete',
        `Please fill in all ${TOTAL_PHRASES} seed phrase slots (${filledCount}/${TOTAL_PHRASES} filled)`
      );
    }
  };

  const renderSeedSlot = (index: number) => {
    const isActive = activeIndex === index;
    const isFilled = seedPhrases[index].trim() !== '';

    return (
      <View
        key={index}
        style={[
          styles.seedSlot,
          isActive && styles.seedSlotActive,
          isFilled && styles.seedSlotFilled,
        ]}
      >
        <View style={styles.seedNumber}>
          <Text style={styles.seedNumberText}>{index + 1}</Text>
        </View>
        <TextInput
          ref={(ref) => { inputRefs.current[index] = ref; }}
          style={styles.seedInput}
          value={seedPhrases[index]}
          onChangeText={(text) => handleCodeChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setActiveIndex(index)}
         /*  placeholder={`Word ${index + 1}`}
          placeholderTextColor="#999" */
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Import Wallet</Text>
        <Text style={styles.subtitle}>
          Enter your 12-word seed phrase in order
        </Text>
      </View>

      {/* Seed Phrase Grid */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.seedGrid}>
          {Array.from({ length: TOTAL_PHRASES / 2 }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.seedRow}>
              {renderSeedSlot(rowIndex * 2)}
              {renderSeedSlot(rowIndex * 2 + 1)}
            </View>
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            seedPhrases.every((p) => p.trim() !== '') && styles.verifyButtonActive,
          ]}
          onPress={handleVerify}
          activeOpacity={0.8}
        >
          <Text style={styles.verifyButtonText}>Import Wallet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const slotWidth = (width - 60 - 24) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 36,
    color: '#000000',
    fontWeight: '300',
    marginTop: -4,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
    gap: 10,
  },
  title: {
    fontWeight: '600',
    fontSize: 25,
    lineHeight: 25,
    textAlign: 'center',
    color: '#000000',
  },
  subtitle: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#323333',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  seedGrid: {
    gap: 16,
  },
  seedRow: {
    flexDirection: 'row',
    gap: 24,
  },
  seedSlot: {
    width: slotWidth,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D2D6E1',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  seedSlotActive: {
    borderColor: '#0F6EC0',
    borderWidth: 2,
  },
  seedSlotFilled: {
    borderColor: '#0F6EC0',
    backgroundColor: 'rgba(15, 114, 199, 0.05)',
  },
  seedNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#0F6EC0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  seedNumberText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  seedInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    padding: 0,
  },
  verifyButton: {
    height: 55,
    backgroundColor: 'rgba(15, 114, 199, 0.4)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  verifyButtonActive: {
    backgroundColor: '#0F6EC0',
  },
  verifyButtonText: {
    fontSize: 16,
    color: '#F5F5F5',
    textAlign: 'center',
    fontWeight: '500',
  },
});
