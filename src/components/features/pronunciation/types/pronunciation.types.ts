export interface ToneExample {
  id: string;
  character: string;
  pinyin: string;
  tone: number;
  vietnamese: string;
  english: string;
  audioUrl?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  lessonId?: string;
}

export interface TonePracticeProps {
  examples: ToneExample[];
  onComplete?: (score: number, correct: number, total: number) => void;
  showResults?: boolean;
  autoAdvance?: boolean;
  timeLimit?: number;
  variant?: 'default' | 'compact' | 'quiz';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  shuffleQuestions?: boolean;
}

export interface TonePracticeResult {
  score: number;
  correct: number;
  total: number;
  accuracy: number;
  timeSpent: number;
  incorrectAnswers: {
    question: ToneExample;
    userAnswer: number;
    correctAnswer: number;
  }[];
}

export interface PronunciationProgress {
  userId: string;
  toneAccuracy: {
    tone1: number;
    tone2: number;
    tone3: number;
    tone4: number;
    neutral: number;
  };
  totalPractices: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  averageScore: number;
  lastPracticed?: Date;
  weakTones: number[];
  strongTones: number[];
}

export interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
  showControls?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  variant?: 'default' | 'compact' | 'minimal';
}

export interface PinyinDisplayProps {
  pinyin: string;
  tone?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showToneMarks?: boolean;
  showToneNumbers?: boolean;
  color?: string;
  style?: any;
}

export interface ToneIndicatorProps {
  tone: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dot' | 'bar' | 'symbol' | 'color';
  showLabel?: boolean;
  interactive?: boolean;
  onPress?: (tone: number) => void;
}

export interface VoiceRecorderProps {
  onRecordingComplete: (audioFile: string) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  maxDuration?: number;
  quality?: 'low' | 'medium' | 'high';
  format?: 'mp3' | 'wav' | 'aac';
  showWaveform?: boolean;
}

export interface PronunciationAssessmentProps {
  targetText: string;
  userAudio: string;
  onAssessmentComplete: (result: PronunciationAssessmentResult) => void;
  includeWordsLevel?: boolean;
  includePhonemesLevel?: boolean;
}

export interface PronunciationAssessmentResult {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  prosodyScore: number;
  wordScores?: WordScore[];
  phonemeScores?: PhonemeScore[];
  feedback: string[];
  suggestions: string[];
}

export interface WordScore {
  word: string;
  accuracyScore: number;
  errorType?: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation';
}

export interface PhonemeScore {
  phoneme: string;
  accuracyScore: number;
  nBestPhonemes?: string[];
}

export interface ToneQuizProps {
  characters: ToneExample[];
  quizType: 'identify-tone' | 'match-tone' | 'compare-tones' | 'tone-pairs';
  onComplete: (results: ToneQuizResult) => void;
  timeLimit?: number;
  questionsCount?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ToneQuizResult {
  score: number;
  correct: number;
  total: number;
  accuracy: number;
  timeSpent: number;
  results: ToneQuestionResult[];
  strengths: number[];
  weaknesses: number[];
}

export interface ToneQuestionResult {
  question: ToneExample;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface ListeningExerciseProps {
  audioItems: AudioExerciseItem[];
  exerciseType: 'tone-identification' | 'word-recognition' | 'sentence-completion';
  onComplete: (results: ListeningExerciseResult) => void;
  allowReplay?: boolean;
  showTranscript?: boolean;
  playbackSpeed?: 0.5 | 0.75 | 1.0 | 1.25 | 1.5;
}

export interface AudioExerciseItem {
  id: string;
  audioUrl: string;
  transcript: string;
  translation: string;
  options?: string[];
  correctAnswer: string;
  tone?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ListeningExerciseResult {
  score: number;
  correct: number;
  total: number;
  accuracy: number;
  results: AudioExerciseResult[];
}

export interface AudioExerciseResult {
  item: AudioExerciseItem;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  replays: number;
}

export interface SpeechRecognitionProps {
  targetText: string;
  onRecognitionResult: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  alternatives?: SpeechRecognitionAlternative[];
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Hook return types
export interface UseTonePracticeReturn {
  examples: ToneExample[];
  isLoading: boolean;
  error: string | null;
  startPractice: (difficulty?: string, count?: number) => Promise<void>;
  submitAnswer: (toneExample: ToneExample, answer: number) => Promise<boolean>;
  getProgress: () => Promise<PronunciationProgress>;
  playAudio: (audioUrl: string) => Promise<void>;
}

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  play: (url: string) => Promise<void>;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  cancelRecording: () => void;
}

export interface UsePronunciationAssessmentReturn {
  isAssessing: boolean;
  assessmentResult: PronunciationAssessmentResult | null;
  error: string | null;
  assessPronunciation: (audioFile: string, targetText: string) => Promise<void>;
  clearResult: () => void;
}

// Service types
export interface PronunciationService {
  getToneExamples(difficulty?: string, count?: number): Promise<ToneExample[]>;
  assessPronunciation(audioFile: string, targetText: string): Promise<PronunciationAssessmentResult>;
  playAudio(url: string): Promise<void>;
  recordAudio(duration?: number): Promise<string>;
  getProgress(userId: string): Promise<PronunciationProgress>;
  updateProgress(userId: string, result: TonePracticeResult): Promise<void>;
  getToneStatistics(userId: string): Promise<ToneStatistics>;
}

export interface ToneStatistics {
  toneAccuracy: Record<number, number>;
  mostDifficultTones: number[];
  easiestTones: number[];
  improvementAreas: string[];
  practiceRecommendations: string[];
  weeklyProgress: {
    date: string;
    accuracy: number;
    practiceTime: number;
  }[];
}

// Redux state types
export interface PronunciationState {
  toneExamples: ToneExample[];
  currentPractice: TonePracticeProps | null;
  progress: PronunciationProgress | null;
  assessmentResult: PronunciationAssessmentResult | null;
  statistics: ToneStatistics | null;
  isLoading: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  error: string | null;
} 