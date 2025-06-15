import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 🎵 Google Cloud Text-to-Speech Service
 * 
 * Tính năng:
 * - Synthesize text thành audio với Google Cloud TTS
 * - Hỗ trợ tiếng Trung với 4 thanh điệu
 * - Caching system để tiết kiệm API calls
 * - Fallback mechanism với Web Speech API
 * - SSML support cho điều khiển phát âm
 */

export interface TTSOptions {
  language: 'zh-CN' | 'zh-TW' | 'vi-VN' | 'en-US';
  voice?: string;
  speed?: number; // 0.25 - 4.0
  pitch?: number; // -20.0 - 20.0 (semitones)
  ssml?: boolean; // Sử dụng SSML markup
}

export interface TTSResponse {
  audioContent: string; // Base64 encoded audio
  cacheKey: string;
  source: 'google-tts' | 'web-speech' | 'cache';
}

export interface ChineseVoiceOptions {
  hanzi: string;
  pinyin: string;
  tone: number; // 1-4 hoặc 0 (neutral)
  speed?: number;
}

class GoogleTTSService {
  private client: TextToSpeechClient | null = null;
  private cache = new Map<string, string>();
  private readonly CACHE_PREFIX = 'tts_cache_';
  private readonly MAX_CACHE_SIZE = 100;

  constructor() {
    this.initializeClient();
  }

  /**
   * 🔧 Khởi tạo Google Cloud TTS Client
   */
  private async initializeClient(): Promise<void> {
    try {
      // Trong production, sử dụng service account key
      this.client = new TextToSpeechClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_CLOUD_KEYFILE_PATH,
      });

      console.log('✅ Google Cloud TTS Client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Cloud TTS Client:', error);
      this.client = null;
    }
  }

  /**
   * 🎯 Synthesize text thành audio
   */
  async synthesize(text: string, options: TTSOptions = { language: 'zh-CN' }): Promise<TTSResponse> {
    const cacheKey = this.generateCacheKey(text, options);
    
    // 1. Kiểm tra cache trước
    const cachedAudio = await this.getCachedAudio(cacheKey);
    if (cachedAudio) {
      return {
        audioContent: cachedAudio,
        cacheKey,
        source: 'cache'
      };
    }

    // 2. Thử Google Cloud TTS
    if (this.client) {
      try {
        const audioContent = await this.synthesizeWithGoogle(text, options);
        await this.setCachedAudio(cacheKey, audioContent);
        
        return {
          audioContent,
          cacheKey,
          source: 'google-tts'
        };
      } catch (error) {
        console.warn('⚠️ Google TTS failed, falling back to Web Speech:', error);
      }
    }

    // 3. Fallback: Web Speech API
    const audioContent = await this.synthesizeWithWebSpeech(text, options);
    await this.setCachedAudio(cacheKey, audioContent);

    return {
      audioContent,
      cacheKey,
      source: 'web-speech'
    };
  }

  /**
   * 🇨🇳 Synthesize tiếng Trung với thanh điệu
   */
  async synthesizeChinese(options: ChineseVoiceOptions): Promise<TTSResponse> {
    const { hanzi, pinyin, tone, speed = 1.0 } = options;
    
    // Tạo SSML với thanh điệu
    const ssmlText = this.createChineseSSML(hanzi, pinyin, tone, speed);
    
    return this.synthesize(ssmlText, {
      language: 'zh-CN',
      voice: 'zh-CN-Wavenet-A', // Giọng nữ chất lượng cao
      speed,
      ssml: true
    });
  }

  /**
   * 🎵 Google Cloud TTS synthesis
   */
  private async synthesizeWithGoogle(text: string, options: TTSOptions): Promise<string> {
    if (!this.client) {
      throw new Error('Google TTS Client not initialized');
    }

    const request = {
      input: options.ssml ? { ssml: text } : { text },
      voice: {
        languageCode: options.language,
        name: options.voice || this.getDefaultVoice(options.language),
        ssmlGender: 'FEMALE' as const,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: options.speed || 1.0,
        pitch: options.pitch || 0.0,
        volumeGainDb: 0.0,
        sampleRateHertz: 24000,
      },
    };

    const [response] = await this.client.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    return response.audioContent.toString('base64');
  }

  /**
   * 🌐 Web Speech API fallback
   */
  private async synthesizeWithWebSpeech(text: string, options: TTSOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.mapLanguageCode(options.language);
      utterance.rate = options.speed || 1.0;
      utterance.pitch = (options.pitch || 0) / 10 + 1; // Convert to 0-2 range

      // Tạo audio context để capture audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      
      utterance.onend = () => {
        // Simplified: return empty base64 for now
        // Trong thực tế, cần implement audio recording
        resolve(''); 
      };

      utterance.onerror = (error) => {
        reject(new Error(`Web Speech synthesis failed: ${error.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * 🇨🇳 Tạo SSML cho tiếng Trung với thanh điệu
   */
  private createChineseSSML(hanzi: string, pinyin: string, tone: number, speed: number): string {
    const toneMarks = {
      1: 'ā', 2: 'á', 3: 'ǎ', 4: 'à', 0: 'a'
    };

    // Thêm tone mark vào pinyin
    const tonedPinyin = this.addToneMarks(pinyin, tone);

    return `
      <speak>
        <prosody rate="${speed}" pitch="+0st">
          <phoneme alphabet="ipa" ph="${tonedPinyin}">
            ${hanzi}
          </phoneme>
        </prosody>
      </speak>
    `.trim();
  }

  /**
   * 🎯 Thêm tone marks vào pinyin
   */
  private addToneMarks(pinyin: string, tone: number): string {
    const toneMarks: { [key: number]: { [key: string]: string } } = {
      1: { 'a': 'ā', 'e': 'ē', 'i': 'ī', 'o': 'ō', 'u': 'ū', 'ü': 'ǖ' },
      2: { 'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú', 'ü': 'ǘ' },
      3: { 'a': 'ǎ', 'e': 'ě', 'i': 'ǐ', 'o': 'ǒ', 'u': 'ǔ', 'ü': 'ǚ' },
      4: { 'a': 'à', 'e': 'è', 'i': 'ì', 'o': 'ò', 'u': 'ù', 'ü': 'ǜ' },
    };

    if (tone === 0 || !toneMarks[tone]) {
      return pinyin; // Neutral tone hoặc invalid tone
    }

    // Tìm vowel chính để thêm tone mark
    const vowelOrder = ['a', 'o', 'e', 'i', 'u', 'ü'];
    
    for (const vowel of vowelOrder) {
      if (pinyin.includes(vowel)) {
        const tonedVowel = toneMarks[tone][vowel];
        if (tonedVowel) {
          return pinyin.replace(vowel, tonedVowel);
        }
      }
    }

    return pinyin;
  }

  /**
   * 🗂️ Cache management
   */
  private generateCacheKey(text: string, options: TTSOptions): string {
    const optionsStr = JSON.stringify(options);
    return `${this.CACHE_PREFIX}${btoa(text + optionsStr)}`;
  }

  private async getCachedAudio(key: string): Promise<string | null> {
    try {
      // Kiểm tra memory cache trước
      if (this.cache.has(key)) {
        return this.cache.get(key) || null;
      }

      // Kiểm tra persistent storage
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        this.cache.set(key, cached);
        return cached;
      }

      return null;
    } catch (error) {
      console.warn('Failed to get cached audio:', error);
      return null;
    }
  }

  private async setCachedAudio(key: string, audioContent: string): Promise<void> {
    try {
      // Lưu vào memory cache
      this.cache.set(key, audioContent);

      // Lưu vào persistent storage
      await AsyncStorage.setItem(key, audioContent);

      // Cleanup nếu cache quá lớn
      if (this.cache.size > this.MAX_CACHE_SIZE) {
        await this.cleanupCache();
      }
    } catch (error) {
      console.warn('Failed to cache audio:', error);
    }
  }

  private async cleanupCache(): Promise<void> {
    try {
      const keys = Array.from(this.cache.keys());
      const keysToRemove = keys.slice(0, keys.length - this.MAX_CACHE_SIZE + 10);

      for (const key of keysToRemove) {
        this.cache.delete(key);
        await AsyncStorage.removeItem(key);
      }

      console.log(`🧹 Cleaned up ${keysToRemove.length} cached audio files`);
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }

  /**
   * 🎯 Helper methods
   */
  private getDefaultVoice(language: string): string {
    const defaultVoices = {
      'zh-CN': 'zh-CN-Wavenet-A', // Giọng nữ Mandarin chất lượng cao
      'zh-TW': 'zh-TW-Wavenet-A', // Giọng nữ Traditional Chinese
      'vi-VN': 'vi-VN-Wavenet-A', // Giọng nữ Vietnamese
      'en-US': 'en-US-Wavenet-F', // Giọng nữ English
    };

    return defaultVoices[language as keyof typeof defaultVoices] || 'zh-CN-Wavenet-A';
  }

  private mapLanguageCode(language: string): string {
    const mapping = {
      'zh-CN': 'zh-CN',
      'zh-TW': 'zh-TW', 
      'vi-VN': 'vi-VN',
      'en-US': 'en-US',
    };

    return mapping[language as keyof typeof mapping] || 'zh-CN';
  }

  /**
   * 📊 Get service status
   */
  getStatus(): { googleTTS: boolean; webSpeech: boolean; cacheSize: number } {
    return {
      googleTTS: this.client !== null,
      webSpeech: 'speechSynthesis' in window,
      cacheSize: this.cache.size,
    };
  }

  /**
   * 🧹 Clear all cache
   */
  async clearCache(): Promise<void> {
    try {
      this.cache.clear();
      
      const keys = await AsyncStorage.getAllKeys();
      const ttsKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      await AsyncStorage.multiRemove(ttsKeys);
      
      console.log(`🧹 Cleared ${ttsKeys.length} cached audio files`);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const googleTTSService = new GoogleTTSService();
export default GoogleTTSService; 