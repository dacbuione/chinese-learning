import { Stack } from 'expo-router';

export default function LessonsLayout() {
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
          title: 'Bài học',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Bài học',
        }}
      />
    </Stack>
  );
}
