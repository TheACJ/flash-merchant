import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const TOTAL_PHRASES = 12;

const WORD_SUGGESTIONS: string[][] = [
  ['able', 'absent', 'account', 'accident', 'account'],
  ['abandon', 'report', 'appear', 'regard', 'announce'],
  ['arrogant', 'pride'],
];

export default function SeedPhraseScreen() {
  const [seedPhrases, setSeedPhrases] = useState<string[]>(
    Array(TOTAL_PHRASES).fill('')
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const handleWordSelect = (word: string) => {
    const updated = [...seedPhrases];
    updated[activeIndex] = word;
    setSeedPhrases(updated);

    // Move to next empty slot
    const nextEmpty = updated.findIndex(
      (val, idx) => idx > activeIndex && val === ''
    );
    if (nextEmpty !== -1) {
      setActiveIndex(nextEmpty);
    } else {
      const firstEmpty = updated.findIndex((val) => val === '');
      if (firstEmpty !== -1) {
        setActiveIndex(firstEmpty);
      }
    }
  };

  const handleSlotPress = (index: number) => {
    setActiveIndex(index);
  };

  const handleClearSlot = (index: number) => {
    const updated = [...seedPhrases];
    updated[index] = '';
    setSeedPhrases(updated);
    setActiveIndex(index);
  };

  const handleVerify = () => {
    const allFilled = seedPhrases.every((phrase) => phrase !== '');
    if (allFilled) {
      Alert.alert('Success', 'Wallet verified successfully!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/'),
        },
      ]);
    } else {
      const emptyCount = seedPhrases.filter((p) => p === '').length;
      Alert.alert(
        'Incomplete',
        `Please fill ${emptyCount} remaining seed phrase slot${emptyCount > 1 ? 's' : ''}.`
      );
    }
  };

  const filledCount = seedPhrases.filter((p) => p !== '').length;

  const renderSeedSlot = (index: number) => {
    const isActive = activeIndex === index;
    const isFilled = seedPhrases[index] !== '';

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.seedSlot,
          isActive && styles.seedSlotActive,
          isFilled && styles.seedSlotFilled,
        ]}
        onPress={() =>
          isFilled ? handleClearSlot(index) : handleSlotPress(index)
        }
        activeOpacity={0.7}
      >
        <View style={styles.seedNumber}>
          <Text style={styles.seedNumberText}>{index + 1}</Text>
        </View>
        {isFilled ? (
          <Text style={styles.seedWord} numberOfLines={1}>
            {seedPhrases[index]}
          </Text>
        ) : isActive ? (
          <View style={styles.cursor} />
        ) : null}
      </TouchableOpacity>
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
        <Text style={styles.title}>Enter your seed phrase</Text>
        <Text style={styles.subtitle}>
          Enter the correct seed phrase for each number
        </Text>
        <Text style={styles.progress}>
          {filledCount} / {TOTAL_PHRASES} completed
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
            filledCount === TOTAL_PHRASES && styles.verifyButtonActive,
          ]}
          onPress={handleVerify}
          activeOpacity={0.8}
        >
          <Text style={styles.verifyButtonText}>Verify Seed Phrase</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Word Suggestions */}
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsLabel}>Select a word:</Text>
        {WORD_SUGGESTIONS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.suggestionRow}>
            {row.map((word, wordIndex) => {
              const isUsed = seedPhrases.includes(word);
              return (
                <TouchableOpacity
                  key={`${rowIndex}-${wordIndex}`}
                  style={[
                    styles.suggestionChip,
                    isUsed && styles.suggestionChipUsed,
                  ]}
                  onPress={() => handleWordSelect(word)}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      isUsed && styles.suggestionTextUsed,
                    ]}
                  >
                    {word}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
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
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    color: '#323333',
  },
  progress: {
    fontSize: 14,
    color: '#0F6EC0',
    fontWeight: '500',
    marginTop: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 20,
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
    borderStyle: 'dashed',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  seedSlotActive: {
    borderColor: '#0F6EC0',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  seedSlotFilled: {
    borderStyle: 'solid',
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
  seedWord: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  cursor: {
    width: 2,
    height: 20,
    backgroundColor: '#0F6EC0',
  },
  verifyButton: {
    height: 55,
    backgroundColor: 'rgba(15, 114, 199, 0.4)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
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
  suggestionsContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 15,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
  },
  suggestionsLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: 'rgba(15, 114, 199, 0.2)',
    borderWidth: 1,
    borderColor: '#D2D6E1',
    borderRadius: 7,
    paddingVertical: 14,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionChipUsed: {
    backgroundColor: 'rgba(15, 114, 199, 0.05)',
    borderColor: '#E5E5E5',
  },
  suggestionText: {
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'center',
    color: '#000000',
  },
  suggestionTextUsed: {
    color: '#999',
  },
});