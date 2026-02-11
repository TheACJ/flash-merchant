import { Stack } from 'expo-router';
import React from 'react';

export default function DepositLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F5F5F5' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="EnterFlashTag" />
      <Stack.Screen name="SelectAssetAmount" />
      <Stack.Screen name="TransactionSummary" />
    </Stack>
  );
}