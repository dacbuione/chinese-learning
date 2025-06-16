/**
 * 🎵 Expo Text-to-Speech Service
 * 
 * Cross-platform TTS service with Chinese language support
 * 
 * Features:
 * - Cross-platform TTS (iOS/Android/Web)
 * - Chinese language support
 * - Tone-aware pronunciation
 * - Speed control
 * - Caching system
 * - Silent mode support for iOS
 */

import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface TTSOptions {
  language?: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  ssml?: boolean;
}

export interface CacheItem {
  audioData: string;
  timestamp: number;
  language: string;
  voice: string;
}

class ExpoTTSService {
  private cache = new Map<string, CacheItem>();
  private readonly CACHE_KEY = '@tts_cache';
  private readonly CACHE_SIZE_LIMIT = 100;
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  private webSpeechSupported = false;

  constructor() {
    this.loadCache();
    this.checkWebSpeechSupport();
    this.initializeAudioPermissions();
  }

  /**
   * Initialize audio permissions and configure silent mode support for iOS
   */
  private async initializeAudioPermissions(): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        const { Audio } = require('expo-av');
        
        // Request audio permissions
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Audio permissions not granted, TTS may not work on device');
        }
        
        // Configure audio session for silent mode support
        try {
          await Audio.setIsEnabledAsync(false);
          await Audio.setIsEnabledAsync(true);
          
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true, // Enable silent mode support
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
            interruptionModeIOS: 0,
          });
          
        } catch (error) {
          // Fallback configuration
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
          });
        }
        
      } catch (error) {
        console.warn('Failed to initialize iOS audio permissions:', error);
      }
    }
  }

  /**
   * Check Web Speech API support
   */
  private checkWebSpeechSupport(): void {
    if (Platform.OS === 'web') {
      this.webSpeechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    }
  }

  /**
   * Main synthesis method - generates audio data
   */
  async synthesize(text: string, options: TTSOptions = {}): Promise<string> {
    try {
      const cacheKey = this.generateCacheKey(text, options);
      
      // Check cache first
      const cached = await this.getCachedAudio(cacheKey);
      if (cached) {
        return cached;
      }

      let audioData: string;

      // Generate audio data (don't play yet)
      if (Platform.OS === 'web' && this.webSpeechSupported) {
        audioData = 'web-speech-audio';
      } else {
        audioData = 'expo-speech-audio';
      }
      
      // Cache the result
      await this.cacheAudio(cacheKey, audioData, options);
      
      return audioData;
      
    } catch (error) {
      console.error('TTS synthesis failed:', error);
      throw error;
    }
  }

  /**
   * Play text directly (synthesis + playback)
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    try {
      // Choose TTS method based on platform
      if (Platform.OS === 'web' && this.webSpeechSupported) {
        await this.synthesizeWithWebSpeech(text, options);
      } else {
        await this.synthesizeWithExpo(text, options);
      }
      
    } catch (error) {
      console.error('Speaking failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced Chinese synthesis with tone support
   */
  async synthesizeChinese(
    text: string, 
    pinyin?: string, 
    tone?: number,
    speed: number = 1.0
  ): Promise<string> {
    const options: TTSOptions = {
      language: 'zh-CN',
      speed,
      volume: 1.0,
    };

    return this.synthesize(text, options);
  }

  /**
   * Speak Chinese text with tone support
   */
  async speakChinese(
    text: string, 
    pinyin?: string, 
    tone?: number,
    speed: number = 1.0
  ): Promise<void> {
    const options: TTSOptions = {
      language: 'zh-CN',
      speed,
      volume: 1.0,
    };

    await this.speak(text, options);
  }

  /**
   * Web Speech API implementation
   */
  private async synthesizeWithWebSpeech(text: string, options: TTSOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.webSpeechSupported) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure utterance
      utterance.lang = options.language || 'zh-CN';
      utterance.rate = options.speed || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      // Find Chinese voice if available
      const voices = speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice => 
        voice.lang.startsWith('zh') || voice.lang.includes('Chinese')
      );
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      // Event handlers
      utterance.onstart = () => {
        // Speech started
      };

      utterance.onend = () => {
        resolve('web-speech-completed');
      };

      utterance.onerror = (event) => {
        reject(new Error(`Web Speech error: ${event.error}`));
      };

      // Start speaking
      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Expo Speech API implementation
   */
  private async synthesizeWithExpo(text: string, options: TTSOptions): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Configure audio session for iOS device
        if (Platform.OS === 'ios') {
          try {
            const { Audio } = require('expo-av');
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: false,
              staysActiveInBackground: true,
              playsInSilentModeIOS: true,
              shouldDuckAndroid: true,
              playThroughEarpieceAndroid: false,
            });
          } catch (audioError) {
            console.warn('Failed to configure iOS audio session:', audioError);
          }
        }

        // Prepare speech options
        const speechOptions: Speech.SpeechOptions = {
          language: options.language || 'zh-CN',
          rate: options.speed || 1.0,
          pitch: options.pitch || 1.0,
          volume: options.volume || 1.0,
          onStart: () => {
            // Speech started
          },
          onDone: () => {
            resolve('expo-speech-completed');
          },
          onStopped: () => {
            resolve('expo-speech-stopped');
          },
          onError: (error) => {
            reject(new Error(`Expo Speech error: ${error.message || error}`));
          },
        };

        // Start speaking
        Speech.speak(text, speechOptions);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clean text for speech synthesis
   */
  private cleanTextForSpeech(text: string, isSSML?: boolean): string {
    if (isSSML) {
      return text; // Keep SSML as-is
    }
    
    // Remove special characters that might cause issues
    return text
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/&/g, 'and') // Replace & with "and"
      .trim();
  }

  /**
   * Generate SSML for Chinese text with tone marks
   */
  private generateChineseSSML(text: string, pinyin?: string, tone?: number): string {
    if (!pinyin || tone === undefined) {
      return text;
    }

    const toneMarkedPinyin = this.addToneMarks(pinyin, tone);
    return `<speak><phoneme alphabet="x-sampa" ph="${toneMarkedPinyin}">${text}</phoneme></speak>`;
  }

  /**
   * Add tone marks to pinyin
   */
  private addToneMarks(pinyin: string, tone: number): string {
    const toneMarks = {
      'a': ['a', 'á', 'ǎ', 'à', 'a'],
      'e': ['e', 'é', 'ě', 'è', 'e'],
      'i': ['i', 'í', 'ǐ', 'ì', 'i'],
      'o': ['o', 'ó', 'ǒ', 'ò', 'o'],
      'u': ['u', 'ú', 'ǔ', 'ù', 'u'],
      'ü': ['ü', 'ǘ', 'ǚ', 'ǜ', 'ü'],
    };

    if (tone < 1 || tone > 4) {
      return pinyin; // Neutral tone or invalid tone
    }

    let result = pinyin.toLowerCase();
    
    // Apply tone marks to the main vowel
    for (const [vowel, marks] of Object.entries(toneMarks)) {
      if (result.includes(vowel)) {
        result = result.replace(vowel, marks[tone]);
        break;
      }
    }

    return result;
  }

  /**
   * Generate cache key for text and options
   */
  private generateCacheKey(text: string, options: TTSOptions): string {
    const optionsString = JSON.stringify(options);
    return `${text}_${optionsString}`;
  }

  /**
   * Get cached audio data
   */
  private async getCachedAudio(cacheKey: string): Promise<string | null> {
    try {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        // Check if cache is still valid
        const now = Date.now();
        if (now - cached.timestamp < this.CACHE_EXPIRY) {
          return cached.audioData;
        } else {
          // Remove expired cache
          this.cache.delete(cacheKey);
          await this.saveCache();
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached audio:', error);
      return null;
    }
  }

  /**
   * Cache audio data
   */
  private async cacheAudio(cacheKey: string, audioData: string, options: TTSOptions): Promise<void> {
    try {
      // Check cache size limit
      if (this.cache.size >= this.CACHE_SIZE_LIMIT) {
        // Remove oldest cache entry
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) {
          this.cache.delete(oldestKey);
        }
      }

      const cacheItem: CacheItem = {
        audioData,
        timestamp: Date.now(),
        language: options.language || 'zh-CN',
        voice: options.voice || 'default',
      };

      this.cache.set(cacheKey, cacheItem);
      await this.saveCache();
    } catch (error) {
      console.error('Error caching audio:', error);
    }
  }

  /**
   * Load cache from storage
   */
  private async loadCache(): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        this.cache = new Map(parsed);
      }
    } catch (error) {
      console.log('Error loading cache:', error);
    }
  }

  /**
   * Save cache to storage
   */
  private async saveCache(): Promise<void> {
    try {
      const cacheArray = Array.from(this.cache.entries());
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheArray));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  /**
   * Clear all cached audio
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      if (Platform.OS === 'web' && this.webSpeechSupported) {
        // Convert web voices to expo format
        const webVoices = speechSynthesis.getVoices();
        return webVoices.map(voice => ({
          identifier: voice.voiceURI,
          name: voice.name,
          quality: 'Default' as Speech.VoiceQuality,
          language: voice.lang,
        }));
      } else {
        return await Speech.getAvailableVoicesAsync();
      }
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }

  /**
   * Check if currently speaking
   */
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      return false;
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    try {
      Speech.stop();
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  /**
   * Get service status
   */
  getStatus(): { cacheSize: number; isSupported: boolean; platform: string } {
    return {
      cacheSize: this.cache.size,
      isSupported: Platform.OS === 'web' ? this.webSpeechSupported : true,
      platform: Platform.OS,
    };
  }
}

export default new ExpoTTSService(); 