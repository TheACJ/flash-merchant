import { Stack } from 'expo-router';
import React from 'react';

export default function WithdrawLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F5F5F5' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="SelectFlashTagAsset" />
      <Stack.Screen name="EnterAmount" />
      <Stack.Screen name="EnterPin" />
    </Stack>
  );
}