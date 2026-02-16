import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '@/constants/theme';

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Deposit Routes */}
      <Stack.Screen name="deposit/index" />
      <Stack.Screen name="deposit/EnterFlashTag" />
      <Stack.Screen name="deposit/SelectAssetAmount" />
      <Stack.Screen name="deposit/TransactionSummary" />

      {/* Withdraw Routes */}
      <Stack.Screen name="withdraw/index" />
      <Stack.Screen name="withdraw/SelectFlashTagAsset" />
      <Stack.Screen name="withdraw/EnterAmount" />
      <Stack.Screen name="withdraw/EnterPin" />

      {/* Stake Routes */}
      <Stack.Screen name="stake/index" />
      <Stack.Screen name="stake/EnterStakeAmount" />
      <Stack.Screen name="stake/StakePayment" />

      <Stack.Screen name="profile" />
    </Stack>
  );
}
