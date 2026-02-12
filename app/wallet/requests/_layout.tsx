import React from 'react';
import { Stack } from 'expo-router';

export default function RequestsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F5F5F5' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="RequestDetails" />
      <Stack.Screen name="AwaitingFiat" />
    </Stack>
  );
}