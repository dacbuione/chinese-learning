# 📚🎤 Kế Hoạch Phát Triển Reading & Speech Recognition
**Chinese Learning App - Phase 3 Development Plan**

## 📊 **PHÂN TÍCH HIỆN TRẠNG**

### ✅ **ĐÃ CÓ SẴN**
- **Reading Practice**: `app/(tabs)/practice/reading.tsx` - Có sẵn nhưng chưa tích hợp vào lessons
- **Pronunciation Practice**: `app/(tabs)/practice/pronunciation.tsx` - Có cơ bản, chưa có speech recognition
- **TTS Integration**: Google Cloud Text-to-Speech đã setup hoàn chỉnh
- **Audio Player Service**: Có sẵn và hoạt động tốt
- **TTS Hooks**: `useTTS`, `useVocabularyTTS`, `usePronunciationTTS`

### ❌ **THIẾU & CẦN PHÁT TRIỂN**
1. **Reading Integration**: Chưa tích hợp vào lesson flow
2. **Speech Recognition**: Chưa có nhận diện giọng nói
3. **Pronunciation Evaluation**: Chưa có đánh giá độ chính xác phát âm
4. **Reading Comprehension Exercises**: Chưa có trong lesson exercises
5. **Speech-to-Text với Chinese**: Chưa có nhận diện tiếng Trung

---

## 🎯 **MỤC TIÊU PHÁT TRIỂN**

### **Phase 3A: Reading Integration & Enhancement** (5-7 ngày)
1. Tích hợp Reading vào Lesson flow
2. Thêm Reading exercises vào Exercise system
3. Cải thiện Reading UI/UX
4. Thêm Reading progress tracking

### **Phase 3B: Speech Recognition với Google Cloud** (7-10 ngày)
1. Setup Google Cloud Speech-to-Text API
2. Tạo Speech Recognition Service
3. Tích hợp vào Pronunciation Practice
4. Thêm pronunciation evaluation

### **Phase 3C: Advanced Features** (5-7 ngày)
1. Real-time pronunciation feedback
2. Tone accuracy detection
3. Speaking exercises trong lessons
4. Voice commands cho navigation

---

## 🔧 **TECHNICAL ARCHITECTURE**

### **Reading System Architecture**
```
📚 Reading Flow:
├── LessonScreen → ReadingTab
├── ReadingExercise (mới)
├── ReadingComprehension (mới)
├── ReadingProgress (mới)
└── ReadingService (mới)

🎯 Exercise Integration:
├── LessonExercise → ReadingExercise
├── Reading Multiple Choice
├── Reading Fill Blanks
└── Reading True/False
```

### **Speech Recognition Architecture**
```
🎤 Speech System:
├── GoogleSpeechService (mới)
├── PronunciationEvaluator (mới)
├── SpeechRecognitionHook (mới)
├── VoiceRecorder (mới)
└── PronunciationFeedback (mới)

🔄 Flow:
User speaks → Audio capture → Google Speech API → 
Pronunciation analysis → Feedback & score
```

---

## 📋 **PHASE 3A: READING INTEGRATION** (5-7 ngày)

### **Ngày 1-2: Reading Service & Components**

#### **1.1 Tạo Reading Service**
```typescript
// src/services/readingService.ts
interface ReadingService {
  getReadingByLesson(lessonId: string): ReadingPassage[];
  getReadingProgress(userId: string): ReadingProgress;
  submitReadingAnswer(answer: ReadingAnswer): Promise<void>;
  generateReadingExercises(content: string): ReadingExercise[];
}
```

#### **1.2 Enhanced Reading Components**
```typescript
// src/components/features/reading/
├── ReadingPassage/
│   ├── ReadingPassage.tsx          // Display passage với highlighting
│   ├── ReadingPassage.styles.ts
│   └── index.ts
├── ReadingQuestion/
│   ├── QCMQuestion.tsx             // Multiple choice
│   ├── FillBlankQuestion.tsx       // Fill in blanks  
│   ├── TrueFalseQuestion.tsx       // True/false
│   └── index.ts
├── ReadingProgress/
│   ├── ReadingProgress.tsx         // Progress tracking
│   └── index.ts
└── ReadingFeedback/
    ├── ReadingFeedback.tsx         // Answer feedback
    └── index.ts
```

#### **1.3 Reading Types & Interfaces**
```typescript
// src/types/reading.types.ts
interface ReadingPassage {
  id: string;
  lessonId: string;
  title: string;
  content: string;
  pinyin: string;
  vietnamese: string;
  english: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hskLevel: number;
  estimatedTime: number;
  questions: ReadingQuestion[];
  vocabulary: string[]; // Key vocab in passage
}

interface ReadingQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'true-false' | 'short-answer';
  question: string;
  passage_highlight?: {start: number, end: number}; // Highlight relevant text
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: number;
}
```

### **Ngày 3-4: Lesson Integration**

#### **1.4 Tích hợp vào LessonScreen**
```typescript
// Cập nhật app/(tabs)/lessons/[id].tsx
const renderReadingTab = () => (
  <View style={styles.tabContent}>
    <Text style={styles.sectionTitle}>Đọc hiểu ({lesson.reading.length} bài)</Text>
    {lesson.reading.map((reading) => (
      <ReadingCard 
        key={reading.id}
        reading={reading}
        onPress={() => router.push(`/reading/${reading.id}`)}
      />
    ))}
  </View>
);

// Thêm tab Reading
<TouchableOpacity
  style={[styles.tab, activeTab === 'reading' && styles.activeTab]}
  onPress={() => setActiveTab('reading')}
>
  <Text>Đọc hiểu</Text>
</TouchableOpacity>
```

#### **1.5 Reading Exercise Integration**
```typescript
// Cập nhật app/(tabs)/lessons/exercise.tsx
const readingExercises: ExerciseData[] = [
  {
    id: 'reading-1',
    type: 'reading-comprehension',
    passage: '我叫李明。我今年二十岁...',
    question: 'Lý Minh bao nhiêu tuổi?',
    options: ['18 tuổi', '19 tuổi', '20 tuổi', '21 tuổi'],
    correctAnswer: 'option-3',
    explanation: 'Trong bài có câu "我今年二十岁"...'
  }
];
```

### **Ngày 5: UI/UX Enhancement**

#### **1.6 Reading UI Improvements**
- Text highlighting khi đọc
- Scroll to highlight position
- Reading speed measurement
- Vocabulary popup definitions
- Progress indicators
- Beautiful typography cho Chinese text

#### **1.7 Responsive Design**
- Mobile: Single column layout
- Tablet: Side-by-side text và questions
- Desktop: Full reading experience

---

## 📋 **PHASE 3B: SPEECH RECOGNITION** (7-10 ngày)

### **Ngày 1-2: Google Cloud Speech Setup**

#### **2.1 Google Cloud Speech-to-Text Setup**
```json
// API Setup Requirements
{
  "services": [
    "Cloud Speech-to-Text API",
    "Cloud Text-to-Speech API" // Đã có
  ],
  "permissions": [
    "Cloud Speech Client",
    "AI Platform Developer"
  ],
  "languages": [
    "zh-CN (Chinese Simplified)",
    "zh-TW (Chinese Traditional)"
  ]
}
```

#### **2.2 Environment Configuration**
```env
# Thêm vào .env
GOOGLE_CLOUD_SPEECH_API_KEY=your-speech-api-key
GOOGLE_SPEECH_LANGUAGE=zh-CN
GOOGLE_SPEECH_MODEL=latest_long
GOOGLE_SPEECH_ENCODING=WEBM_OPUS
GOOGLE_SPEECH_SAMPLE_RATE=16000
```

#### **2.3 Dependencies Installation**
```bash
npm install @google-cloud/speech
npm install expo-av
npm install react-native-audio-recorder-player
npm install buffer
```

### **Ngày 3-4: Speech Recognition Service**

#### **2.4 Google Speech Service**
```typescript
// src/services/speechService.ts
class GoogleSpeechService {
  private speechClient: any;
  private isRecording = false;
  private audioRecorder: any;

  async initialize(): Promise<void> {
    // Initialize Google Speech client
  }

  async startRecording(): Promise<void> {
    // Start audio recording
  }

  async stopRecording(): Promise<SpeechResult> {
    // Stop recording và gửi to Google Speech API
  }

  async recognizeSpeech(audioBuffer: Buffer): Promise<SpeechResult> {
    // Call Google Speech-to-Text API
  }

  async evaluatePronunciation(
    transcript: string, 
    expected: string
  ): Promise<PronunciationScore> {
    // Compare transcript with expected text
    // Calculate pronunciation accuracy
  }
}

interface SpeechResult {
  transcript: string;
  confidence: number;
  alternatives: string[];
  pronunciation?: {
    accuracy: number;
    toneAccuracy: number;
    fluency: number;
    detectedTones: number[];
  };
}
```

#### **2.5 Audio Recording Service**
```typescript
// src/services/audioRecordingService.ts
class AudioRecordingService {
  private recorder: any;
  private isRecording = false;

  async requestPermissions(): Promise<boolean>;
  async startRecording(): Promise<void>;
  async stopRecording(): Promise<string>; // Returns audio file path
  async getAudioBuffer(filePath: string): Promise<Buffer>;
  
  // Real-time audio streaming for live recognition
  async startStreamRecording(onChunk: (chunk: Buffer) => void): Promise<void>;
}
```

### **Ngày 5-6: Pronunciation Evaluation**

#### **2.6 Pronunciation Evaluator**
```typescript
// src/services/pronunciationEvaluator.ts
class PronunciationEvaluator {
  
  async evaluateWord(
    spokenText: string,
    expectedWord: string,
    expectedPinyin: string,
    expectedTone: number
  ): Promise<PronunciationEvaluation> {
    
    return {
      wordAccuracy: number, // 0-100
      toneAccuracy: number, // 0-100  
      overallScore: number, // 0-100
      feedback: {
        strengths: string[],
        improvements: string[],
        tips: string[]
      },
      detectedTones: number[],
      phoneticAccuracy: PhoneticScore[]
    };
  }

  async evaluateSentence(
    spokenText: string,
    expectedSentence: string
  ): Promise<SentenceEvaluation> {
    // Evaluate entire sentence
  }

  private calculateToneAccuracy(
    detected: number[],
    expected: number[]
  ): number {
    // Tone accuracy algorithm
  }
}
```

#### **2.7 Real-time Feedback System**
```typescript
// Real-time pronunciation feedback
interface RealtimeFeedback {
  isCorrect: boolean;
  confidence: number;
  suggestion: string;
  toneGuide: {
    expected: number;
    detected: number;
    accuracy: number;
  };
}
```

### **Ngày 7-8: UI Components**

#### **2.8 Speech Recognition Components**
```typescript
// src/components/features/speech/
├── VoiceRecorder/
│   ├── VoiceRecorder.tsx           // Recording button và waveform
│   ├── VoiceRecorder.styles.ts
│   └── index.ts
├── PronunciationFeedback/
│   ├── PronunciationFeedback.tsx   // Feedback display
│   ├── ToneFeedback.tsx           // Tone visualization
│   └── index.ts
├── SpeechProgress/
│   ├── SpeechProgress.tsx         // Progress tracking
│   └── index.ts
└── VoiceWaveform/
    ├── VoiceWaveform.tsx          // Audio waveform visualization
    └── index.ts
```

#### **2.9 Speech Recognition Hook**
```typescript
// src/hooks/useSpeechRecognition.ts
export const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startRecording = async (expectedText: string) => {
    // Start recording và setup recognition
  };

  const stopRecording = async (): Promise<SpeechResult> => {
    // Stop recording và return results
  };

  const evaluatePronunciation = async (
    expected: string
  ): Promise<PronunciationScore> => {
    // Evaluate pronunciation accuracy
  };

  return {
    isRecording,
    transcript,
    confidence,
    error,
    startRecording,
    stopRecording,
    evaluatePronunciation
  };
};
```

### **Ngày 9-10: Integration & Testing**

#### **2.10 Pronunciation Practice Enhancement**
```typescript
// Cập nhật app/(tabs)/practice/pronunciation.tsx
const handleStartRecording = async () => {
  try {
    setIsRecording(true);
    await startRecording(currentExercise.character);
  } catch (error) {
    Alert.alert('Lỗi ghi âm', error.message);
  }
};

const handleStopRecording = async () => {
  try {
    const result = await stopRecording();
    const evaluation = await evaluatePronunciation(currentExercise.character);
    
    // Display feedback
    setPronunciationResult(evaluation);
    setShowFeedback(true);
  } catch (error) {
    Alert.alert('Lỗi đánh giá', error.message);
  }
};
```

#### **2.11 Lesson Exercise Integration**
```typescript
// Thêm speaking exercises vào lessons
const speakingExercises: ExerciseData[] = [
  {
    id: 'speaking-1',
    type: 'pronunciation-practice',
    chineseText: '你好',
    pinyin: 'nǐ hǎo',
    expectedAccuracy: 80, // Minimum accuracy to pass
  }
];
```

---

## 📋 **PHASE 3C: ADVANCED FEATURES** (5-7 ngày)

### **Ngày 1-2: Real-time Feedback**

#### **3.1 Live Pronunciation Coaching**
```typescript
// Real-time feedback during speaking
class LivePronunciationCoach {
  async startLiveCoaching(expectedText: string): Promise<void> {
    // Start real-time audio streaming
    // Provide instant feedback as user speaks
  }

  private onAudioChunk(chunk: Buffer): void {
    // Process audio chunk
    // Provide immediate feedback
  }
}
```

#### **3.2 Visual Feedback Components**
- Tone visualization (pitch curves)
- Waveform comparison (expected vs actual)
- Real-time accuracy meter
- Phonetic feedback

### **Ngày 3-4: Advanced Analytics**

#### **3.3 Pronunciation Analytics**
```typescript
interface PronunciationAnalytics {
  userProgress: {
    overallAccuracy: number;
    toneAccuracy: number[];
    commonMistakes: string[];
    improvementAreas: string[];
  };
  lessonPerformance: {
    lessonId: string;
    attempts: number;
    averageScore: number;
    timeSpent: number;
  }[];
}
```

#### **3.4 Personalized Recommendations**
- Identify weak tones
- Suggest focused practice
- Adaptive difficulty adjustment
- Progress tracking

### **Ngày 5: Voice Commands**

#### **3.5 Voice Navigation**
```typescript
// Voice commands for app navigation
const voiceCommands = {
  'next lesson': () => navigateToNextLesson(),
  'repeat audio': () => playCurrentAudio(),
  'show translation': () => toggleTranslation(),
  'practice pronunciation': () => startPronunciationPractice(),
};
```

---

## 🎯 **EXPECTED OUTCOMES**

### **Reading Improvements**
- ✅ Reading integrated vào lesson flow
- ✅ Reading exercises trong exercise system
- ✅ Progress tracking cho reading skills
- ✅ Improved typography và readability
- ✅ Mobile-responsive reading experience

### **Speech Recognition Features**
- ✅ Real-time speech recognition cho tiếng Trung
- ✅ Pronunciation accuracy scoring (0-100%)
- ✅ Tone accuracy detection
- ✅ Detailed feedback và improvement suggestions
- ✅ Progress tracking cho speaking skills

### **User Experience**
- ✅ Seamless integration với existing UI
- ✅ Real-time feedback
- ✅ Gamification elements
- ✅ Offline capability cho basic features
- ✅ Responsive design across devices

---

## 💰 **COST ANALYSIS**

### **Google Cloud Speech-to-Text Pricing**
```
Free Tier: 60 minutes/month
Standard: $0.006/15 seconds
Enhanced Models: $0.009/15 seconds

Estimated Monthly Cost for 1000 users:
- Free tier covers ~240 users (60 min ÷ 15 sec × 60)
- Remaining 760 users × 3 min/day × 30 days = 68,400 minutes
- 68,400 minutes × 0.006/0.25 minutes = $1,641.6/month

Cost Optimization Strategies:
1. Implement local preprocessing
2. Use shorter audio clips
3. Cache common pronunciations
4. Batch processing
```

### **Cost Mitigation**
1. **Hybrid Approach**: Web Speech API fallback
2. **Smart Batching**: Group similar requests
3. **Caching**: Store pronunciation scores
4. **Local Processing**: Basic validation trước khi gửi API

---

## 🚀 **IMPLEMENTATION TIMELINE**

### **Week 1 (5 ngày): Reading Integration**
- Day 1-2: Reading Service & Components
- Day 3-4: Lesson Integration  
- Day 5: UI/UX Enhancement

### **Week 2 (5 ngày): Speech Recognition Foundation**
- Day 1-2: Google Cloud Speech Setup
- Day 3-4: Speech Recognition Service
- Day 5: Audio Recording Service

### **Week 3 (5 ngày): Pronunciation Evaluation**
- Day 1-2: Pronunciation Evaluator
- Day 3-4: UI Components
- Day 5: Integration & Testing

### **Week 4 (5 ngày): Advanced Features & Polish**
- Day 1-2: Real-time Feedback
- Day 3-4: Advanced Analytics
- Day 5: Voice Commands & Final Testing

**Total Estimated Time: 20 ngày (4 weeks)**

---

## 🔧 **TECHNICAL REQUIREMENTS**

### **Dependencies to Add**
```bash
# Speech Recognition
npm install @google-cloud/speech
npm install react-native-audio-recorder-player
npm install buffer

# Audio Processing
npm install react-native-sound
npm install expo-av

# Analytics
npm install @react-native-async-storage/async-storage

# UI Enhancements
npm install react-native-svg
npm install react-native-reanimated
```

### **Permissions Required**
```json
{
  "android": {
    "permissions": [
      "android.permission.RECORD_AUDIO",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ]
  },
  "ios": {
    "infoPlist": {
      "NSMicrophoneUsageDescription": "This app needs microphone access for pronunciation practice."
    }
  }
}
```

---

## ✅ **SUCCESS METRICS**

### **Technical KPIs**
- Speech recognition accuracy: >90%
- Pronunciation evaluation accuracy: >85%
- Audio processing latency: <2 seconds
- App crash rate: <0.1%
- User satisfaction: >4.5/5 stars

### **User Engagement KPIs**
- Reading completion rate: >70%
- Speaking exercise completion: >60%
- Daily active users increase: +30%
- Session duration increase: +25%
- User retention: >80% after 1 week

---

## 🚨 **RISK MITIGATION**

### **Technical Risks**
1. **Google API Quota Limits**
   - Solution: Implement usage monitoring và cost alerts
   - Fallback: Web Speech API cho basic features

2. **Audio Quality Issues**
   - Solution: Audio preprocessing và noise reduction
   - Testing: Comprehensive device testing

3. **Performance Impact**
   - Solution: Background processing và caching
   - Monitoring: Performance analytics

4. **Privacy Concerns**
   - Solution: Local audio processing when possible
   - Compliance: GDPR và privacy guidelines

### **Business Risks**
1. **High Cloud Costs**
   - Solution: Smart caching và optimization
   - Monitoring: Real-time cost tracking

2. **User Adoption**
   - Solution: Gradual rollout và user feedback
   - Fallback: Optional features

---

## 📞 **SUPPORT & MAINTENANCE**

### **Documentation Required**
- API integration guides
- User guides cho new features
- Troubleshooting documentation  
- Performance monitoring setup

### **Testing Strategy**
- Unit tests cho all services
- Integration tests
- Device testing (iOS/Android)
- Performance testing
- Accessibility testing

### **Monitoring & Analytics**
- Google Cloud monitoring
- User behavior analytics
- Performance metrics
- Error tracking
- Cost monitoring

---

## 🎉 **FINAL DELIVERABLES**

### **Code Deliverables**
1. ✅ Enhanced Reading system với lesson integration
2. ✅ Complete Speech Recognition implementation
3. ✅ Pronunciation evaluation system
4. ✅ Real-time feedback components
5. ✅ Comprehensive test suite
6. ✅ Documentation và setup guides

### **User Features**
1. ✅ Reading comprehension trong lessons
2. ✅ Speaking practice với real-time feedback  
3. ✅ Pronunciation scoring và analytics
4. ✅ Progress tracking cho all skills
5. ✅ Voice commands for navigation
6. ✅ Offline capabilities where possible

---

## 📋 **NEXT STEPS FOR CONFIRMATION**

Sau khi bạn review kế hoạch này, chúng ta sẽ:

1. **✅ Confirm technical approach** - Có đồng ý dùng Google Cloud Speech API?
2. **✅ Confirm timeline** - 4 weeks có reasonable không?
3. **✅ Confirm budget** - Cloud costs có acceptable không?
4. **✅ Confirm priorities** - Có features nào cần ưu tiên không?
5. **✅ Start implementation** - Bắt đầu từ Phase 3A

**Bạn có muốn tôi điều chỉnh gì trong kế hoạch này không?** 