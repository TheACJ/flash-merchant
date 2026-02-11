import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const SEED_WORDS = [
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

interface SeedWordItemProps {
  number: number;
  word: string;
}

const SeedWordItem: React.FC<SeedWordItemProps> = ({ number, word }) => (
  <View style={styles.seedWordContainer}>
    <View style={styles.numberBadge}>
      <Text style={styles.numberText}>{number}</Text>
    </View>
    <Text style={styles.seedWord}>{word}</Text>
  </View>
);

export default function SeedPhrase() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const phrase = SEED_WORDS.join(" ");
    await Clipboard.setStringAsync(phrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    router.push('/auth/create-wallet/verify_seed_phrase');
  };

  const handleGoBack = () => {
    router.back();
  };

  // Create pairs for the 2-column layout
  const wordPairs: [number, number][] = [];
  for (let i = 0; i < SEED_WORDS.length; i += 2) {
    wordPairs.push([i, i + 1]);
  }

  console.log(SEED_WORDS.join(" "));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Seed phrase</Text>
          <Text style={styles.subtitle}>
            Keep this phrase safe it's the only way to restore your wallet and
            access your funds if you lose your device or reinstall the app.
          </Text>
        </View>

        {/* Seed Words Grid */}
        <View style={styles.gridSection}>
          {wordPairs.map(([leftIdx, rightIdx]) => (
            <View key={leftIdx} style={styles.wordRow}>
              <SeedWordItem
                number={leftIdx + 1}
                word={SEED_WORDS[leftIdx]}
              />
              <SeedWordItem
                number={rightIdx + 1}
                word={SEED_WORDS[rightIdx]}
              />
            </View>
          ))}
        </View>

        {/* Copy Button */}
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopy}
          activeOpacity={0.8}
        >
          <Text style={styles.copyButtonText}>
            {copied ? "Copied!" : "Copy"}
          </Text>
        </TouchableOpacity>

        {/* Bottom Buttons */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
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
    fontWeight: "400",
    fontSize: 18,
    lineHeight: 25,
    textAlign: "center",
    color: "#323333",
    paddingHorizontal: 10,
  },
  gridSection: {
    marginTop: 30,
    gap: 24,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  seedWordContainer: {
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
  seedWord: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#000000",
    marginLeft: 12,
  },
  copyButton: {
    marginTop: 24,
    backgroundColor: "#0F6EC0",
    borderRadius: 15,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  copyButtonText: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 15,
    lineHeight: 15,
    color: "#F4F6F5",
  },
  bottomSection: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    gap: 15,
  },
  continueButton: {
    backgroundColor: "#0F6EC0",
    borderRadius: 15,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
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