import { borderRadius, colors, layout, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LogoutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container as ViewStyle}>
      <View style={styles.content as ViewStyle}>
        <View style={styles.iconContainer as ViewStyle}>
          <Ionicons name="log-out-outline" size={80} color={colors.error} />
        </View>
        <Text style={styles.title as TextStyle}>
          Are you sure you want to logout your account?
        </Text>
      </View>

      <View style={styles.buttonContainer as ViewStyle}>
        <TouchableOpacity
          style={styles.yesButton as ViewStyle}
          onPress={() => router.replace('/auth/login' as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.yesButtonText as TextStyle}>Yes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton as ViewStyle}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText as TextStyle}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(195, 29, 30, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  yesButton: {
    height: layout.buttonHeightSmall,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  yesButtonText: {
    fontSize: 15,
    color: colors.textLight,
    fontWeight: typography.fontWeight.regular,
  },
  cancelButton: {
    height: layout.buttonHeightSmall,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: typography.fontWeight.regular,
  },
});
