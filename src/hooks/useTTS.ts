import { useState, useCallback, useEffect } from 'react';
import { googleTTSService, TTSOptions, TTSResponse, ChineseVoiceOptions } from '../services/tts/GoogleTTSService';
import { audioPlayerService, AudioState } from '../services/tts/AudioPlayer';

/**
 * 🎵 useTTS Hook
 * 
 * React hook để sử dụng Text-to-Speech service
 * 
 * Tính năng:
 * - Synthesize text thành audio
 * - Play/pause/stop audio
 * - Track audio state
 * - Handle loading states
 * - Error handling
 */

export interface TTSState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  error: string | null;
  audioState: AudioState | null;
  source: 'google-tts' | 'web-speech' | 'cache' | null;
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
   * 🎯 Speak text với TTS
   */
  const speak = useCallback(async (text: string, options: TTSOptions = { language: 'zh-CN' }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Synthesize text thành audio
      const response: TTSResponse = await googleTTSService.synthesize(text, options);

      // Play audio
      await audioPlayerService.playFromBase64(
        currentAudioId,
        response.audioContent,
        {
          volume: 1.0,
          rate: options.speed || 1.0,
        }
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        source: response.source,
      }));

      console.log(`🎵 Speaking: "${text}" (source: ${response.source})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown TTS error';
      setState(prev => ({
        ...prev,
        isLoading: false,
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

      const response: TTSResponse = await googleTTSService.synthesizeChinese(options);

      await audioPlayerService.playFromBase64(
        currentAudioId,
        response.audioContent,
        {
          volume: 1.0,
          rate: options.speed || 1.0,
        }
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        source: response.source,
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
   * 📍 Seek to position
   */
  const seekTo = useCallback(async (position: number) => {
    try {
      await audioPlayerService.seekTo(currentAudioId, position);
    } catch (error) {
      console.error('❌ Seek Error:', error);
    }
  }, [currentAudioId]);

  /**
   * 🧹 Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * 📊 Get service status
   */
  const getServiceStatus = useCallback(() => {
    return {
      tts: googleTTSService.getStatus(),
      audio: audioPlayerService.getStatus(),
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
 * 🎯 Hook cho vocabulary cards
 */
export function useVocabularyTTS() {
  const [state, controls] = useTTS('vocabulary-tts');

  const speakVocabulary = useCallback(async (
    hanzi: string,
    pinyin: string,
    tone: number,
    speed: number = 1.0
  ) => {
    await controls.speakChinese({
      hanzi,
      pinyin,
      tone,
      speed,
    });
  }, [controls]);

  return {
    ...state,
    speakVocabulary,
    ...controls,
  };
}

/**
 * 🎯 Hook cho pronunciation practice
 */
export function usePronunciationTTS() {
  const [state, controls] = useTTS('pronunciation-tts');

  const speakForPractice = useCallback(async (
    hanzi: string,
    pinyin: string,
    tone: number,
    speed: number = 0.8 // Slower for practice
  ) => {
    await controls.speakChinese({
      hanzi,
      pinyin,
      tone,
      speed,
    });
  }, [controls]);

  const speakExample = useCallback(async (
    text: string,
    speed: number = 1.0
  ) => {
    await controls.speak(text, {
      language: 'zh-CN',
      speed,
      voice: 'zh-CN-Wavenet-A',
    });
  }, [controls]);

  return {
    ...state,
    speakForPractice,
    speakExample,
    ...controls,
  };
}

/**
 * 🎯 Hook cho lesson content
 */
export function useLessonTTS() {
  const [state, controls] = useTTS('lesson-tts');

  const speakLesson = useCallback(async (
    text: string,
    language: 'zh-CN' | 'vi-VN' | 'en-US' = 'zh-CN',
    speed: number = 1.0
  ) => {
    await controls.speak(text, {
      language,
      speed,
    });
  }, [controls]);

  return {
    ...state,
    speakLesson,
    ...controls,
  };
}

export default useTTS; 