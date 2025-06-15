export interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  tone: number;
  vietnamese: string;
  english: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  lessonId: string;
  audioUrl?: string;
  strokeOrder?: string[];
  hskLevel?: number;
  radicals?: string[];
  examples?: VocabularyExample[];
  synonyms?: string[];
  antonyms?: string[];
  tags?: string[];
  frequency?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VocabularyExample {
  id: string;
  chinese: string;
  pinyin: string;
  vietnamese: string;
  english: string;
  audioUrl?: string;
}

export interface VocabularyProgress {
  vocabularyId: string;
  correct: number;
  total: number;
  streak: number;
  masteryLevel: 'learning' | 'reviewing' | 'mastered';
  lastReviewed?: Date;
  nextReview?: Date;
  easiness: number;
  interval: number;
  repetitions: number;
}

export interface VocabularyCardProps {
  vocabulary: VocabularyItem;
  onPress?: (vocabulary: VocabularyItem) => void;
  onAudioPress?: (audioUrl: string) => void;
  onToggleFavorite?: (id: string) => void;
  variant?: 'default' | 'compact' | 'quiz' | 'practice';
  showProgress?: boolean;
  isFavorite?: boolean;
  progress?: {
    correct: number;
    total: number;
    streak: number;
  };
  style?: any;
}

export interface VocabularyListProps {
  vocabularies: VocabularyItem[];
  onSelectVocabulary: (vocabulary: VocabularyItem) => void;
  onPlayAudio?: (audioUrl: string) => void;
  onToggleFavorite?: (id: string) => void;
  variant?: 'default' | 'compact' | 'grid';
  showProgress?: boolean;
  loading?: boolean;
}

export interface VocabularySearchProps {
  onSearch: (query: string, filters?: VocabularySearchFilters) => void;
  onClear?: () => void;
  placeholder?: string;
  showFilters?: boolean;
}

export interface VocabularySearchFilters {
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  category?: string[];
  tone?: number[];
  hskLevel?: number[];
  masteryLevel?: ('learning' | 'reviewing' | 'mastered')[];
}

export interface VocabularyQuizProps {
  vocabularies: VocabularyItem[];
  quizType: 'hanzi-to-vietnamese' | 'vietnamese-to-hanzi' | 'pinyin-to-hanzi' | 'tone-practice';
  onComplete: (score: number, results: VocabularyQuizResult[]) => void;
  timeLimit?: number;
  shuffle?: boolean;
}

export interface VocabularyQuizResult {
  vocabularyId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface VocabularyStats {
  totalLearned: number;
  totalMastered: number;
  currentStreak: number;
  bestStreak: number;
  accuracy: number;
  averageSessionTime: number;
  dailyGoal: number;
  dailyProgress: number;
  weeklyProgress: {
    date: string;
    learned: number;
    reviewed: number;
  }[];
}

// Hook return types
export interface UseVocabularyReturn {
  vocabulary: VocabularyItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  playAudio: (audioUrl: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

export interface UseVocabularyProgressReturn {
  progress: Record<string, VocabularyProgress>;
  updateProgress: (vocabularyId: string, isCorrect: boolean) => void;
  getProgress: (vocabularyId: string) => VocabularyProgress | undefined;
  resetProgress: (vocabularyId: string) => void;
  isLoading: boolean;
  error: string | null;
}

export interface UseVocabularySearchReturn {
  searchQuery: string;
  searchResults: VocabularyItem[];
  filters: VocabularySearchFilters;
  isSearching: boolean;
  search: (query: string) => void;
  setFilters: (filters: VocabularySearchFilters) => void;
  clearSearch: () => void;
}

// Service types
export interface VocabularyService {
  getVocabularyByLesson(lessonId: string): Promise<VocabularyItem[]>;
  getVocabularyById(id: string): Promise<VocabularyItem>;
  searchVocabulary(query: string, filters?: VocabularySearchFilters): Promise<VocabularyItem[]>;
  getFavoriteVocabulary(): Promise<VocabularyItem[]>;
  toggleFavorite(vocabularyId: string): Promise<void>;
  playAudio(audioUrl: string): Promise<void>;
  getVocabularyStats(): Promise<VocabularyStats>;
  updateProgress(vocabularyId: string, isCorrect: boolean): Promise<VocabularyProgress>;
}

// Redux slice types
export interface VocabularyState {
  items: VocabularyItem[];
  favorites: string[];
  progress: Record<string, VocabularyProgress>;
  searchResults: VocabularyItem[];
  searchQuery: string;
  filters: VocabularySearchFilters;
  stats: VocabularyStats | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
}
