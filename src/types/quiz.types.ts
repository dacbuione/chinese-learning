export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'audio-recognition';
  question: string;
  hanzi?: string;
  pinyin?: string;
  audioUrl?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hskLevel: number;
  category: string;
  points: number;
}

export interface QuizResult {
  questionId: string;
  selectedAnswer: string | number;
  correctAnswer: string | number;
  correct: boolean;
  responseTime: number;
  points: number;
  timestamp: Date;
}

export interface QuizComponentProps {
  questions: QuizQuestion[];
  onComplete?: (results: QuizSession) => void;
  onQuestionAnswer?: (result: QuizResult) => void;
  timeLimit?: number; // in seconds
  showProgress?: boolean;
  showFeedback?: boolean;
  allowReview?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

export interface QuizSession {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  questions: QuizQuestion[];
  results: QuizResult[];
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpent: number;
  completed: boolean;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  averageAccuracy: number;
  averageTimePerQuestion: number;
  bestScore: number;
  categoryStats: {
    [category: string]: {
      quizzes: number;
      averageScore: number;
      accuracy: number;
    };
  };
  difficultyStats: {
    beginner: QuizDifficultyStats;
    intermediate: QuizDifficultyStats;
    advanced: QuizDifficultyStats;
  };
  streakDays: number;
}

export interface QuizDifficultyStats {
  quizzes: number;
  averageScore: number;
  accuracy: number;
  averageTime: number;
}

export interface QuizConfig {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  timeLimit?: number;
  passingScore: number;
  allowRetake: boolean;
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
}

export interface QuizProgress {
  configId: string;
  attempts: number;
  bestScore: number;
  averageScore: number;
  lastAttempt: Date;
  passed: boolean;
  mastery: 'new' | 'learning' | 'familiar' | 'mastered';
}

export interface QuizFilter {
  category?: string[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  hskLevel?: number[];
  questionType?: ('multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'audio-recognition')[];
  completed?: boolean;
  passed?: boolean;
}

export interface QuizSearchParams {
  query?: string;
  filter?: QuizFilter;
  sortBy?: 'title' | 'difficulty' | 'score' | 'lastAttempt' | 'category';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
} 