import { useState, useCallback, useEffect } from 'react';
import expoTTSService, { TTSOptions } from '@/services/tts/ExpoTTSService';
import { audioPlayerService, AudioState } from '@/services/tts/AudioPlayer';

/**
 * 🎵 useTTS Hook
 * 
 * React hook để sử dụng Text-to-Speech service với Expo Speech
 * 
 * Tính năng:
 * - Synthesize text thành audio với Expo Speech
 * - Play/pause/stop audio
 * - Track audio state
 * - Handle loading states
 * - Error handling
 * - Chinese language support
 */

export interface TTSState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  error: string | null;
  audioState: AudioState | null;
  source: 'expo-speech' | 'cache' | null;
}

export interface ChineseVoiceOptions {
  hanzi: string;
  pinyin?: string;
  tone?: number;
  speed?: number;
  language?: string;
}

export interface TTSControls {
  // Core functions
  speak: (text: string, options?: TTSOptions) => Promise<void>;
  speakChinese: (options: ChineseVoiceOptions) => Promise<void>;
  
  // Playback controls
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  
  // Audio controls
  setVolume: (volume: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  
  // Utility
  clearError: () => void;
  getServiceStatus: () => any;
}

export function useTTS(audioId?: string): [TTSState, TTSControls] {
  const [state, setState] = useState<TTSState>({
    isLoading: false,
    isPlaying: false,
    isPaused: false,
    error: null,
    audioState: null,
    source: null,
  });

  const currentAudioId = audioId || 'default-tts-audio';

  // Update state từ audio player
  const updateAudioState = useCallback((audioState: AudioState) => {
    setState(prev => ({
      ...prev,
      isPlaying: audioState.isPlaying,
      isPaused: audioState.isPaused,
      audioState,
    }));
  }, []);

  // Setup audio progress callback
  useEffect(() => {
    audioPlayerService.setProgressCallback(currentAudioId, updateAudioState);
    
    return () => {
      // Cleanup khi component unmount
      audioPlayerService.stop(currentAudioId);
    };
  }, [currentAudioId, updateAudioState]);

  /**
   * 🎯 Speak text với Expo Speech
   */
  const speak = useCallback(async (text: string, options: TTSOptions = { language: 'zh-CN' }) => {
    try {
      console.log(`🎤 useTTS.speak called with: "${text}", options:`, options);
      
      // Reset state and start loading
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        isPlaying: false,
        isPaused: false,
        error: null 
      }));

      // Use AudioPlayer's playText method for Expo Speech
      await audioPlayerService.playText(
        currentAudioId,
        text,
        {
          language: options.language || 'zh-CN',
          speed: options.speed || 1.0,
          volume: options.volume || 1.0,
        }
      );

      // Reset to ready state after completion
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        isPaused: false,
        source: 'expo-speech',
      }));

      console.log(`✅ Speaking completed: "${text}" (source: expo-speech)`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown TTS error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        isPaused: false,
        error: errorMessage,
      }));
      console.error('❌ TTS Error:', error);
    }
  }, [currentAudioId]);

  /**
   * 🇨🇳 Speak Chinese với thanh điệu
   */
  const speakChinese = useCallback(async (options: ChineseVoiceOptions) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Use AudioPlayer's playChineseText method
      await audioPlayerService.playChineseText(
        currentAudioId,
        options.hanzi,
        options.pinyin,
        options.tone,
        {
          rate: options.speed || 1.0,
          volume: 1.0,
        }
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        source: 'expo-speech',
      }));

      console.log(`🇨🇳 Speaking Chinese: ${options.hanzi} (${options.pinyin}) - Tone ${options.tone}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Chinese TTS error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('❌ Chinese TTS Error:', error);
    }
  }, [currentAudioId]);

  /**
   * ▶️ Play current audio
   */
  const play = useCallback(async () => {
    try {
      await audioPlayerService.resume(currentAudioId);
    } catch (error) {
      console.error('❌ Play Error:', error);
    }
  }, [currentAudioId]);

  /**
   * ⏸️ Pause current audio
   */
  const pause = useCallback(async () => {
    try {
      await audioPlayerService.pause(currentAudioId);
    } catch (error) {
      console.error('❌ Pause Error:', error);
    }
  }, [currentAudioId]);

  /**
   * ⏹️ Stop current audio
   */
  const stop = useCallback(async () => {
    try {
      await audioPlayerService.stop(currentAudioId);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        audioState: null,
      }));
    } catch (error) {
      console.error('❌ Stop Error:', error);
    }
  }, [currentAudioId]);

  /**
   * 🔊 Set volume
   */
  const setVolume = useCallback(async (volume: number) => {
    try {
      await audioPlayerService.setVolume(currentAudioId, volume);
    } catch (error) {
      console.error('❌ Set Volume Error:', error);
    }
  }, [currentAudioId]);

  /**
   * ⚡ Set playback rate
   */
  const setRate = useCallback(async (rate: number) => {
    try {
      await audioPlayerService.setRate(currentAudioId, rate);
    } catch (error) {
      console.error('❌ Set Rate Error:', error);
    }
  }, [currentAudioId]);

  /**
   * ⏭️ Seek to position
   */
  const seekTo = useCallback(async (position: number) => {
    try {
      await audioPlayerService.seekTo(currentAudioId, position);
    } catch (error) {
      console.error('❌ Seek Error:', error);
    }
  }, [currentAudioId]);

  /**
   * 🧹 Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * 📊 Get service status
   */
  const getServiceStatus = useCallback(() => {
    return {
      audioPlayer: audioPlayerService.getStatus(),
      ttsService: expoTTSService.getStatus(),
    };
  }, []);

  const controls: TTSControls = {
    speak,
    speakChinese,
    play,
    pause,
    stop,
    setVolume,
    setRate,
    seekTo,
    clearError,
    getServiceStatus,
  };

  return [state, controls];
}

/**
 * 📚 Specialized hook for vocabulary learning
 */
export function useVocabularyTTS() {
  const [ttsState, ttsControls] = useTTS('vocabulary-tts');

  const speakVocabulary = useCallback(async (word: {
    simplified: string;
    pinyin: string;
    tone?: number;
  }) => {
    await ttsControls.speakChinese({
      hanzi: word.simplified,
      pinyin: word.pinyin,
      tone: word.tone,
      speed: 0.8, // Slower for learning
    });
  }, [ttsControls]);

  return {
    ...ttsState,
    speakVocabulary,
    ...ttsControls,
  };
}

/**
 * 🗣️ Specialized hook for pronunciation practice
 */
export function usePronunciationTTS() {
  const [ttsState, ttsControls] = useTTS('pronunciation-tts');

  const speakForPractice = useCallback(async (
    text: string,
    speed: number = 0.6 // Very slow for practice
  ) => {
    console.log(`🎯 usePronunciationTTS.speakForPractice called with: "${text}", speed: ${speed}`);
    await ttsControls.speak(text, {
      language: 'zh-CN',
      speed,
    });
  }, [ttsControls]);

  const repeatPronunciation = useCallback(async (
    hanzi: string,
    pinyin: string,
    tone?: number,
    repetitions: number = 3
  ) => {
    for (let i = 0; i < repetitions; i++) {
      await ttsControls.speakChinese({
        hanzi,
        pinyin,
        tone,
        speed: 0.7,
      });
      
      // Pause between repetitions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }, [ttsControls]);

  return {
    ...ttsState,
    speakForPractice,
    repeatPronunciation,
    ...ttsControls,
  };
}

/**
 * 📖 Specialized hook for lesson content
 */
export function useLessonTTS() {
  const [ttsState, ttsControls] = useTTS('lesson-tts');

  const speakLessonContent = useCallback(async (content: {
    chinese: string;
    vietnamese?: string;
    speed?: number;
  }) => {
    // Speak Chinese first
    await ttsControls.speak(content.chinese, {
      language: 'zh-CN',
      speed: content.speed || 1.0,
    });

    // Optional: speak Vietnamese translation
    if (content.vietnamese) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await ttsControls.speak(content.vietnamese, {
        language: 'vi-VN',
        speed: content.speed || 1.0,
      });
    }
  }, [ttsControls]);

  return {
    ...ttsState,
    speakLessonContent,
    ...ttsControls,
  };
}

export default useTTS; 