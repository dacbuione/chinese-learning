// Note: expo-speech-recognition is not available yet, using mock interface
interface SpeechRecognition {
  isAvailableAsync?: () => Promise<boolean>;
  stopAsync?: () => Promise<void>;
}

const Speech: SpeechRecognition = {};
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface STTOptions {
  language?: string;
  continuous?: boolean;
  partialResults?: boolean;
  timeout?: number; // in milliseconds
  maxAlternatives?: number;
}

export interface STTResult {
  transcript: string;
  confidence: number;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
  isFinal: boolean;
}

export interface PronunciationAnalysis {
  accuracy: number; // 0-100
  toneAccuracy: number;
  syllableBreakdown: Array<{
    syllable: string;
    expected: string;
    accuracy: number;
    toneCorrect: boolean;
    feedback: string;
  }>;
  overallFeedback: string;
  suggestions: string[];
}

export interface ChineseSTTConfig {
  defaultLanguage: string;
  enablePronunciationFeedback: boolean;
  enableToneAnalysis: boolean;
  confidenceThreshold: number;
  maxRecordingTime: number; // seconds
  enableOfflineMode: boolean;
}

class ChineseSTTService {
  private isInitialized = false;
  private isRecording = false;
  private isListening = false;
  private recordingUri: string | null = null;
  private config: ChineseSTTConfig;
  private audioPermission = false;

  constructor() {
    this.config = {
      defaultLanguage: 'zh-CN',
      enablePronunciationFeedback: true,
      enableToneAnalysis: true,
      confidenceThreshold: 0.6,
      maxRecordingTime: 30,
      enableOfflineMode: false,
    };
  }

  async initialize(): Promise<void> {
    try {
      console.log('🎤 Initializing Chinese STT Service...');
      
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      this.audioPermission = status === 'granted';
      
      if (!this.audioPermission) {
        throw new Error('Audio permission not granted');
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Check STT availability
      if (Speech.isAvailableAsync) {
        const available = await Speech.isAvailableAsync();
        if (!available) {
          console.warn('⚠️ Speech recognition not available on this device');
        }
      }

      // Load saved preferences
      await this.loadPreferences();
      
      this.isInitialized = true;
      console.log('✅ STT initialized successfully');
    } catch (error) {
      console.error('❌ STT initialization failed:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Start listening for Chinese speech
   */
  async startListening(
    options: STTOptions = {},
    onResult?: (result: STTResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioPermission) {
      throw new Error('Audio permission required');
    }

    try {
      const sttOptions = {
        language: options.language || this.config.defaultLanguage,
        continuous: options.continuous ?? true,
        partialResults: options.partialResults ?? true,
        timeout: options.timeout || (this.config.maxRecordingTime * 1000),
        maxAlternatives: options.maxAlternatives || 3,
      };

      console.log(`🎤 Starting STT with options:`, sttOptions);

      this.isListening = true;

      // Mock implementation - replace with actual expo-speech-recognition when available
      await this.mockSTTListening(sttOptions, onResult, onError);

    } catch (error) {
      console.error('STT error:', error);
      this.isListening = false;
      onError?.(error instanceof Error ? error.message : 'STT failed');
    }
  }

  /**
   * Stop listening
   */
  async stopListening(): Promise<void> {
    try {
      this.isListening = false;
      console.log('🛑 STT stopped');
      
      // Stop any ongoing recognition
      if (Speech.stopAsync) {
        await Speech.stopAsync();
      }
    } catch (error) {
      console.error('Error stopping STT:', error);
    }
  }

  /**
   * Record and analyze pronunciation
   */
  async recordAndAnalyzePronunciation(
    targetText: string,
    targetPinyin: string,
    maxDuration = 10
  ): Promise<PronunciationAnalysis> {
    try {
      console.log(`🎯 Analyzing pronunciation for: "${targetText}"`);

      // Start recording
      const recordingResult = await this.startRecording(maxDuration);
      
      if (!recordingResult.success) {
        throw new Error(recordingResult.error || 'Recording failed');
      }

      // Analyze the recording
      const analysis = await this.analyzePronunciation(
        recordingResult.uri!,
        targetText,
        targetPinyin
      );

      return analysis;
    } catch (error) {
      console.error('Pronunciation analysis error:', error);
      return {
        accuracy: 0,
        toneAccuracy: 0,
        syllableBreakdown: [],
        overallFeedback: 'Không thể phân tích phát âm. Vui lòng thử lại.',
        suggestions: ['Hãy đảm bảo microphone hoạt động tốt', 'Nói rõ ràng và chậm rãi']
      };
    }
  }

  /**
   * Practice session with real-time feedback
   */
  async startPracticeSession(
    vocabulary: Array<{ hanzi: string; pinyin: string; meaning: string }>,
    onProgress: (progress: number) => void,
    onWordResult: (result: { word: string; analysis: PronunciationAnalysis }) => void
  ): Promise<void> {
    try {
      console.log(`🎓 Starting practice session with ${vocabulary.length} words`);

      for (let i = 0; i < vocabulary.length; i++) {
        const word = vocabulary[i];
        
        onProgress((i / vocabulary.length) * 100);

        // Prompt user to pronounce the word
        console.log(`📢 Practice word: ${word.hanzi} (${word.pinyin})`);

        // Wait for pronunciation
        const analysis = await this.recordAndAnalyzePronunciation(
          word.hanzi,
          word.pinyin,
          5 // 5 seconds max per word
        );

        onWordResult({
          word: word.hanzi,
          analysis
        });

        // Brief pause between words
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      onProgress(100);
      console.log('✅ Practice session completed');
    } catch (error) {
      console.error('Practice session error:', error);
      throw error;
    }
  }

  /**
   * Tone recognition practice
   */
  async practiceTones(
    syllables: Array<{ syllable: string; expectedTone: number }>,
    onToneResult: (result: { syllable: string; detectedTone: number; correct: boolean }) => void
  ): Promise<void> {
    try {
      console.log(`🔊 Starting tone practice with ${syllables.length} syllables`);

      for (const item of syllables) {
        console.log(`🎵 Practice tone for: ${item.syllable} (tone ${item.expectedTone})`);

        // Record and analyze tone
        const recordingResult = await this.startRecording(3);
        
        if (recordingResult.success) {
          const detectedTone = await this.detectTone(recordingResult.uri!, item.syllable);
          const correct = detectedTone === item.expectedTone;

          onToneResult({
            syllable: item.syllable,
            detectedTone,
            correct
          });
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('✅ Tone practice completed');
    } catch (error) {
      console.error('Tone practice error:', error);
      throw error;
    }
  }

  /**
   * Conversation practice with STT
   */
  async startConversationPractice(
    expectedSentences: string[],
    onSentenceRecognized: (recognized: string, expected: string, match: boolean) => void
  ): Promise<void> {
    try {
      console.log(`💬 Starting conversation practice`);

      for (const expected of expectedSentences) {
        console.log(`🗣️ Say: "${expected}"`);

        const result = await new Promise<STTResult>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for speech'));
          }, 10000);

          this.startListening(
            { continuous: false, timeout: 8000 },
            (sttResult) => {
              clearTimeout(timeout);
              resolve(sttResult);
            },
            (error) => {
              clearTimeout(timeout);
              reject(new Error(error));
            }
          );
        });

        const match = this.compareSentences(result.transcript, expected);
        onSentenceRecognized(result.transcript, expected, match);

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('✅ Conversation practice completed');
    } catch (error) {
      console.error('Conversation practice error:', error);
      throw error;
    }
  }

  /**
   * Update STT settings
   */
  async updateSettings(settings: Partial<ChineseSTTConfig>): Promise<void> {
    this.config = { ...this.config, ...settings };
    await this.savePreferences();
  }

  /**
   * Get current STT status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isListening: this.isListening,
      isRecording: this.isRecording,
      hasPermission: this.audioPermission,
    };
  }

  // Private helper methods
  private async startRecording(maxDuration: number): Promise<{ success: boolean; uri?: string; error?: string }> {
    try {
      this.isRecording = true;
      
      // Mock recording for now - replace with actual Audio.Recording
      await new Promise(resolve => setTimeout(resolve, maxDuration * 1000));
      
      this.isRecording = false;
      
      // Return mock URI
      const mockUri = `mock_recording_${Date.now()}.m4a`;
      this.recordingUri = mockUri;
      
      return { success: true, uri: mockUri };
    } catch (error) {
      this.isRecording = false;
      return { success: false, error: error instanceof Error ? error.message : 'Recording failed' };
    }
  }

  private async mockSTTListening(
    options: any,
    onResult?: (result: STTResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    // Mock STT implementation for demonstration
    console.log('🔧 Using mock STT service');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock Chinese responses
    const mockChinese = ['你好', '我很好', '谢谢', '再见', '对不起'];
    const randomResult = mockChinese[Math.floor(Math.random() * mockChinese.length)];
    
    const mockResult: STTResult = {
      transcript: randomResult,
      confidence: 0.85,
      alternatives: [
        { transcript: randomResult, confidence: 0.85 },
        { transcript: '你好吗', confidence: 0.72 }
      ],
      isFinal: true
    };
    
    onResult?.(mockResult);
  }

  private async analyzePronunciation(
    audioUri: string,
    targetText: string,
    targetPinyin: string
  ): Promise<PronunciationAnalysis> {
    // Mock pronunciation analysis
    console.log(`🔍 Analyzing pronunciation: ${audioUri} -> ${targetText}`);
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockAccuracy = Math.random() * 40 + 60; // 60-100% accuracy
    const mockToneAccuracy = Math.random() * 30 + 70; // 70-100% tone accuracy
    
    return {
      accuracy: Math.round(mockAccuracy),
      toneAccuracy: Math.round(mockToneAccuracy),
      syllableBreakdown: [
        {
          syllable: targetText.charAt(0),
          expected: targetPinyin.split(' ')[0] || targetPinyin,
          accuracy: Math.round(mockAccuracy),
          toneCorrect: mockToneAccuracy > 80,
          feedback: mockToneAccuracy > 80 ? 'Tốt!' : 'Cần cải thiện thanh điệu'
        }
      ],
      overallFeedback: mockAccuracy > 85 ? 'Phát âm rất tốt!' : 
                       mockAccuracy > 70 ? 'Khá tốt, có thể cải thiện thêm' : 
                       'Cần luyện tập thêm',
      suggestions: mockAccuracy < 80 ? [
        'Nói chậm rãi hơn',
        'Chú ý đến thanh điệu',
        'Luyện tập phát âm từng âm tiết'
      ] : ['Tiếp tục luyện tập để duy trì!']
    };
  }

  private async detectTone(audioUri: string, syllable: string): Promise<number> {
    // Mock tone detection
    console.log(`🎵 Detecting tone for: ${syllable}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return random tone 1-4
    return Math.floor(Math.random() * 4) + 1;
  }

  private compareSentences(recognized: string, expected: string): boolean {
    // Simple comparison - could be enhanced with fuzzy matching
    const normalizeText = (text: string) => text.toLowerCase().replace(/[^\w\u4e00-\u9fff]/g, '');
    
    return normalizeText(recognized) === normalizeText(expected);
  }

  private async loadPreferences(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('stt_preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.config = { ...this.config, ...preferences };
      }
    } catch (error) {
      console.error('Error loading STT preferences:', error);
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem('stt_preferences', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving STT preferences:', error);
    }
  }
}

// Export singleton instance
export const chineseSTT = new ChineseSTTService();
export default chineseSTT; 