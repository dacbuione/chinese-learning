export interface ToneExample {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  tone: number;
  audioUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hskLevel: number;
}

export interface TonePracticeProps {
  examples: ToneExample[];
  onAnswer?: (correct: boolean, selectedTone: number, correctTone: number) => void;
  onComplete?: (accuracy: number, timeSpent: number) => void;
  showFeedback?: boolean;
  autoPlay?: boolean;
  enableRecording?: boolean;
  maxAttempts?: number;
}

export interface PronunciationSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  examples: ToneExample[];
  responses: ToneResponse[];
  accuracy: number;
  completed: boolean;
  timeSpent: number;
}

export interface ToneResponse {
  exampleId: string;
  selectedTone: number;
  correctTone: number;
  correct: boolean;
  responseTime: number;
  attempts: number;
  timestamp: Date;
}

export interface PronunciationStats {
  totalPractices: number;
  correctAnswers: number;
  accuracy: number;
  averageResponseTime: number;
  toneAccuracy: {
    tone1: number;
    tone2: number;
    tone3: number;
    tone4: number;
    neutral: number;
  };
  weakestTones: number[];
  strongestTones: number[];
  practiceStreak: number;
}

export interface AudioRecording {
  id: string;
  exampleId: string;
  audioBlob: Blob;
  duration: number;
  timestamp: Date;
  accuracy?: number;
  feedback?: string;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  alternatives?: string[];
  pronunciation?: {
    accuracy: number;
    toneAccuracy: number;
    fluency: number;
  };
}

export interface PronunciationExercise {
  id: string;
  type: 'tone-identification' | 'tone-production' | 'word-pronunciation' | 'sentence-reading';
  title: string;
  description: string;
  examples: ToneExample[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  requiredAccuracy: number; // percentage
}

export interface PronunciationProgress {
  exerciseId: string;
  attempts: number;
  bestAccuracy: number;
  averageAccuracy: number;
  lastPracticed: Date;
  mastery: 'new' | 'learning' | 'familiar' | 'mastered';
  weakAreas: number[]; // tone numbers that need more practice
} 