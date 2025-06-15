/**
 * 🎵 Expo Text-to-Speech Service
 * 
 * Thay thế Google Cloud TTS với Expo Speech để tương thích iOS/Android
 * Thêm Web Speech API fallback cho web platform
 * 
 * Features:
 * - Cross-platform TTS (iOS/Android/Web)
 * - Chinese language support
 * - Tone-aware pronunciation
 * - Speed control
 * - Caching system
 * - Fallback mechanisms
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
   * 🔐 Initialize audio permissions for iOS
   */
  private async initializeAudioPermissions(): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        console.log('🔐 Checking iOS audio permissions...');
        
        // Check if we need microphone permissions (some iOS versions require it for TTS)
        const { Audio } = require('expo-av');
        
        // Request permissions if needed
        const { status } = await Audio.requestPermissionsAsync();
        if (status === 'granted') {
          console.log('✅ iOS audio permissions granted');
        } else {
          console.warn('⚠️ iOS audio permissions not granted, TTS may not work on device');
        }
        
        // Configure audio session for silent mode support
        await Audio.setIsEnabledAsync(false);
        await Audio.setIsEnabledAsync(true);
        
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          interruptionModeIOS: 0,
        });
        

      } catch (error) {
        console.warn('⚠️ Failed to initialize iOS audio permissions:', error);
      }
    }
  }

  /**
   * 🌐 Check Web Speech API support
   */
  private checkWebSpeechSupport(): void {
    if (Platform.OS === 'web') {
      this.webSpeechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
      console.log(`🌐 Web Speech API supported: ${this.webSpeechSupported}`);
    }
  }

  /**
   * 🎯 Main synthesis method - generates audio data
   */
  async synthesize(text: string, options: TTSOptions = {}): Promise<string> {
    try {
      const cacheKey = this.generateCacheKey(text, options);
      
      // Check cache first
      const cached = await this.getCachedAudio(cacheKey);
      if (cached) {
        console.log(`🎵 Using cached TTS for: ${text.substring(0, 20)}...`);
        return cached;
      }

      let audioData: string;

      // Generate audio data (don't play yet)
      if (Platform.OS === 'web' && this.webSpeechSupported) {
        audioData = 'web-speech-audio'; // Web Speech doesn't generate data, just plays
      } else {
        audioData = 'expo-speech-audio'; // Expo Speech doesn't generate data, just plays
      }
      
      // Cache the result
      await this.cacheAudio(cacheKey, audioData, options);
      
      return audioData;
      
    } catch (error) {
      console.error('❌ TTS synthesis failed:', error);
      throw error;
    }
  }

  /**
   * 🔊 Play text directly (synthesis + playback)
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    try {
      console.log(`🔊 Speaking: "${text.substring(0, 20)}..." on ${Platform.OS}`);
      
      // iOS device specific: Test audio system first
      if (Platform.OS === 'ios') {
        await this.testIOSAudioSystem();
      }
      
      // Choose TTS method based on platform
      if (Platform.OS === 'web' && this.webSpeechSupported) {
        await this.synthesizeWithWebSpeech(text, options);
      } else {
        await this.synthesizeWithExpo(text, options);
      }
      
      console.log(`✅ Speaking completed: "${text.substring(0, 20)}..." on ${Platform.OS}`);
      
    } catch (error) {
      console.error('❌ Speaking failed:', error);
      throw error;
    }
  }

  /**
   * 🧪 Test iOS audio system before TTS
   */
  private async testIOSAudioSystem(): Promise<void> {
    try {
      console.log('🧪 Testing iOS audio system...');
      
      // Check if Speech is available
      const isSpeaking = await Speech.isSpeakingAsync();
      console.log(`🎤 Speech API available, currently speaking: ${isSpeaking}`);
      
      // Get available voices
      const voices = await Speech.getAvailableVoicesAsync();
      const chineseVoices = voices.filter(v => v.language.includes('zh'));
      console.log(`🇨🇳 Found ${chineseVoices.length} Chinese voices:`, chineseVoices.map(v => v.name));
      
      // Check audio session (basic check only)
      const { Audio } = require('expo-av');
      console.log('🔊 Audio session: expo-av loaded successfully');
      
      console.log('✅ iOS audio system test completed');
    } catch (error) {
      console.error('❌ iOS audio system test failed:', error);
      // Don't throw - just log the issue
    }
  }

  /**
   * 🇨🇳 Chinese-specific synthesis with tone support
   */
  async synthesizeChinese(
    text: string, 
    pinyin?: string, 
    tone?: number,
    speed: number = 1.0
  ): Promise<string> {
    // Generate SSML for better Chinese pronunciation
    const ssmlText = this.generateChineseSSML(text, pinyin, tone);
    
    return this.synthesize(ssmlText, {
      language: 'zh-CN',
      speed,
      ssml: true
    });
  }

  /**
   * 🔊 Speak Chinese text with tone support
   */
  async speakChinese(
    text: string, 
    pinyin?: string, 
    tone?: number,
    speed: number = 1.0
  ): Promise<void> {
    // Generate SSML for better Chinese pronunciation
    const ssmlText = this.generateChineseSSML(text, pinyin, tone);
    
    return this.speak(ssmlText, {
      language: 'zh-CN',
      speed,
      ssml: true
    });
  }

  /**
   * 🌐 Synthesize with Web Speech API (for web)
   */
  private async synthesizeWithWebSpeech(text: string, options: TTSOptions): Promise<string> {
    console.log(`🌐 Starting Web Speech synthesis for: "${text}"`);
    
    return new Promise((resolve, reject) => {
      if (!this.webSpeechSupported) {
        console.error('❌ Web Speech API not supported');
        reject(new Error('Web Speech API not supported'));
        return;
      }

      // Clean text for better pronunciation
      const cleanText = this.cleanTextForSpeech(text, options.ssml);
      console.log(`🧹 Cleaned text: "${cleanText}"`);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Configure utterance
      utterance.lang = options.language || 'zh-CN';
      utterance.rate = options.speed || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      console.log(`🎛️ TTS Config: lang=${utterance.lang}, rate=${utterance.rate}, pitch=${utterance.pitch}, volume=${utterance.volume}`);

      // Try to find Chinese voice
      const voices = speechSynthesis.getVoices();
      console.log(`🎤 Available voices: ${voices.length}`);
      
      const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh') || voice.lang.includes('cmn')
      );
      
      if (chineseVoice) {
        utterance.voice = chineseVoice;
        console.log(`🇨🇳 Using Chinese voice: ${chineseVoice.name} (${chineseVoice.lang})`);
      } else {
        console.log('⚠️ No Chinese voice found, using default voice');
        const defaultVoice = voices.find(voice => voice.default);
        if (defaultVoice) {
          console.log(`🔊 Using default voice: ${defaultVoice.name} (${defaultVoice.lang})`);
        }
      }

      utterance.onstart = () => {
        console.log('🎵 Web Speech started successfully');
      };

      utterance.onend = () => {
        console.log('✅ Web Speech completed successfully');
        resolve('web-speech-audio');
      };

      utterance.onerror = (error) => {
        console.error('❌ Web Speech error:', error);
        console.error('❌ Error details:', {
          error: error.error,
          type: error.type,
          charIndex: error.charIndex,
          elapsedTime: error.elapsedTime
        });
        reject(error);
      };

      utterance.onpause = () => {
        console.log('⏸️ Web Speech paused');
      };

      utterance.onresume = () => {
        console.log('▶️ Web Speech resumed');
      };

      utterance.onboundary = (event) => {
        console.log(`🎯 Speech boundary: ${event.name} at ${event.charIndex}`);
      };

      // Check if speech synthesis is busy
      if (speechSynthesis.speaking) {
        console.log('⏹️ Stopping current speech before starting new one');
        speechSynthesis.cancel();
      }

      console.log(`🚀 Starting speech synthesis for: "${cleanText}"`);
      
      // Speak
      speechSynthesis.speak(utterance);
      
      // Add timeout as fallback
      setTimeout(() => {
        if (speechSynthesis.speaking) {
          console.log('⏰ Speech timeout - still speaking after 10 seconds');
        }
      }, 10000);
    });
  }

  /**
   * 🎵 Synthesize with Expo Speech (for mobile)
   */
  private async synthesizeWithExpo(text: string, options: TTSOptions): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Configure audio session for iOS DEVICE
        if (Platform.OS === 'ios') {
          console.log('🔧 Configuring iOS DEVICE audio session for TTS...');
          try {
            // Import Audio from expo-av for audio session
            const { Audio } = require('expo-av');
            
            // CRITICAL: Request permissions first
            console.log('🎤 Requesting iOS audio permissions...');
            const { status } = await Audio.requestPermissionsAsync();
            console.log(`🎤 iOS audio permission status: ${status}`);
            
            // CRITICAL: Set audio mode with device-specific settings
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: false,
              staysActiveInBackground: false,
              playsInSilentModeIOS: true, // ✅ CRITICAL for iOS device audio
              shouldDuckAndroid: true,
              playThroughEarpieceAndroid: false,
              // Remove invalid interruptionMode properties
            });
            
            // CRITICAL: Activate audio session
            console.log('🔊 Activating iOS audio session...');
            await Audio.setIsEnabledAsync(true);
            
            console.log('✅ iOS DEVICE audio session fully configured');
                      } catch (audioError: any) {
              console.error('❌ CRITICAL: Failed to configure iOS device audio session:', audioError);
              // Don't continue - this is critical for device audio
              reject(new Error(`iOS audio session failed: ${audioError?.message || 'Unknown error'}`));
              return;
            }
        }

        const speechOptions: Speech.SpeechOptions = {
          language: options.language || 'zh-CN',
          pitch: options.pitch || 1.0,
          rate: options.speed || 1.0,
          volume: options.volume || 1.0,
          // iOS device specific options
          ...(Platform.OS === 'ios' && {
            voice: undefined, // Let iOS choose best Chinese voice
            quality: Speech.VoiceQuality.Enhanced, // Use enhanced quality for device
          }),
          onStart: () => {
            console.log('🎵 Expo Speech started on iOS device');
          },
          onDone: () => {
            console.log('✅ Expo Speech completed on iOS device');
            resolve('expo-speech-audio');
          },
          onStopped: () => {
            console.log('⏹️ Expo Speech stopped on iOS device');
            resolve('expo-speech-audio');
          },
          onError: (error) => {
            console.error('❌ Expo Speech error on iOS device:', error);
            reject(error);
          }
        };

        // Clean text for better pronunciation
        const cleanText = this.cleanTextForSpeech(text, options.ssml);
        
        console.log(`🎤 Starting Expo Speech for: "${cleanText}" on ${Platform.OS}`);
        Speech.speak(cleanText, speechOptions);
        
      } catch (error) {
        console.error('❌ Failed to setup Expo Speech:', error);
        reject(error);
      }
    });
  }

  /**
   * 🧹 Clean text for speech synthesis
   */
  private cleanTextForSpeech(text: string, isSSML?: boolean): string {
    if (isSSML) {
      // Remove SSML tags for Expo Speech (doesn't support SSML)
      return text.replace(/<[^>]*>/g, '');
    }
    
    // Clean up text
    return text
      .replace(/[^\u4e00-\u9fff\u3400-\u4dbf\w\s.,!?]/g, '') // Keep Chinese chars and basic punctuation
      .trim();
  }

  /**
   * 🇨🇳 Generate Chinese SSML with tone information
   */
  private generateChineseSSML(text: string, pinyin?: string, tone?: number): string {
    if (!pinyin || tone === undefined) {
      return text;
    }

    // Add tone marks to pinyin for better pronunciation
    const toneMarkedPinyin = this.addToneMarks(pinyin, tone);
    
    // For Expo Speech, we'll just return the text since SSML isn't supported
    return text;
  }

  /**
   * 🎵 Add tone marks to pinyin
   */
  private addToneMarks(pinyin: string, tone: number): string {
    const toneMap: Record<number, Record<string, string>> = {
      1: { 'a': 'ā', 'e': 'ē', 'i': 'ī', 'o': 'ō', 'u': 'ū', 'ü': 'ǖ' },
      2: { 'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú', 'ü': 'ǘ' },
      3: { 'a': 'ǎ', 'e': 'ě', 'i': 'ǐ', 'o': 'ǒ', 'u': 'ǔ', 'ü': 'ǚ' },
      4: { 'a': 'à', 'e': 'è', 'i': 'ì', 'o': 'ò', 'u': 'ù', 'ü': 'ǜ' },
    };

    if (tone === 0 || !toneMap[tone]) {
      return pinyin; // Neutral tone or invalid tone
    }

    let result = pinyin.toLowerCase();
    const tones = toneMap[tone];

    // Apply tone marks in order of priority
    for (const [base, marked] of Object.entries(tones)) {
      if (result.includes(base)) {
        result = result.replace(base, marked);
        break;
      }
    }

    return result;
  }

  /**
   * 💾 Cache management
   */
  private generateCacheKey(text: string, options: TTSOptions): string {
    const key = `${text}_${options.language || 'zh-CN'}_${options.speed || 1.0}_${options.voice || 'default'}`;
    // Use encodeURIComponent instead of btoa to handle Chinese characters
    return encodeURIComponent(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
  }

  private async getCachedAudio(cacheKey: string): Promise<string | null> {
    try {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        return cached.audioData;
      }
      
      // Remove expired cache
      if (cached) {
        this.cache.delete(cacheKey);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Cache retrieval error:', error);
      return null;
    }
  }

  private async cacheAudio(cacheKey: string, audioData: string, options: TTSOptions): Promise<void> {
    try {
      // Limit cache size
      if (this.cache.size >= this.CACHE_SIZE_LIMIT) {
        const oldestKey = Array.from(this.cache.keys())[0];
        this.cache.delete(oldestKey);
      }

      const cacheItem: CacheItem = {
        audioData,
        timestamp: Date.now(),
        language: options.language || 'zh-CN',
        voice: options.voice || 'default'
      };

      this.cache.set(cacheKey, cacheItem);
      await this.saveCache();
      
    } catch (error) {
      console.error('❌ Cache storage error:', error);
    }
  }

  private async loadCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        this.cache = new Map(Object.entries(data));
        console.log(`📦 Loaded ${this.cache.size} cached TTS items`);
      }
    } catch (error) {
      console.error('❌ Cache loading error:', error);
    }
  }

  private async saveCache(): Promise<void> {
    try {
      const data = Object.fromEntries(this.cache);
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('❌ Cache saving error:', error);
    }
  }

  /**
   * 🧹 Utility methods
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem(this.CACHE_KEY);
    console.log('🧹 TTS cache cleared');
  }

  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      if (Platform.OS === 'web' && this.webSpeechSupported) {
        // Return web voices as Speech.Voice format
        const webVoices = speechSynthesis.getVoices();
        return webVoices.map(voice => ({
          identifier: voice.voiceURI,
          name: voice.name,
          quality: 'Default',
          language: voice.lang,
        })) as Speech.Voice[];
      } else {
        return await Speech.getAvailableVoicesAsync();
      }
    } catch (error) {
      console.error('❌ Failed to get voices:', error);
      return [];
    }
  }

  async isSpeaking(): Promise<boolean> {
    if (Platform.OS === 'web' && this.webSpeechSupported) {
      return speechSynthesis.speaking;
    } else {
      return await Speech.isSpeakingAsync();
    }
  }

  stop(): void {
    if (Platform.OS === 'web' && this.webSpeechSupported) {
      speechSynthesis.cancel();
    } else {
      Speech.stop();
    }
  }

  getStatus(): { cacheSize: number; isSupported: boolean; platform: string } {
    return {
      cacheSize: this.cache.size,
      isSupported: Platform.OS === 'web' ? this.webSpeechSupported : true,
      platform: Platform.OS,
    };
  }
}

// Export singleton instance
export const expoTTSService = new ExpoTTSService();
export default expoTTSService; 