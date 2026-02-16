import { colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function SettingsLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="profile" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="bank-details" />
        <Stack.Screen name="security" />
        <Stack.Screen name="business-hours" />
        <Stack.Screen name="exchange-rate" />
        <Stack.Screen name="currency" />
        <Stack.Screen name="help-support" />
        <Stack.Screen name="faq" />
        <Stack.Screen name="logout" />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
