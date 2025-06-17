import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Import theme and localization
import { colors } from '../src/theme';
import { I18nProvider } from '../src/localization';
import { store } from '../src/store';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Set status bar style
    if (Platform.OS === 'android') {
      // Android specific setup if needed
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <Provider store={store}>
          <I18nProvider>
            <View style={styles.container}>
              <StatusBar style="dark" backgroundColor={colors.neutral[50]} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 300,
                }}
              >
                <Stack.Screen 
                  name="(tabs)" 
                  options={{ 
                    headerShown: false,
                    title: 'Học Tiếng Trung' 
                  }} 
                />
                <Stack.Screen 
                  name="onboarding" 
                  options={{ 
                    headerShown: false,
                    presentation: 'fullScreenModal' 
                  }} 
                />
                <Stack.Screen 
                  name="lesson/[id]" 
                  options={{ 
                    headerShown: true,
                    title: 'Bài Học',
                    headerStyle: { backgroundColor: colors.neutral[50] },
                    headerTintColor: colors.primary[600],
                  }} 
                />
              </Stack>
            </View>
          </I18nProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 