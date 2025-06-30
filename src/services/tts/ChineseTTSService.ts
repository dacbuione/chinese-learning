import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TTSVoice {
  identifier: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  quality: 'enhanced' | 'standard';
}

export interface TTSOptions {
  voice?: string;
  rate?: number; // 0.1 to 2.0
  pitch?: number; // 0.5 to 2.0  
  volume?: number; // 0.0 to 1.0
  language?: string;
}

export interface ChineseTTSConfig {
  defaultVoice: string;
  defaultRate: number;
  defaultPitch: number;
  defaultVolume: number;
  enableQueue: boolean;
  enableCache: boolean;
}

class ChineseTTSService {
  private isInitialized = false;
  private availableVoices: TTSVoice[] = [];
  private config: ChineseTTSConfig;
  private speechQueue: Array<{ text: string; options: TTSOptions }> = [];
  private isPlaying = false;
  private audioCache = new Map<string, string>();

  constructor() {
    this.config = {
      defaultVoice: Platform.select({
        ios: 'com.apple.ttsbundle.Ting-Ting-compact', // Chinese (Taiwan)
        android: 'cmn-cn-x-ccc-network', // Chinese (Mainland)
        default: 'zh-CN'
      }),
      defaultRate: 0.8, // Slower for language learning
      defaultPitch: 1.0,
      defaultVolume: 1.0,
      enableQueue: true,
      enableCache: true,
    };
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔊 Initializing Chinese TTS Service...');
      
      // Get available voices
      if (Speech.getAvailableVoicesAsync) {
        const voices = await Speech.getAvailableVoicesAsync();
        this.availableVoices = voices
          .filter(voice => voice.language.includes('zh') || voice.language.includes('cmn'))
          .map(voice => ({
            identifier: voice.identifier,
            name: voice.name,
            language: voice.language,
            gender: this.detectGender(voice.name),
            quality: (voice.quality === Speech.VoiceQuality.Enhanced) ? 'enhanced' : 'standard'
          }));
      }

      // Load saved preferences
      await this.loadPreferences();
      
      this.isInitialized = true;
      console.log(`✅ TTS initialized with ${this.availableVoices.length} Chinese voices`);
    } catch (error) {
      console.error('❌ TTS initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Speak Chinese text with tone-aware pronunciation
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const ttsOptions: Speech.SpeechOptions = {
      language: options.language || 'zh-CN',
      voice: options.voice || this.config.defaultVoice,
      rate: options.rate || this.config.defaultRate,
      pitch: options.pitch || this.config.defaultPitch,
      volume: options.volume || this.config.defaultVolume,
    };

    // Pre-process Chinese text for better pronunciation
    const processedText = this.preprocessChineseText(text);

    try {
      if (this.config.enableQueue && this.isPlaying) {
        this.speechQueue.push({ text: processedText, options: ttsOptions });
        return;
      }

      this.isPlaying = true;
      console.log(`🗣️ Speaking: "${processedText}" with voice: ${ttsOptions.voice}`);

      await Speech.speak(processedText, {
        ...ttsOptions,
        onDone: () => {
          this.isPlaying = false;
          this.processQueue();
        },
        onError: (error) => {
          console.error('TTS Error:', error);
          this.isPlaying = false;
          this.processQueue();
        }
      });
    } catch (error) {
      console.error('Speech error:', error);
      this.isPlaying = false;
    }
  }

  /**
   * Speak pinyin with tone marks
   */
  async speakPinyin(pinyin: string, options: TTSOptions = {}): Promise<void> {
    // Convert tone marks to spoken format if needed
    const spokenPinyin = this.convertPinyinForSpeech(pinyin);
    
    await this.speak(spokenPinyin, {
      ...options,
      rate: (options.rate || this.config.defaultRate) * 0.7, // Slower for pinyin
      language: 'zh-CN'
    });
  }

  /**
   * Practice mode: speak word, pause, then translation
   */
  async practiceWord(
    hanzi: string, 
    pinyin: string, 
    translation: string,
    options: TTSOptions = {}
  ): Promise<void> {
    // Speak Chinese
    await this.speak(hanzi, options);
    
    // Pause
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Speak pinyin slower
    await this.speakPinyin(pinyin, { 
      ...options, 
      rate: (options.rate || this.config.defaultRate) * 0.6 
    });
    
    // Longer pause
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Speak Vietnamese translation
    await this.speak(translation, { 
      ...options, 
      language: 'vi-VN',
      voice: undefined // Use default Vietnamese voice
    });
  }

  /**
   * Sentence practice with word-by-word breakdown
   */
  async practiceSentence(
    sentence: string,
    breakdown: Array<{ hanzi: string; pinyin: string; meaning: string }>,
    options: TTSOptions = {}
  ): Promise<void> {
    // Speak full sentence first
    await this.speak(sentence, options);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Break down word by word
    for (const word of breakdown) {
      await this.practiceWord(word.hanzi, word.pinyin, word.meaning, options);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Speak full sentence again
    await new Promise(resolve => setTimeout(resolve, 1500));
    await this.speak(sentence, options);
  }

  /**
   * Tone practice: speak same syllable with different tones
   */
  async practiceTones(
    syllable: string, 
    tones: Array<{ tone: number; meaning: string }>
  ): Promise<void> {
    for (const { tone, meaning } of tones) {
      const toneText = this.addToneToSyllable(syllable, tone);
      
      // Speak with emphasis on tone
      await this.speak(toneText, { 
        rate: 0.6, 
        pitch: this.getTonePitch(tone) 
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Speak meaning
      await this.speak(meaning, { 
        language: 'vi-VN',
        rate: 0.8 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
  }

  /**
   * Stop current speech and clear queue
   */
  async stop(): Promise<void> {
    try {
      await Speech.stop();
      this.speechQueue = [];
      this.isPlaying = false;
      console.log('🛑 TTS stopped');
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  /**
   * Get available Chinese voices
   */
  getChineseVoices(): TTSVoice[] {
    return this.availableVoices;
  }

  /**
   * Set voice preference
   */
  async setVoice(voiceId: string): Promise<void> {
    this.config.defaultVoice = voiceId;
    await this.savePreferences();
  }

  /**
   * Update TTS settings
   */
  async updateSettings(settings: Partial<ChineseTTSConfig>): Promise<void> {
    this.config = { ...this.config, ...settings };
    await this.savePreferences();
  }

  // Private helper methods
  private preprocessChineseText(text: string): string {
    // Add spaces between Chinese characters for better pronunciation
    return text.replace(/([一-龯])/g, '$1 ').trim();
  }

  private convertPinyinForSpeech(pinyin: string): string {
    // Convert tone marks to numbers if TTS doesn't support them well
    const toneMap: Record<string, string> = {
      'ā': 'a1', 'á': 'a2', 'ǎ': 'a3', 'à': 'a4',
      'ē': 'e1', 'é': 'e2', 'ě': 'e3', 'è': 'e4',
      'ī': 'i1', 'í': 'i2', 'ǐ': 'i3', 'ì': 'i4',
      'ō': 'o1', 'ó': 'o2', 'ǒ': 'o3', 'ò': 'o4',
      'ū': 'u1', 'ú': 'u2', 'ǔ': 'u3', 'ù': 'u4',
      'ǖ': 'ü1', 'ǘ': 'ü2', 'ǚ': 'ü3', 'ǜ': 'ü4',
    };

    let result = pinyin;
    for (const [toned, numbered] of Object.entries(toneMap)) {
      result = result.replace(new RegExp(toned, 'g'), numbered);
    }
    return result;
  }

  private addToneToSyllable(syllable: string, tone: number): string {
    // Add appropriate tone mark to syllable
    const toneMarks = ['', 'ˉ', 'ˊ', 'ˇ', 'ˋ'];
    return `${syllable}${toneMarks[tone] || ''}`;
  }

  private getTonePitch(tone: number): number {
    // Adjust pitch based on Chinese tone
    const toneTonesMap: Record<number, number> = {
      1: 1.3, // High level tone
      2: 1.5, // Rising tone  
      3: 0.8, // Falling-rising tone
      4: 0.6, // Falling tone
    };
    return toneTonesMap[tone] || 1.0;
  }

  private detectGender(voiceName: string): 'male' | 'female' {
    const femaleIndicators = ['female', 'woman', 'ting', 'mei', 'li', 'hui'];
    const maleIndicators = ['male', 'man', 'wei', 'ming', 'jun', 'long'];
    
    const lowerName = voiceName.toLowerCase();
    
    if (femaleIndicators.some(indicator => lowerName.includes(indicator))) {
      return 'female';
    }
    if (maleIndicators.some(indicator => lowerName.includes(indicator))) {
      return 'male';
    }
    return 'female'; // Default to female for Chinese
  }

  private async processQueue(): Promise<void> {
    if (this.speechQueue.length > 0 && !this.isPlaying) {
      const { text, options } = this.speechQueue.shift()!;
      await this.speak(text, options);
    }
  }

  private async loadPreferences(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('tts_preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.config = { ...this.config, ...preferences };
      }
    } catch (error) {
      console.error('Error loading TTS preferences:', error);
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem('tts_preferences', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving TTS preferences:', error);
    }
  }
}

// Export singleton instance
export const chineseTTS = new ChineseTTSService();
export default chineseTTS; 