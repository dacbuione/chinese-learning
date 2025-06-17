import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';

export interface ExpoGoSpeechConfig {
  language?: 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'vi-VN';
  maxDuration?: number;
}

export interface UseExpoGoSpeechRecognitionReturn {
  // States
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  listening: boolean;
  isSupported: boolean;
  hasPermission: boolean;
  error: string | null;
  
  // Actions
  startListening: (config?: ExpoGoSpeechConfig) => Promise<void>;
  stopListening: () => Promise<void>;
  abortListening: () => Promise<void>;
  resetTranscript: () => void;
  
  // Utils
  getSupportedLanguages: () => Promise<string[]>;
  isRecognitionAvailable: () => Promise<boolean>;
}

/**
 * Expo Go Compatible Speech Recognition Hook
 * 
 * This is a fallback implementation for Expo Go environment
 * where native modules are not available.
 * 
 * Features:
 * - Simulates speech recognition for development
 * - Provides mock transcripts for testing
 * - User-friendly error messages
 * - Graceful degradation
 */
export const useExpoGoSpeechRecognition = (): UseExpoGoSpeechRecognitionReturn => {
  // States
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [listening, setListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for testing
  const mockTranscripts = [
    '你好',
    '你好世界',
    '我是学生',
    '我在学习中文',
    '今天天气很好',
    '谢谢你的帮助',
  ];

  // Check if running in Expo Go (simplified check)
  const isSupported = false; // Native speech not available in Expo Go
  const hasPermission = false;

  const startListening = useCallback(async (config: ExpoGoSpeechConfig = {}) => {
    try {
      setError(null);
      setListening(true);
      setTranscript('');
      setInterimTranscript('');
      setFinalTranscript('');

      // Show development notice
      Alert.alert(
        '🚧 Chế độ phát triển',
        'Bạn đang chạy trong Expo Go. Speech Recognition sẽ được mô phỏng.\n\n' +
        'Để test thật trên mobile, cần build development build:\n' +
        '• iOS: npx expo run:ios\n' +
        '• Android: npx expo run:android',
        [
          { text: 'Hủy', style: 'cancel', onPress: () => setListening(false) },
          { 
            text: 'Mô phỏng', 
            onPress: () => simulateSpeechRecognition(config)
          }
        ]
      );

    } catch (err: any) {
      console.error('Error in mock speech recognition:', err);
      setError('Lỗi mô phỏng speech recognition');
      setListening(false);
    }
  }, []);

  const simulateSpeechRecognition = useCallback((config: ExpoGoSpeechConfig) => {
    // Simulate interim results
    const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    
    // Simulate typing effect
    let currentText = '';
    const chars = randomTranscript.split('');
    
    const typeInterval = setInterval(() => {
      if (chars.length > 0) {
        currentText += chars.shift();
        setInterimTranscript(currentText);
        setTranscript(currentText);
      } else {
        // Finish simulation
        clearInterval(typeInterval);
        setFinalTranscript(currentText);
        setInterimTranscript('');
        setListening(false);
      }
    }, 200); // 200ms per character

    // Auto-stop after duration
    const maxDuration = config.maxDuration || 5000;
    setTimeout(() => {
      clearInterval(typeInterval);
      if (listening) {
        setFinalTranscript(currentText || randomTranscript);
        setInterimTranscript('');
        setListening(false);
      }
    }, maxDuration);

  }, [listening]);

  const stopListening = useCallback(async () => {
    try {
      setListening(false);
    } catch (err) {
      console.error('Error stopping mock speech recognition:', err);
      setError('Không thể dừng mô phỏng');
    }
  }, []);

  const abortListening = useCallback(async () => {
    try {
      setListening(false);
      setTranscript('');
      setInterimTranscript('');
      setFinalTranscript('');
    } catch (err) {
      console.error('Error aborting mock speech recognition:', err);
      setError('Không thể hủy mô phỏng');
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

  const getSupportedLanguages = useCallback(async (): Promise<string[]> => {
    return ['zh-CN', 'zh-TW', 'zh-HK', 'en-US', 'vi-VN'];
  }, []);

  const isRecognitionAvailable = useCallback(async (): Promise<boolean> => {
    return false; // Not available in Expo Go
  }, []);

  return {
    // States
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    isSupported,
    hasPermission,
    error,
    
    // Actions
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
    
    // Utils
    getSupportedLanguages,
    isRecognitionAvailable,
  };
}; 