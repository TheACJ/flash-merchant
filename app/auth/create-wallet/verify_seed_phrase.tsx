import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CORRECT_ORDER = [
  "arrogant",
  "pride",
  "announce",
  "regard",
  "report",
  "appear",
  "abandon",
  "account",
  "accident",
  "account",
  "able",
  "absent",
];

const WORD_BANK = [
  "able",
  "absent",
  "account",
  "accident",
  "account",
  "abandon",
  "report",
  "appear",
  "regard",
  "announce",
  "arrogant",
  "pride",
];

interface SeedSlotProps {
  number: number;
  word: string | null;
  onRemove: () => void;
}

const SeedSlot: React.FC<SeedSlotProps> = ({ number, word, onRemove }) => (
  <TouchableOpacity
    style={[styles.seedSlot, word && styles.seedSlotFilled]}
    onPress={word ? onRemove : undefined}
    activeOpacity={word ? 0.7 : 1}
    disabled={!word}
  >
    <View style={styles.numberBadge}>
      <Text style={styles.numberText}>{number}</Text>
    </View>
    {word && <Text style={styles.slotWord}>{word}</Text>}
  </TouchableOpacity>
);

interface WordChipProps {
  word: string;
  disabled: boolean;
  onPress: () => void;
}

const WordChip: React.FC<WordChipProps> = ({ word, disabled, onPress }) => (
  <TouchableOpacity
    style={[styles.wordChip, disabled && styles.wordChipDisabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
  >
    <Text style={[styles.wordChipText, disabled && styles.wordChipTextDisabled]}>
      {word}
    </Text>
  </TouchableOpacity>
);

export default function VerifySeedPhrase() {
  const router = useRouter();

  // Track which slots have been filled and with what word
  const [filledSlots, setFilledSlots] = useState<(string | null)[]>(
    Array(12).fill(null)
  );

  // Track which word bank items have been used (by index)
  const [usedBankIndices, setUsedBankIndices] = useState<Set<number>>(
    new Set()
  );

  const nextEmptySlot = filledSlots.findIndex((slot) => slot === null);
  const allFilled = filledSlots.every((slot) => slot !== null);

  const handleWordSelect = (word: string, bankIndex: number) => {
    if (nextEmptySlot === -1) return;

    setFilledSlots((prev) => {
      const newSlots = [...prev];
      newSlots[nextEmptySlot] = word;
      return newSlots;
    });

    setUsedBankIndices((prev) => {
      const newSet = new Set(prev);
      newSet.add(bankIndex);
      return newSet;
    });
  };

  const handleRemoveWord = (slotIndex: number) => {
    const word = filledSlots[slotIndex];
    if (!word) return;

    // Find the corresponding bank index to re-enable it
    const bankIndex = WORD_BANK.findIndex(
      (w, i) => w === word && usedBankIndices.has(i)
    );

    setFilledSlots((prev) => {
      const newSlots = [...prev];
      // Shift words after the removed slot up
      for (let i = slotIndex; i < 11; i++) {
        newSlots[i] = newSlots[i + 1];
      }
      newSlots[11] = null;
      return newSlots;
    });

    if (bankIndex !== -1) {
      setUsedBankIndices((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bankIndex);
        return newSet;
      });
    }
  };

  const handleContinue = () => {
    // Verify the order
    const isCorrect = filledSlots.every(
      (word, index) => word === CORRECT_ORDER[index]
    );

    if (isCorrect) {
      // Navigate to notice screen
      Alert.alert(
        "Success!",
        "Your seed phrase has been verified.",
        [
          {
            text: "OK",
            onPress: () => {
              router.push('/auth/create-wallet/notice');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Incorrect",
        "The seed phrase order is incorrect. Please try again.",
        [
          {
            text: "Try Again",
            onPress: () => {
              setFilledSlots(Array(12).fill(null));
              setUsedBankIndices(new Set());
            },
          },
        ]
      );
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // Create pairs for 2-column layout
  const slotPairs: [number, number][] = [];
  for (let i = 0; i < 12; i += 2) {
    slotPairs.push([i, i + 1]);
  }

  // Split word bank into rows for display
  const wordBankRows = useMemo(() => {
    const rows: { word: string; index: number }[][] = [[], [], []];
    // Row 1: indices 0-4
    for (let i = 0; i <= 4; i++) {
      rows[0].push({ word: WORD_BANK[i], index: i });
    }
    // Row 2: indices 5-9
    for (let i = 5; i <= 9; i++) {
      rows[1].push({ word: WORD_BANK[i], index: i });
    }
    // Row 3: indices 10-11
    for (let i = 10; i <= 11; i++) {
      rows[2].push({ word: WORD_BANK[i], index: i });
    }
    return rows;
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Enter your seed phrase</Text>
            <Text style={styles.subtitle}>
              Enter the correct seed phrase for each number
            </Text>
          </View>

          {/* Seed Phrase Grid */}
          <View style={styles.gridSection}>
            {slotPairs.map(([leftIdx, rightIdx]) => (
              <View key={leftIdx} style={styles.slotRow}>
                <SeedSlot
                  number={leftIdx + 1}
                  word={filledSlots[leftIdx]}
                  onRemove={() => handleRemoveWord(leftIdx)}
                />
                <SeedSlot
                  number={rightIdx + 1}
                  word={filledSlots[rightIdx]}
                  onRemove={() => handleRemoveWord(rightIdx)}
                />
              </View>
            ))}
          </View>

          {/* Word Bank */}
          <View style={styles.wordBankSection}>
            {wordBankRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.wordBankRow}>
                {row.map(({ word, index }) => (
                  <WordChip
                    key={`${index}-${word}`}
                    word={word}
                    disabled={usedBankIndices.has(index)}
                    onPress={() => handleWordSelect(word, index)}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Bottom Buttons */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !allFilled && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!allFilled}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goBackButton}
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <Text style={styles.goBackButtonText}>Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: "center",
    gap: 15,
    marginTop: 40,
  },
  title: {
    fontFamily: "System",
    fontWeight: "600",
    fontSize: 25,
    lineHeight: 25,
    textAlign: "center",
    color: "#000000",
  },
  subtitle: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 25,
    textAlign: "center",
    color: "#323333",
  },
  gridSection: {
    marginTop: 30,
    gap: 24,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  seedSlot: {
    flex: 1,
    height: 50,
    backgroundColor: "#F4F6F5",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D2D6E1",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
  },
  seedSlotFilled: {
    borderStyle: "solid",
    borderColor: "#0F6EC0",
    backgroundColor: "rgba(15, 114, 199, 0.05)",
  },
  numberBadge: {
    width: 25,
    height: 25,
    backgroundColor: "#0F6EC0",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 16,
    textAlign: "center",
    color: "#F4F6F5",
  },
  slotWord: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 16,
    color: "#000000",
    marginLeft: 12,
  },
  wordBankSection: {
    marginTop: 40,
    gap: 10,
  },
  wordBankRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  wordChip: {
    backgroundColor: "rgba(15, 114, 199, 0.2)",
    borderWidth: 1,
    borderColor: "#D2D6E1",
    borderRadius: 7,
    paddingVertical: 18,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  wordChipDisabled: {
    opacity: 0.3,
    backgroundColor: "rgba(15, 114, 199, 0.05)",
  },
  wordChipText: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#000000",
  },
  wordChipTextDisabled: {
    color: "#999999",
  },
  bottomSection: {
    marginTop: 40,
    gap: 15,
  },
  continueButton: {
    backgroundColor: "#0F6EC0",
    borderRadius: 15,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#F5F5F5",
  },
  goBackButton: {
    backgroundColor: "rgba(15, 114, 199, 0.1)",
    borderRadius: 15,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  goBackButtonText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#000000",
  },
});