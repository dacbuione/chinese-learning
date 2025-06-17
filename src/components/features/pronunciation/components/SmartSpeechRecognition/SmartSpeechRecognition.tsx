import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { SpeechRecognitionComponent } from '../SpeechRecognition';
import { NativeSpeechRecognitionComponent } from '../NativeSpeechRecognition';
import { ExpoGoSpeechRecognitionComponent } from '../ExpoGoSpeechRecognition';
import { PronunciationResult } from '../../../../../services/pronunciationEvaluationService';
import { WordAccuracy } from '../NativeSpeechRecognition/NativeSpeechRecognition';

// Check if native modules are available
let hasNativeModules = true;
try {
  require('@react-native-community/voice');
} catch (error) {
  hasNativeModules = false;
}

export interface SmartSpeechRecognitionProps {
  expectedText: string;
  language?: 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'vi-VN';
  onResult?: (result: PronunciationResult) => void;
  onError?: (error: string) => void;
  onWordAccuracy?: (wordAccuracies: WordAccuracy[]) => void;
  maxDuration?: number; // milliseconds
  disabled?: boolean;
  showExpectedText?: boolean;
  autoEvaluate?: boolean;
  forceNative?: boolean; // Force native speech recognition
  forceWeb?: boolean; // Force web speech recognition
}

/**
 * Smart Speech Recognition Component
 * 
 * Automatically chooses between Web Speech API and Native Speech Recognition
 * based on the platform and environment:
 * 
 * - **Mobile App (iOS/Android)**: Uses Native Speech Recognition
 * - **Web Browser**: Uses Web Speech API
 * - **Expo Web**: Uses Web Speech API
 * 
 * Features:
 * - Automatic platform detection
 * - Fallback mechanisms
 * - Consistent API across platforms
 * - Error handling and user feedback
 */
export const SmartSpeechRecognitionComponent: React.FC<SmartSpeechRecognitionProps> = ({
  forceNative = false,
  forceWeb = false,
  ...props
}) => {
  // Determine which speech recognition to use
  const speechRecognitionType = useMemo(() => {
    // Manual override
    if (forceNative) return 'native';
    if (forceWeb) return 'web';
    
    // Platform-based detection
    if (Platform.OS === 'web') {
      // Running in web browser (Expo Web)
      return 'web';
    } else {
      // Running on native mobile (iOS/Android)
      if (hasNativeModules) {
        // Development build with native modules
        return 'native';
      } else {
        // Expo Go environment - use fallback
        return 'expo-go';
      }
    }
  }, [forceNative, forceWeb]);

  // Render appropriate component
  if (speechRecognitionType === 'native') {
    return <NativeSpeechRecognitionComponent {...props} />;
  } else if (speechRecognitionType === 'expo-go') {
    return <ExpoGoSpeechRecognitionComponent {...props} />;
  } else {
    return <SpeechRecognitionComponent {...props} />;
  }
}; 