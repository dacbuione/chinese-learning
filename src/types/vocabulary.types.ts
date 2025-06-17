export interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  tone: number;
  hskLevel: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  strokeOrder: string[];
  audioUrl?: string;
  examples?: VocabularyExample[];
  mastery?: MasteryLevel;
  lastReviewed?: Date;
  reviewCount?: number;
  correctCount?: number;
  incorrectCount?: number;
}

export interface VocabularyExample {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  audioUrl?: string;
}

export interface MasteryLevel {
  level: 'new' | 'learning' | 'familiar' | 'mastered';
  confidence: number; // 0-100
  lastUpdated: Date;
}

export interface VocabularyCardProps {
  vocabulary: VocabularyItem;
  onAnswer?: (correct: boolean, timeSpent: number) => void;
  onFlip?: () => void;
  showAnswer?: boolean;
  autoReveal?: boolean;
  autoRevealDelay?: number;
  enableHaptics?: boolean;
  showMastery?: boolean;
  showProgress?: boolean;
}

export interface VocabularyStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  accuracy: number;
  averageResponseTime: number;
  studyStreak: number;
}

export interface VocabularyFilter {
  hskLevel?: number[];
  category?: string[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  mastery?: ('new' | 'learning' | 'familiar' | 'mastered')[];
  tone?: number[];
}

export interface VocabularySearchParams {
  query?: string;
  filter?: VocabularyFilter;
  sortBy?: 'hanzi' | 'pinyin' | 'difficulty' | 'mastery' | 'lastReviewed';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
} 