import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

// Try to import Voice, fallback if not available (Expo Go safe)
let Voice: any = null;
let SpeechResultsEvent: any = null;
let SpeechErrorEvent: any = null;

try {
  const VoiceModule = require('@react-native-voice/voice');
  Voice = VoiceModule.default || VoiceModule;
  SpeechResultsEvent = VoiceModule.SpeechResultsEvent;
  SpeechErrorEvent = VoiceModule.SpeechErrorEvent;
} catch (error) {
  console.log('Voice module not available - likely running in Expo Go');
}

interface NativeSpeechConfig {
  language: 'zh-CN' | 'zh-TW' | 'en-US';
  maxResults: number;
  continuous: boolean;
  partialResults: boolean;
}

interface SpeechResult {
  transcript: string;
  confidence: number;
  alternatives: string[];
  isFinal: boolean;
}

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export const useEnhancedNativeSpeech = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [partialTranscript, setPartialTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  useEffect(() => {
    // If running in Expo Go, Voice module won't be available
    if (isExpoGo) {
      console.log('🚫 Running in Expo Go - Voice module not available');
      setIsAvailable(false);
      setError('Chức năng speech recognition cần development build. Không hoạt động trong Expo Go.');
      return;
    }

    checkAvailability();
    setupVoiceListeners();

    return () => {
      if (!isExpoGo) {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    };
  }, []);

  const checkAvailability = async () => {
    if (isExpoGo) {
      setIsAvailable(false);
      return;
    }

    try {
      const available = await Voice.isAvailable();
      setIsAvailable(!!available);
      
      if (available) {
        // Note: requestPermission might not be available in all versions
        // Permissions are typically requested automatically when starting recognition
        setHasPermission(true);
        console.log('✅ Voice module available');
      } else {
        console.log('❌ Voice module not available');
        setError('Speech recognition không khả dụng trên thiết bị này');
      }
    } catch (err: any) {
      console.error('Voice availability check failed:', err);
      setError('Không thể kiểm tra speech recognition: ' + err.message);
    }
  };

  const setupVoiceListeners = () => {
    if (isExpoGo) return;

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;
  };

  const onSpeechStart = useCallback(() => {
    console.log('🎙️ Speech recognition started');
    setIsListening(true);
    setError(null);
  }, []);

  const onSpeechEnd = useCallback(() => {
    console.log('⏹️ Speech recognition ended');
    setIsListening(false);
  }, []);

  const onSpeechError = useCallback((event: any) => {
    console.error('❌ Speech recognition error:', event.error);
    setIsListening(false);
    
    const errorMessage = Platform.select({
      ios: getIOSErrorMessage(event.error?.code || ''),
      android: getAndroidErrorMessage(event.error?.message || ''),
      default: 'Speech recognition error occurred'
    });
    
    setError(errorMessage);
  }, []);

  const onSpeechResults = useCallback((event: any) => {
    console.log('📝 Speech results:', event.value);
    
    if (event.value && event.value.length > 0) {
      setTranscript(event.value[0]);
      setPartialTranscript('');
    }
  }, []);

  const onSpeechPartialResults = useCallback((event: any) => {
    console.log('📝 Partial results:', event.value);
    
    if (event.value && event.value.length > 0) {
      setPartialTranscript(event.value[0]);
    }
  }, []);

  const onSpeechVolumeChanged = useCallback((event: any) => {
    // Volume level indicator for UI feedback
    console.log('🔊 Volume:', event.value);
  }, []);

  const startListening = useCallback(async (config: NativeSpeechConfig): Promise<void> => {
    if (isExpoGo) {
      Alert.alert(
        'Không hỗ trợ trong Expo Go',
        'Speech recognition cần development build. Hãy chạy:\n\nnpx expo run:ios\nhoặc\nnpx expo run:android',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!hasPermission) {
      Alert.alert(
        'Cần quyền truy cập',
        'Ứng dụng cần quyền microphone và speech recognition để hoạt động',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Cài đặt', onPress: () => checkAvailability() }
        ]
      );
      return;
    }

    if (isListening) {
      console.warn('⚠️ Already listening, stopping previous session');
      await stopListening();
    }

    try {
      setError(null);
      setTranscript('');
      setPartialTranscript('');

      const options = {
        language: config.language,
        maxResults: config.maxResults,
        partialResults: config.partialResults,
        continuous: config.continuous,
      };

      console.log('🚀 Starting speech recognition with options:', options);
      await Voice.start(config.language, options);
      
    } catch (err: any) {
      console.error('❌ Failed to start speech recognition:', err);
      setError(err.message);
      setIsListening(false);
    }
  }, [hasPermission, isListening]);

  const stopListening = useCallback(async (): Promise<void> => {
    if (isExpoGo) return;

    try {
      console.log('⏸️ Stopping speech recognition');
      await Voice.stop();
    } catch (err: any) {
      console.error('❌ Failed to stop speech recognition:', err);
      setError(err.message);
    }
  }, []);

  const cancelListening = useCallback(async (): Promise<void> => {
    if (isExpoGo) return;

    try {
      console.log('❌ Cancelling speech recognition');
      await Voice.cancel();
      setIsListening(false);
      setTranscript('');
      setPartialTranscript('');
    } catch (err: any) {
      console.error('❌ Failed to cancel speech recognition:', err);
      setError(err.message);
    }
  }, []);

  const recognizeForDuration = useCallback(async (
    config: NativeSpeechConfig, 
    duration: number = 5000
  ): Promise<SpeechResult> => {
    if (isExpoGo) {
      throw new Error('Speech recognition không khả dụng trong Expo Go');
    }

    return new Promise((resolve, reject) => {
      let resolved = false;
      
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          stopListening();
          resolve({
            transcript: transcript || partialTranscript,
            confidence: transcript ? 0.8 : 0.4,
            alternatives: [],
            isFinal: !!transcript
          });
        }
      }, duration);

      // Start listening
      startListening(config).catch((err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(err);
        }
      });

      // Setup result listener
      const handleResults = (event: any) => {
        if (!resolved && event.value && event.value.length > 0) {
          resolved = true;
          clearTimeout(timeout);
          Voice.removeAllListeners();
          setupVoiceListeners();
          
          resolve({
            transcript: event.value[0],
            confidence: 0.9,
            alternatives: event.value.slice(1),
            isFinal: true
          });
        }
      };

      if (!isExpoGo) {
        Voice.onSpeechResults = handleResults;
      }
    });
  }, [transcript, partialTranscript, startListening, stopListening]);

  return {
    // State
    transcript,
    partialTranscript,
    isListening,
    error,
    hasPermission: hasPermission && !isExpoGo,
    isAvailable: isAvailable && !isExpoGo,
    isExpoGo, // Export this for UI to show appropriate message
    
    // Actions
    startListening,
    stopListening,
    cancelListening,
    recognizeForDuration,
    
    // Utils
    checkAvailability,
  };
};

// iOS Error Messages
const getIOSErrorMessage = (code: string): string => {
  const errorMap: { [key: string]: string } = {
    '1': 'Microphone không khả dụng',
    '2': 'Kết nối mạng bị lỗi',
    '3': 'Không thể nhận diện giọng nói',
    '4': 'Yêu cầu không hợp lệ',
    '5': 'Dịch vụ không khả dụng',
    '6': 'Không có quyền truy cập microphone',
    '7': 'Timeout - Hãy thử lại',
  };
  
  return errorMap[code] || `Lỗi iOS Speech: ${code}`;
};

// Android Error Messages  
const getAndroidErrorMessage = (message: string): string => {
  if (message.includes('permission')) {
    return 'Cần cấp quyền microphone và speech recognition';
  }
  if (message.includes('network')) {
    return 'Lỗi kết nối mạng - Hãy kiểm tra internet';
  }
  if (message.includes('timeout')) {
    return 'Timeout - Hãy nói rõ hơn và thử lại';
  }
  if (message.includes('no match')) {
    return 'Không nhận diện được - Hãy nói tiếng Trung rõ hơn';
  }
  
  return `Lỗi Android Speech: ${message}`;
};

export type { NativeSpeechConfig, SpeechResult }; 