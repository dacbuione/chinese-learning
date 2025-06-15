import { Stack } from 'expo-router';
import React from 'react';

export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Luyện tập',
        }} 
      />
      <Stack.Screen 
        name="vocabulary" 
        options={{
          title: 'Luyện từ vựng',
        }} 
      />
      <Stack.Screen 
        name="pronunciation" 
        options={{
          title: 'Luyện phát âm',
        }} 
      />
      <Stack.Screen 
        name="tones" 
        options={{
          title: 'Luyện thanh điệu',
        }} 
      />
      <Stack.Screen 
        name="writing" 
        options={{
          title: 'Luyện viết chữ',
        }} 
      />
      <Stack.Screen 
        name="quiz" 
        options={{
          title: 'Kiểm tra',
        }} 
      />
    </Stack>
  );
} 