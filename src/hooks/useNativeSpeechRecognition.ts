import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

// Try to import Voice, fallback if not available
let Voice: any = null;
let SpeechRecognizedEvent: any = null;
let SpeechResultsEvent: any = null; 
let SpeechErrorEvent: any = null;

try {
  const VoiceModule = require('@react-native-community/voice');
  Voice = VoiceModule.default || VoiceModule;
  SpeechRecognizedEvent = VoiceModule.SpeechRecognizedEvent;
  SpeechResultsEvent = VoiceModule.SpeechResultsEvent;
  SpeechErrorEvent = VoiceModule.SpeechErrorEvent;
} catch (error) {
  console.log('Voice module not available - likely running in Expo Go');
}

export interface NativeSpeechConfig {
  language?: 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'vi-VN';
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  timeout?: number; // milliseconds
}

export interface NativeSpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: string[];
}

export interface UseNativeSpeechRecognitionReturn {
  // States
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  listening: boolean;
  isSupported: boolean;
  hasPermission: boolean;
  error: string | null;
  
  // Actions
  startListening: (config?: NativeSpeechConfig) => Promise<void>;
  stopListening: () => Promise<void>;
  abortListening: () => Promise<void>;
  resetTranscript: () => void;
  
  // Utils
  getSupportedLanguages: () => Promise<string[]>;
  isRecognitionAvailable: () => Promise<boolean>;
}

const DEFAULT_CONFIG: NativeSpeechConfig = {
  language: 'zh-CN',
  continuous: false,
  interimResults: true,
  maxAlternatives: 5,
  timeout: 30000, // 30 seconds
};

export const useNativeSpeechRecognition = (): UseNativeSpeechRecognitionReturn => {
  // States
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [listening, setListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if speech recognition is supported
  const checkSupport = useCallback(async () => {
    try {
      if (!Voice) {
        setIsSupported(false);
        setHasPermission(false);
        return;
      }
      
      const available = await Voice.isAvailable();
      setIsSupported(!!available);
      
      if (available) {
        // For permissions, we'll check during startListening
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Error checking speech recognition support:', err);
      setIsSupported(false);
      setHasPermission(false);
    }
  }, []);

  // Initialize Voice events
  useEffect(() => {
    // Set up event listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    // Check support on mount
    checkSupport();

    // Cleanup on unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [checkSupport]);

  // Event handlers
  const onSpeechStart = useCallback((e: any) => {
    console.log('Speech recognition started:', e);
    setListening(true);
    setError(null);
  }, []);

  const onSpeechRecognized = useCallback((e: any) => {
    console.log('Speech recognized:', e);
  }, []);

  const onSpeechEnd = useCallback((e: any) => {
    console.log('Speech recognition ended:', e);
    setListening(false);
  }, []);

  const onSpeechError = useCallback((e: any) => {
    console.error('Speech recognition error:', e);
    setListening(false);
    
    // Map error codes to Vietnamese messages
    let errorMessage = 'Có lỗi xảy ra khi nhận diện giọng nói';
    
    switch (e.error?.code) {
      case 'permissions':
        errorMessage = 'Cần quyền truy cập microphone. Vui lòng cấp quyền trong Settings.';
        break;
      case 'network':
        errorMessage = 'Lỗi kết nối mạng. Kiểm tra internet và thử lại.';
        break;
      case 'audio':
        errorMessage = 'Lỗi audio. Kiểm tra microphone và thử lại.';
        break;
      case 'server':
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        break;
      case 'client':
        errorMessage = 'Lỗi ứng dụng. Vui lòng khởi động lại app.';
        break;
      case 'speech-timeout':
        errorMessage = 'Không phát hiện giọng nói. Vui lòng nói to hơn.';
        break;
      case 'no-match':
        errorMessage = 'Không nhận diện được giọng nói. Vui lòng nói rõ hơn.';
        break;
      case 'recognizer-busy':
        errorMessage = 'Hệ thống đang bận. Vui lòng thử lại.';
        break;
      case 'insufficient-permissions':
        errorMessage = 'Không đủ quyền truy cập. Cấp quyền microphone trong Settings.';
        break;
      default:
        errorMessage = `Lỗi nhận diện giọng nói: ${e.error?.message || 'Unknown error'}`;
    }
    
    setError(errorMessage);
  }, []);

  const onSpeechResults = useCallback((e: any) => {
    console.log('Speech results:', e);
    
    if (e.value && e.value.length > 0) {
      const result = e.value[0];
      setFinalTranscript(result);
      setTranscript(result);
      setInterimTranscript('');
    }
  }, []);

  const onSpeechPartialResults = useCallback((e: any) => {
    console.log('Speech partial results:', e);
    
    if (e.value && e.value.length > 0) {
      const result = e.value[0];
      setInterimTranscript(result);
      setTranscript(result);
    }
  }, []);

  const onSpeechVolumeChanged = useCallback((e: any) => {
    // Can be used for volume visualization
    console.log('Speech volume changed:', e.value);
  }, []);

  // Actions
  const startListening = useCallback(async (config: NativeSpeechConfig = {}) => {
    try {
      setError(null);
      
      if (!isSupported) {
        throw new Error('Thiết bị không hỗ trợ nhận diện giọng nói');
      }

      if (!hasPermission) {
        throw new Error('Cần quyền truy cập microphone');
      }

      // Reset transcripts
      setTranscript('');
      setInterimTranscript('');
      setFinalTranscript('');

      // Merge with default config
      const finalConfig = { ...DEFAULT_CONFIG, ...config };

      // Start recognition
      const options = {
        language: finalConfig.language,
        continuous: finalConfig.continuous,
        interimResults: finalConfig.interimResults,
        maxAlternatives: finalConfig.maxAlternatives,
      };

      await Voice.start(finalConfig.language || 'zh-CN', options);

      // Set timeout if specified
      if (finalConfig.timeout && finalConfig.timeout > 0) {
        setTimeout(async () => {
          if (listening) {
            await stopListening();
          }
        }, finalConfig.timeout);
      }

    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setError(err.message || 'Không thể bắt đầu nhận diện giọng nói');
      setListening(false);
    }
  }, [isSupported, hasPermission, listening]);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
      setListening(false);
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
      setError('Không thể dừng nhận diện giọng nói');
    }
  }, []);

  const abortListening = useCallback(async () => {
    try {
      await Voice.cancel();
      setListening(false);
      setTranscript('');
      setInterimTranscript('');
      setFinalTranscript('');
    } catch (err) {
      console.error('Error aborting speech recognition:', err);
      setError('Không thể hủy nhận diện giọng nói');
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setError(null);
  }, []);

  const getSupportedLanguages = useCallback(async (): Promise<string[]> => {
    try {
      // Return common supported languages for Chinese learning
      return [
        'zh-CN', 'zh-TW', 'zh-HK', 
        'en-US', 'en-GB', 
        'vi-VN'
      ];
    } catch (err) {
      console.error('Error getting supported languages:', err);
      return ['zh-CN', 'en-US', 'vi-VN'];
    }
  }, []);

  const isRecognitionAvailable = useCallback(async (): Promise<boolean> => {
    try {
      const available = await Voice.isAvailable();
      return !!available;
    } catch (err) {
      console.error('Error checking recognition availability:', err);
      return false;
    }
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