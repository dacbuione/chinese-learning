import { ViewStyle } from 'react-native';

// Core writing interfaces
export interface StrokePath {
  id: string;
  path: string;
  points: { x: number; y: number }[];
  timestamp: number;
  order: number;
}

export interface CharacterStroke {
  id: string;
  path: string;
  order: number;
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'curve' | 'hook' | 'dot';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  controlPoints?: { x: number; y: number }[];
}

export interface WritingCharacter {
  character: string;
  pinyin: string;
  vietnamese: string;
  english: string;
  strokes: CharacterStroke[];
  strokeCount: number;
  radical?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hskLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

// Writing practice interfaces
export interface WritingSession {
  id: string;
  characterId: string;
  startTime: number;
  endTime?: number;
  userStrokes: StrokePath[];
  accuracy: number;
  completionTime: number;
  attempts: number;
  isCompleted: boolean;
}

export interface WritingProgress {
  characterId: string;
  totalAttempts: number;
  bestAccuracy: number;
  averageAccuracy: number;
  fastestTime: number;
  lastPracticed: number;
  masteryLevel: 'learning' | 'practicing' | 'mastered';
  streakDays: number;
}

export interface WritingAssessment {
  strokeAccuracy: number;
  strokeOrderAccuracy: number;
  proportionAccuracy: number;
  speedScore: number;
  overallScore: number;
  feedback: string[];
  suggestions: string[];
}

// Component props interfaces
export interface WritingPadProps {
  targetCharacter?: string;
  strokeOrder?: string[];
  onStrokeComplete?: (stroke: StrokePath, strokeIndex: number) => void;
  onCharacterComplete?: (character: string, strokes: StrokePath[], score: number) => void;
  showStrokeOrder?: boolean;
  showGuidelines?: boolean;
  strokeWidth?: number;
  canvasSize?: number;
  variant?: 'practice' | 'assessment' | 'free' | 'guided';
  disabled?: boolean;
  autoPlay?: boolean;
  playbackSpeed?: number;
  onScoreCalculated?: (score: number) => void;
  style?: ViewStyle;
}

export interface StrokeOrderGuideProps {
  strokes: string[];
  currentStroke: number;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
  strokeWidth?: number;
  guideColor?: string;
  animationSpeed?: number;
}

export interface WritingCanvasProps {
  width: number;
  height: number;
  strokes: StrokePath[];
  currentStroke?: string;
  guidelines?: boolean;
  reference?: string;
  onStrokeStart?: (point: { x: number; y: number }) => void;
  onStrokeMove?: (point: { x: number; y: number }) => void;
  onStrokeEnd?: (stroke: StrokePath) => void;
  disabled?: boolean;
}

// Writing exercise interfaces
export interface WritingExercise {
  id: string;
  title: string;
  description: string;
  characters: WritingCharacter[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  objectives: string[];
  instructions: string[];
}

export interface WritingLesson {
  id: string;
  title: string;
  description: string;
  exercises: WritingExercise[];
  prerequisites?: string[];
  learningOutcomes: string[];
  culturalNotes?: string[];
}

// Writing analytics interfaces
export interface WritingAnalytics {
  totalCharactersPracticed: number;
  totalStrokesDrawn: number;
  averageAccuracy: number;
  totalPracticeTime: number;
  improvementRate: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendedPractice: string[];
}

export interface WritingStats {
  daily: {
    date: string;
    charactersCompleted: number;
    averageAccuracy: number;
    practiceTime: number;
  }[];
  weekly: {
    week: string;
    totalCharacters: number;
    averageAccuracy: number;
    totalTime: number;
    improvement: number;
  }[];
  monthly: {
    month: string;
    charactersLearned: number;
    charactersMastered: number;
    averageAccuracy: number;
    totalTime: number;
  }[];
}

// Gesture and interaction interfaces
export interface GestureState {
  isDrawing: boolean;
  currentPath: string;
  startPoint?: { x: number; y: number };
  lastPoint?: { x: number; y: number };
  strokeStartTime?: number;
}

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
  pressure?: number;
}

export interface StrokeMetrics {
  length: number;
  duration: number;
  averageSpeed: number;
  smoothness: number;
  pressure: number[];
}

// Configuration interfaces
export interface WritingConfig {
  strokeWidth: number;
  canvasSize: number;
  guidelineColor: string;
  strokeColor: string;
  referenceOpacity: number;
  animationSpeed: number;
  feedbackDelay: number;
  autoAdvance: boolean;
  showHints: boolean;
}

export interface WritingTheme {
  canvasBackground: string;
  strokeColor: string;
  guidelineColor: string;
  referenceColor: string;
  highlightColor: string;
  errorColor: string;
  successColor: string;
}

// Error and validation interfaces
export interface WritingError {
  type: 'stroke_order' | 'stroke_direction' | 'proportion' | 'position' | 'incomplete';
  message: string;
  strokeIndex?: number;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: WritingError[];
  warnings: WritingError[];
  score: number;
  feedback: string;
}

// Export types for external use
export type WritingVariant = WritingPadProps['variant'];
export type WritingDifficulty = WritingCharacter['difficulty'];
export type MasteryLevel = WritingProgress['masteryLevel'];
export type StrokeDirection = CharacterStroke['direction'];
export type ErrorType = WritingError['type'];
export type ErrorSeverity = WritingError['severity']; 