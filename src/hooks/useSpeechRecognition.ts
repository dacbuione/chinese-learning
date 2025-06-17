import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition as useNativeSpeechRecognition } from 'react-speech-recognition';

export interface SpeechRecognitionConfig {
  language?: 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'vi-VN';
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: string[];
}

export interface UseSpeechRecognitionReturn {
  // States
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  listening: boolean;
  isSupported: boolean;
  hasPermission: boolean;
  error: string | null;
  
  // Actions
  startListening: (config?: SpeechRecognitionConfig) => Promise<void>;
  stopListening: () => void;
  abortListening: () => void;
  resetTranscript: () => void;
  
  // Utils
  checkBrowserSupport: () => boolean;
  requestPermission: () => Promise<boolean>;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript: nativeReset,
    browserSupportsSpeechRecognition
  } = useNativeSpeechRecognition();

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check browser support
  const checkBrowserSupport = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Edge.');
      return false;
    }
    return true;
  }, [browserSupportsSpeechRecognition]);

  // Request microphone permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setHasPermission(false);
      setError('Cần quyền truy cập microphone để sử dụng tính năng này.');
      return false;
    }
  }, []);

  // Start listening with comprehensive error handling
  const startListening = useCallback(async (config: SpeechRecognitionConfig = {}) => {
    try {
      setError(null);

      // Check browser support
      if (!checkBrowserSupport()) {
        return;
      }

      // Request permission if not granted
      if (!hasPermission) {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          return;
        }
      }

      // Default configuration
      const defaultConfig: SpeechRecognitionConfig = {
        language: 'zh-CN',
        continuous: true,
        interimResults: true,
        maxAlternatives: 1,
        ...config
      };

      // Start recognition
      await SpeechRecognition.startListening(defaultConfig);
      
    } catch (err) {
      console.error('Speech recognition error:', err);
      setError('Không thể bắt đầu nhận diện giọng nói. Vui lòng thử lại.');
    }
  }, [hasPermission, checkBrowserSupport, requestPermission]);

  // Stop listening
  const stopListening = useCallback(() => {
    try {
      SpeechRecognition.stopListening();
      setError(null);
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
      setError('Lỗi khi dừng nhận diện giọng nói.');
    }
  }, []);

  // Abort listening
  const abortListening = useCallback(() => {
    try {
      SpeechRecognition.abortListening();
      setError(null);
    } catch (err) {
      console.error('Error aborting speech recognition:', err);
      setError('Lỗi khi hủy nhận diện giọng nói.');
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    nativeReset();
    setError(null);
  }, [nativeReset]);

  // Handle speech recognition events
  useEffect(() => {
    const handleError = (event: any) => {
      console.error('Speech recognition error event:', event);
      
      switch (event.error) {
        case 'no-speech':
          setError('Không phát hiện giọng nói. Vui lòng thử nói to hơn.');
          break;
        case 'audio-capture':
          setError('Không thể truy cập microphone. Vui lòng kiểm tra kết nối.');
          break;
        case 'not-allowed':
          setError('Quyền truy cập microphone bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt.');
          setHasPermission(false);
          break;
        case 'network':
          setError('Lỗi kết nối mạng. Vui lòng kiểm tra internet.');
          break;
        case 'service-not-allowed':
          setError('Dịch vụ nhận diện giọng nói không khả dụng.');
          break;
        default:
          setError(`Lỗi nhận diện giọng nói: ${event.error}`);
      }
    };

    const handleEnd = () => {
      // Auto-restart if continuous mode and no error
      if (listening && !error) {
        console.log('Speech recognition ended, restarting...');
        // Note: SpeechRecognition will handle auto-restart
      }
    };

    // Add event listeners if available
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (recognition) {
        recognition.onerror = handleError;
        recognition.onend = handleEnd;
      }
    }

    return () => {
      // Cleanup event listeners
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        const recognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (recognition) {
          recognition.onerror = null;
          recognition.onend = null;
        }
      }
    };
  }, [listening, error]);

  // Check permission on mount
  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      // Check if permission was previously granted
      navigator.permissions?.query({ name: 'microphone' as PermissionName })
        .then(permissionStatus => {
          setHasPermission(permissionStatus.state === 'granted');
        })
        .catch(() => {
          // Permission API not supported, will check when needed
          setHasPermission(false);
        });
    }
  }, [browserSupportsSpeechRecognition]);

  return {
    // States
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    isSupported: browserSupportsSpeechRecognition,
    hasPermission,
    error,
    
    // Actions
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
    
    // Utils
    checkBrowserSupport,
    requestPermission
  };
}; 