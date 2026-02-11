import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0F6EC0',
        tabBarInactiveTintColor: '#6D6D6D',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#F4F6F5',
          borderTopColor: '#D2D6E1',
          borderTopWidth: 0.5,
          height: 90,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'SF Pro',
          fontSize: 10,
          fontWeight: '400',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Request',
          tabBarIcon: ({ color }) => <TabBarIcon name="arrow-down" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
