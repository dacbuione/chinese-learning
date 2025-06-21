# 📱 Native Speech Recognition Implementation - iOS/Android
## React Native Chinese Learning App - MIỄN PHÍ

### 🎯 **FOCUS: NATIVE APPS CHO iOS VÀ ANDROID**

Triển khai hoàn toàn **native speech recognition** chạy trực tiếp trên thiết bị, không cần web browser.

---

## 🚀 **PHASE 1: REACT NATIVE VOICE SETUP (Tuần 1)**

### **1.1 Install React Native Voice**
```bash
# Install react-native-voice (FREE native speech recognition)
npm install @react-native-voice/voice

# For React Native 0.60+, auto-linking works
cd ios && pod install
```

### **1.2 iOS Permissions Setup**
```xml
<!-- ios/ChineseLearningApp/Info.plist -->
<key>NSMicrophoneUsageDescription</key>
<string>Ứng dụng cần quyền microphone để luyện phát âm tiếng Trung</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>Ứng dụng cần quyền nhận diện giọng nói để đánh giá phát âm</string>
```

### **1.3 Android Permissions Setup**
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### **1.4 Enhanced Native Speech Hook**
```typescript
// src/hooks/useEnhancedNativeSpeech.ts
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

interface NativeSpeechConfig {
  language: 'zh-CN' | 'zh-TW' | 'en-US';
  maxResults: number;
  continuous: boolean;
  partialResults: boolean;
}

export const useEnhancedNativeSpeech = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [partialTranscript, setPartialTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = useCallback(() => {
    setIsListening(true);
    setError(null);
  }, []);

  const onSpeechEnd = useCallback(() => {
    setIsListening(false);
  }, []);

  const onSpeechError = useCallback((event: SpeechErrorEvent) => {
    setIsListening(false);
    setError(event.error?.message || 'Speech recognition error');
  }, []);

  const onSpeechResults = useCallback((event: SpeechResultsEvent) => {
    if (event.value && event.value.length > 0) {
      setTranscript(event.value[0]);
      setPartialTranscript('');
    }
  }, []);

  const onSpeechPartialResults = useCallback((event: SpeechResultsEvent) => {
    if (event.value && event.value.length > 0) {
      setPartialTranscript(event.value[0]);
    }
  }, []);

  const startListening = useCallback(async (config: NativeSpeechConfig) => {
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

      await Voice.start(config.language, options);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  return {
    transcript,
    partialTranscript,
    isListening,
    error,
    hasPermission,
    startListening,
    stopListening,
  };
};
```

---

## 🚀 **PHASE 2: VOSK OFFLINE INTEGRATION (Tuần 2-3)**

### **2.1 Install React Native Vosk**
```bash
# Install vosk for offline speech recognition
npm install react-native-vosk

# Manual linking for some versions
react-native link react-native-vosk
```

### **2.2 Download Chinese Models**
```typescript
// src/services/VoskModelManager.ts
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';

export class VoskModelManager {
  private static readonly CHINESE_MODEL_URL = 'https://alphacephei.com/vosk/models/vosk-model-small-cn-0.22.zip';
  private static readonly MODEL_DIR = RNFS.DocumentDirectoryPath + '/vosk-models/';

  static async downloadChineseModel(): Promise<string> {
    const modelPath = this.MODEL_DIR + 'chinese/';
    
    // Check if model already exists
    if (await RNFS.exists(modelPath)) {
      return modelPath;
    }

    // Create directory
    await RNFS.mkdir(this.MODEL_DIR);

    // Download model
    const downloadDest = this.MODEL_DIR + 'chinese-model.zip';
    const download = RNFS.downloadFile({
      fromUrl: this.CHINESE_MODEL_URL,
      toFile: downloadDest,
      progressDivider: 1,
      progress: (res) => {
        const progress = (res.bytesWritten / res.contentLength) * 100;
        console.log(`Download progress: ${progress.toFixed(0)}%`);
      }
    });

    await download.promise;

    // Extract model
    await unzip(downloadDest, modelPath);
    
    // Cleanup zip file
    await RNFS.unlink(downloadDest);

    return modelPath;
  }

  static async isModelReady(): Promise<boolean> {
    const modelPath = this.MODEL_DIR + 'chinese/';
    return await RNFS.exists(modelPath);
  }
}
```

### **2.3 Vosk Speech Recognition Service**
```typescript
// src/services/VoskSpeechService.ts
import Vosk from 'react-native-vosk';

export class VoskSpeechService {
  private recognizer: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      const modelPath = await VoskModelManager.downloadChineseModel();
      
      this.recognizer = await Vosk.createRecognizer({
        modelPath: modelPath,
        sampleRate: 16000
      });

      this.isInitialized = true;
      console.log('✅ Vosk initialized with Chinese model');
    } catch (error) {
      console.error('❌ Vosk initialization failed:', error);
      throw error;
    }
  }

  async recognizeAudio(audioData: string): Promise<VoskResult> {
    if (!this.isInitialized) {
      throw new Error('Vosk not initialized');
    }

    try {
      const result = await this.recognizer.recognize(audioData);
      
      return {
        text: result.text || '',
        confidence: result.confidence || 0,
        partial: false,
        alternatives: result.alternatives || []
      };
    } catch (error) {
      console.error('❌ Vosk recognition failed:', error);
      throw error;
    }
  }

  async recognizePartial(audioData: string): Promise<string> {
    if (!this.isInitialized) {
      return '';
    }

    try {
      const result = await this.recognizer.recognizePartial(audioData);
      return result.partial || '';
    } catch (error) {
      console.warn('⚠️ Vosk partial recognition failed:', error);
      return '';
    }
  }

  destroy(): void {
    if (this.recognizer) {
      this.recognizer.free();
      this.recognizer = null;
      this.isInitialized = false;
    }
  }
}

interface VoskResult {
  text: string;
  confidence: number;
  partial: boolean;
  alternatives: string[];
}
```

---

## 🚀 **PHASE 3: AUDIO RECORDING & PROCESSING (Tuần 3-4)**

### **3.1 Install Audio Recording Library**
```bash
# Install react-native-audio-recorder-player
npm install react-native-audio-recorder-player
cd ios && pod install
```

### **3.2 Audio Recording Service**
```typescript
// src/services/AudioRecordingService.ts
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

export class AudioRecordingService {
  private audioRecorderPlayer: AudioRecorderPlayer;
  private recordPath: string;
  private isRecording = false;

  constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.recordPath = '';
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) {
      return;
    }

    try {
      // Set recording path
      this.recordPath = RNFS.DocumentDirectoryPath + '/recording.wav';

      // Configure recording
      const audioSet = {
        AudioEncoderAndroid: 'aac',
        AudioQuality: 'High',
        AudioSampleRate: 16000, // Vosk requires 16kHz
        NumberOfChannels: 1,    // Mono
        AudioSource: 'MIC',
      };

      await this.audioRecorderPlayer.startRecorder(this.recordPath, audioSet);
      this.isRecording = true;
      
      console.log('🎙️ Recording started');
    } catch (error) {
      console.error('❌ Recording start failed:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string> {
    if (!this.isRecording) {
      return '';
    }

    try {
      await this.audioRecorderPlayer.stopRecorder();
      this.isRecording = false;
      
      console.log('⏹️ Recording stopped');
      return this.recordPath;
    } catch (error) {
      console.error('❌ Recording stop failed:', error);
      throw error;
    }
  }

  async getAudioData(filePath: string): Promise<string> {
    try {
      // Convert audio file to base64 for Vosk processing
      const audioData = await RNFS.readFile(filePath, 'base64');
      return audioData;
    } catch (error) {
      console.error('❌ Audio data read failed:', error);
      throw error;
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}
```

---

## 🚀 **PHASE 4: SMART HYBRID RECOGNITION (Tuần 4-5)**

### **4.1 Hybrid Speech Recognition Manager**
```typescript
// src/services/HybridSpeechManager.ts
import { Platform } from 'react-native';
import { VoskSpeechService } from './VoskSpeechService';
import { useEnhancedNativeSpeech } from '../hooks/useEnhancedNativeSpeech';

export class HybridSpeechManager {
  private voskService: VoskSpeechService;
  private audioRecorder: AudioRecordingService;
  private nativeSpeech: any;

  constructor() {
    this.voskService = new VoskSpeechService();
    this.audioRecorder = new AudioRecordingService();
  }

  async initialize(): Promise<void> {
    // Initialize Vosk for offline recognition
    await this.voskService.initialize();
    console.log('✅ Hybrid Speech Manager initialized');
  }

  async recognizeText(expectedText: string): Promise<SpeechRecognitionResult> {
    const methods: RecognitionMethod[] = [];

    try {
      // Method 1: Native Speech Recognition (online, fast)
      if (await this.isOnline()) {
        const nativeResult = await this.recognizeWithNative(expectedText);
        methods.push({
          name: 'native',
          result: nativeResult,
          weight: 0.4,
          speed: 'fast'
        });
      }

      // Method 2: Vosk Offline (always available)
      const voskResult = await this.recognizeWithVosk(expectedText);
      methods.push({
        name: 'vosk',
        result: voskResult,
        weight: 0.6,
        speed: 'medium'
      });

      // Combine results for best accuracy
      const combinedResult = this.combineResults(methods, expectedText);
      
      return combinedResult;

    } catch (error) {
      console.error('❌ Speech recognition failed:', error);
      throw error;
    }
  }

  private async recognizeWithNative(expectedText: string): Promise<BasicSpeechResult> {
    return new Promise((resolve, reject) => {
      // Implementation using react-native-voice
      // This will use iOS/Android native speech recognition
    });
  }

  private async recognizeWithVosk(expectedText: string): Promise<BasicSpeechResult> {
    try {
      // Start recording
      await this.audioRecorder.startRecording();
      
      // Record for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Stop recording and get audio data
      const audioPath = await this.audioRecorder.stopRecording();
      const audioData = await this.audioRecorder.getAudioData(audioPath);
      
      // Process with Vosk
      const voskResult = await this.voskService.recognizeAudio(audioData);
      
      return {
        transcript: voskResult.text,
        confidence: voskResult.confidence,
        alternatives: voskResult.alternatives
      };
      
    } catch (error) {
      console.error('❌ Vosk recognition failed:', error);
      throw error;
    }
  }

  private combineResults(methods: RecognitionMethod[], expectedText: string): SpeechRecognitionResult {
    if (methods.length === 0) {
      throw new Error('No recognition methods available');
    }

    // Use weighted voting to find best result
    let bestResult = methods[0].result;
    let bestScore = 0;

    for (const method of methods) {
      const accuracy = this.calculateChineseAccuracy(method.result.transcript, expectedText);
      const weightedScore = accuracy * method.weight;
      
      if (weightedScore > bestScore) {
        bestScore = weightedScore;
        bestResult = method.result;
      }
    }

    return {
      transcript: bestResult.transcript,
      confidence: bestResult.confidence,
      accuracy: bestScore,
      methods: methods.map(m => m.name),
      chineseAnalysis: this.analyzeChineseText(bestResult.transcript, expectedText)
    };
  }

  private calculateChineseAccuracy(spoken: string, expected: string): number {
    // Chinese-specific accuracy calculation
    const spokenChars = Array.from(spoken);
    const expectedChars = Array.from(expected);
    
    let matches = 0;
    const maxLength = Math.max(spokenChars.length, expectedChars.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (spokenChars[i] === expectedChars[i]) {
        matches++;
      }
    }
    
    return matches / maxLength;
  }

  private async isOnline(): Promise<boolean> {
    // Check internet connectivity
    return true; // Simplified
  }
}

interface RecognitionMethod {
  name: string;
  result: BasicSpeechResult;
  weight: number;
  speed: 'fast' | 'medium' | 'slow';
}

interface BasicSpeechResult {
  transcript: string;
  confidence: number;
  alternatives?: string[];
}

interface SpeechRecognitionResult extends BasicSpeechResult {
  accuracy: number;
  methods: string[];
  chineseAnalysis: any;
}
```

---

## 🚀 **PHASE 5: UI COMPONENTS (Tuần 5-6)**

### **5.1 Native Speech Recognition Button**
```typescript
// src/components/features/speech/NativeSpeechButton.tsx
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { HybridSpeechManager } from '../../../services/HybridSpeechManager';
import { BaseText } from '../../ui/atoms/Text/BaseText';
import { colors, getResponsiveSpacing } from '../../../theme';

interface NativeSpeechButtonProps {
  expectedText: string;
  onResult: (result: SpeechRecognitionResult) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export const NativeSpeechButton: React.FC<NativeSpeechButtonProps> = ({
  expectedText,
  onResult,
  onError,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechManager] = useState(() => new HybridSpeechManager());
  const [animation] = useState(new Animated.Value(1));

  useEffect(() => {
    speechManager.initialize().catch(onError);
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(animation, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      animation.setValue(1);
    }
  }, [isRecording]);

  const handlePress = async () => {
    if (disabled || isRecording) return;

    try {
      setIsRecording(true);
      
      const result = await speechManager.recognizeText(expectedText);
      onResult(result);
      
    } catch (error: any) {
      onError(error.message || 'Speech recognition failed');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: animation }] }]}>
        <TouchableOpacity
          style={[
            styles.button,
            isRecording && styles.recording,
            disabled && styles.disabled
          ]}
          onPress={handlePress}
          disabled={disabled}
        >
          <BaseText style={[styles.buttonText, isRecording && styles.recordingText]}>
            {isRecording ? '🎙️ Đang nghe...' : '🎤 Nhấn để nói'}
          </BaseText>
        </TouchableOpacity>
      </Animated.View>
      
      {isRecording && (
        <BaseText style={styles.instruction}>
          Hãy nói: "{expectedText}"
        </BaseText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing('lg'),
  },
  buttonContainer: {
    marginBottom: getResponsiveSpacing('md'),
  },
  button: {
    backgroundColor: colors.primary[500],
    paddingVertical: getResponsiveSpacing('lg'),
    paddingHorizontal: getResponsiveSpacing('xl'),
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  recording: {
    backgroundColor: colors.error[500],
  },
  disabled: {
    backgroundColor: colors.neutral[400],
  },
  buttonText: {
    color: colors.neutral[50],
    fontSize: 16,
    fontWeight: '600',
  },
  recordingText: {
    color: colors.neutral[50],
  },
  instruction: {
    fontSize: 14,
    color: colors.neutral[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
```

---

## 🚀 **PHASE 6: CHINESE ACCURACY ENHANCEMENT (Tuần 6-7)**

### **6.1 Chinese Character Analyzer**
```typescript
// src/services/ChineseAccuracyAnalyzer.ts
export class ChineseAccuracyAnalyzer {
  
  static analyzeAccuracy(spoken: string, expected: string): ChineseAccuracyResult {
    const spokenChars = Array.from(spoken.replace(/[^\u4e00-\u9fff]/g, ''));
    const expectedChars = Array.from(expected.replace(/[^\u4e00-\u9fff]/g, ''));
    
    // Character-level analysis
    const charResults = this.analyzeCharacters(spokenChars, expectedChars);
    
    // Tone estimation (without audio analysis)
    const toneResults = this.estimateTones(spokenChars, expectedChars);
    
    // Overall scoring
    const overallAccuracy = this.calculateOverallScore(charResults, toneResults);
    
    return {
      characterAccuracy: charResults.accuracy,
      toneAccuracy: toneResults.accuracy,
      overallAccuracy,
      feedback: this.generateFeedback(charResults, toneResults),
      suggestions: this.generateSuggestions(charResults, toneResults),
      characterDetails: charResults.details,
      toneDetails: toneResults.details
    };
  }

  private static analyzeCharacters(spoken: string[], expected: string[]): CharacterAnalysisResult {
    const details: CharacterDetail[] = [];
    let correctCount = 0;
    
    for (let i = 0; i < expected.length; i++) {
      const expectedChar = expected[i];
      const spokenChar = spoken[i] || '';
      const isCorrect = expectedChar === spokenChar;
      
      if (isCorrect) correctCount++;
      
      details.push({
        expected: expectedChar,
        spoken: spokenChar,
        isCorrect,
        position: i,
        confidence: isCorrect ? 0.95 : this.calculateCharSimilarity(expectedChar, spokenChar)
      });
    }
    
    return {
      accuracy: correctCount / expected.length,
      details,
      correctCount,
      totalCount: expected.length
    };
  }

  private static calculateCharSimilarity(char1: string, char2: string): number {
    if (char1 === char2) return 1.0;
    
    // Common Chinese character confusions
    const confusions: { [key: string]: string[] } = {
      '他': ['她', '它'],
      '的': ['得', '地'],
      '在': ['再'],
      '做': ['作'],
      '那': ['哪'],
      '这': ['者']
    };
    
    if (confusions[char1]?.includes(char2) || confusions[char2]?.includes(char1)) {
      return 0.7;
    }
    
    return 0.1;
  }

  private static generateFeedback(charResults: CharacterAnalysisResult, toneResults: any): string {
    const accuracy = (charResults.accuracy + toneResults.accuracy) / 2;
    
    if (accuracy >= 0.9) {
      return '🎉 Xuất sắc! Phát âm rất chính xác.';
    } else if (accuracy >= 0.7) {
      return '👍 Tốt! Cần cải thiện một chút.';
    } else if (accuracy >= 0.5) {
      return '💪 Khá ổn! Hãy luyện tập thêm.';
    } else {
      return '🔄 Cần cải thiện nhiều. Hãy nghe và lặp lại.';
    }
  }
}

interface ChineseAccuracyResult {
  characterAccuracy: number;
  toneAccuracy: number;
  overallAccuracy: number;
  feedback: string;
  suggestions: string[];
  characterDetails: CharacterDetail[];
  toneDetails: any[];
}

interface CharacterDetail {
  expected: string;
  spoken: string;
  isCorrect: boolean;
  position: number;
  confidence: number;
}
```

---

## 📋 **TIMELINE IMPLEMENTATION**

### **🚀 Week 1: Native Foundation**
- [ ] Setup React Native Voice
- [ ] Configure iOS/Android permissions
- [ ] Test basic speech recognition

### **🚀 Week 2-3: Vosk Integration**
- [ ] Install Vosk libraries
- [ ] Download Chinese models
- [ ] Implement offline recognition

### **🚀 Week 4: Audio Recording**
- [ ] Setup audio recording
- [ ] Integrate with Vosk
- [ ] Test recording quality

### **🚀 Week 5: Hybrid System**
- [ ] Combine native + Vosk
- [ ] Smart fallback logic
- [ ] Performance optimization

### **🚀 Week 6-7: Chinese Enhancement**
- [ ] Character accuracy analysis
- [ ] Tone estimation
- [ ] Feedback generation

### **🚀 Week 8: Testing & Polish**
- [ ] Test trên iOS/Android devices
- [ ] Performance optimization
- [ ] UI/UX improvements

---

## 🎯 **KẾT QUẢ DỰ KIẾN**

### ✅ **Native App Performance:**
- **iOS**: 90%+ accuracy với native Speech Framework
- **Android**: 88%+ accuracy với Google Speech
- **Offline**: 85%+ accuracy với Vosk
- **Startup Time**: <3 seconds
- **Recognition Speed**: <2 seconds

### 📱 **Device Requirements:**
- **iOS**: 12.0+, 3GB RAM
- **Android**: API 21+, 3GB RAM
- **Storage**: 100MB (Vosk model)

**Kết quả**: Native app hoàn chỉnh với speech recognition chất lượng cao, chạy trực tiếp trên iOS/Android devices! 🚀 