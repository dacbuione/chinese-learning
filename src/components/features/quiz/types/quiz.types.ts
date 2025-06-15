export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  hint?: string;
  audioUrl?: string;
  imageUrl?: string;
  tone?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  points?: number;
  timeLimit?: number;
}

export interface QuizResult {
  question: QuizQuestion;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
  timeSpent?: number;
}

export interface QuizComponentProps {
  questions: QuizQuestion[];
  quizType?: 'multiple-choice' | 'hanzi-to-vietnamese' | 'vietnamese-to-hanzi' | 'pinyin-to-hanzi' | 'tone-identification';
  onComplete?: (score: number, correct: number, total: number, results: QuizResult[]) => void;
  onQuestionAnswered?: (question: QuizQuestion, answer: string, isCorrect: boolean) => void;
  timeLimit?: number;
  allowSkip?: boolean;
  showProgress?: boolean;
  showResults?: boolean;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  variant?: 'default' | 'compact' | 'timed';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  maxQuestions?: number;
}

export interface QuizSession {
  id: string;
  userId: string;
  quizType: string;
  difficulty: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  startTime: Date;
  endTime?: Date;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completed: boolean;
}

export interface QuizStatistics {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  strongAreas: string[];
  weakAreas: string[];
  improvementTrend: {
    date: string;
    score: number;
  }[];
  accuracyByType: Record<string, number>;
  accuracyByDifficulty: Record<string, number>;
}

export interface QuizSettings {
  defaultTimeLimit: number;
  allowSkip: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showHints: boolean;
  showExplanations: boolean;
  enableSound: boolean;
  enableVibration: boolean;
  autoAdvance: boolean;
  questionCount: number;
}

export interface MultipleChoiceQuizProps extends Omit<QuizComponentProps, 'quizType'> {
  quizType: 'multiple-choice';
  optionsCount?: 2 | 3 | 4;
}

export interface VocabularyQuizProps extends Omit<QuizComponentProps, 'quizType'> {
  quizType: 'hanzi-to-vietnamese' | 'vietnamese-to-hanzi';
  vocabularyItems: VocabularyQuizItem[];
}

export interface ToneQuizProps extends Omit<QuizComponentProps, 'quizType'> {
  quizType: 'tone-identification';
  toneExamples: ToneQuizItem[];
}

export interface VocabularyQuizItem {
  id: string;
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  english: string;
  tone: number;
  difficulty: string;
  category: string;
  audioUrl?: string;
}

export interface ToneQuizItem {
  id: string;
  character: string;
  pinyin: string;
  tone: number;
  vietnamese: string;
  audioUrl?: string;
  difficulty: string;
}

export interface QuizGeneratorConfig {
  quizType: string;
  difficulty: string;
  questionCount: number;
  categories?: string[];
  includeAudio?: boolean;
  includeImages?: boolean;
  timeLimit?: number;
  vocabularyPool?: VocabularyQuizItem[];
  tonePool?: ToneQuizItem[];
}

export interface AdaptiveQuizConfig {
  initialDifficulty: string;
  adjustmentThreshold: number;
  maxDifficultyLevel: number;
  minDifficultyLevel: number;
  learningRate: number;
}

export interface QuizFeedback {
  type: 'correct' | 'incorrect' | 'skipped' | 'timeout';
  message: string;
  explanation?: string;
  encouragement?: string;
  suggestion?: string;
  relatedConcepts?: string[];
}

export interface QuizAnalytics {
  sessionId: string;
  userId: string;
  timestamp: Date;
  event: 'quiz_started' | 'question_answered' | 'quiz_completed' | 'quiz_abandoned';
  data: Record<string, any>;
}

// Hook return types
export interface UseQuizReturn {
  currentQuestion: QuizQuestion | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  progress: number;
  score: number;
  isCompleted: boolean;
  timeLeft: number | null;
  nextQuestion: () => void;
  previousQuestion: () => void;
  answerQuestion: (answer: string) => void;
  skipQuestion: () => void;
  restartQuiz: () => void;
  getResults: () => QuizResult[];
}

export interface UseQuizGeneratorReturn {
  generateQuiz: (config: QuizGeneratorConfig) => Promise<QuizQuestion[]>;
  isGenerating: boolean;
  error: string | null;
}

export interface UseQuizStatisticsReturn {
  statistics: QuizStatistics | null;
  isLoading: boolean;
  error: string | null;
  updateStatistics: (results: QuizResult[]) => Promise<void>;
  resetStatistics: () => Promise<void>;
}

// Service types
export interface QuizService {
  generateQuestions(config: QuizGeneratorConfig): Promise<QuizQuestion[]>;
  saveQuizSession(session: QuizSession): Promise<void>;
  getQuizHistory(userId: string): Promise<QuizSession[]>;
  getQuizStatistics(userId: string): Promise<QuizStatistics>;
  updateProgress(userId: string, results: QuizResult[]): Promise<void>;
  getRecommendations(userId: string): Promise<QuizGeneratorConfig[]>;
}

// Redux state types
export interface QuizState {
  currentQuiz: QuizSession | null;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string>;
  results: QuizResult[];
  statistics: QuizStatistics | null;
  settings: QuizSettings;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
} 