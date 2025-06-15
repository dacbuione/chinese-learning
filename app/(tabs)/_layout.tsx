import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import theme and hooks
import { colors, device } from '../../src/theme';
import { useTranslation } from '../../src/localization';

interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ name, color, size }) => (
  <Ionicons name={name as any} size={size} color={color} />
);

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.neutral[50],
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
          height: device.isMobile ? 80 : 90,
          paddingBottom: device.hasHomeIndicator ? 20 : 10,
          paddingTop: 10,
          elevation: 8,
          shadowColor: colors.neutral[900],
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="lessons"
        options={{
          title: t('navigation.lessons'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="book" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="practice"
        options={{
          title: t('navigation.practice'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="mic" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="progress/index"
        options={{
          title: t('navigation.progress'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="stats-chart" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
