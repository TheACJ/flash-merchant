import { Stack } from 'expo-router';
import React from 'react';

export default function MiscLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F5F5F5' },
      }}
    >
      <Stack.Screen name="notifications/index" />
      <Stack.Screen name="chat/index" />
      <Stack.Screen name="chat/[conversationId]" />
    </Stack>
  );
}