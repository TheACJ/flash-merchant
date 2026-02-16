import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, typography } from '@/constants/theme';

interface VerifyingProps {
  title?: string;
  message?: string;
}

export default function Verifying({ title, message }: VerifyingProps) {
  const router = useRouter();
  const { type, number } = useLocalSearchParams<{
    type: string;
    number: string;
  }>();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    // Simulate verification delay
    const timer = setTimeout(() => {
      // Navigate to Success screen
      router.push({
        pathname: './success',
        params: { type: type || 'Verification' },
      });
    }, 3000);

    return () => {
      spinAnimation.stop();
      clearTimeout(timer);
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <Animated.View
          style={[styles.spinner, { transform: [{ rotate: spin }]}]}
        >
          {/* Spinner arcs */}
          <View style={[styles.arc, styles.arcTop, styles.arcPrimary]} />
          <View style={[styles.arc, styles.arcBottom, styles.arcPrimary]} />
          <View style={[styles.arc, styles.arcLeft, styles.arcPrimary]} />
          <View style={[styles.arc, styles.arcRight, styles.arcGray]} />
          <View
            style={[styles.arc, styles.arcTopLeft, styles.arcPrimary]}
          />
          <View style={[styles.arc, styles.arcTopRight, styles.arcGray]} />
          <View
            style={[styles.arc, styles.arcBottomLeft, styles.arcPrimary]}
          />
          <View
            style={[styles.arc, styles.arcBottomRight, styles.arcGray]}
          />
        </Animated.View>
        
        {(title || message) && (
          <View style={styles.textContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const SPINNER_SIZE = 150;
const DOT_SIZE = 12;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
    textAlign: "center",
  },
  spinner: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    position: "relative",
  },
  arc: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  arcPrimary: {
    backgroundColor: colors.primary,
  },
  arcGray: {
    backgroundColor: "#AFAFB0",
  },
  arcTop: {
    left: SPINNER_SIZE / 2 - DOT_SIZE / 2,
    top: 0,
  },
  arcBottom: {
    left: SPINNER_SIZE / 2 - DOT_SIZE / 2,
    bottom: 0,
  },
  arcLeft: {
    top: SPINNER_SIZE / 2 - DOT_SIZE / 2,
    left: 0,
  },
  arcRight: {
    top: SPINNER_SIZE / 2 - DOT_SIZE / 2,
    right: 0,
  },
  arcTopRight: {
    top: SPINNER_SIZE * 0.146,
    right: SPINNER_SIZE * 0.146,
  },
  arcTopLeft: {
    top: SPINNER_SIZE * 0.146,
    left: SPINNER_SIZE * 0.146,
  },
  arcBottomRight: {
    bottom: SPINNER_SIZE * 0.146,
    right: SPINNER_SIZE * 0.146,
  },
  arcBottomLeft: {
    bottom: SPINNER_SIZE * 0.146,
    left: SPINNER_SIZE * 0.146,
  },
});
