export interface WritingCharacter {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  strokes: CharacterStroke[];
  strokeCount: number;
  radical: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hskLevel: number;
}

export interface CharacterStroke {
  id: string;
  path: string; // SVG path data
  order: number;
  type: StrokeType;
  direction: StrokeDirection;
  startPoint: Point;
  endPoint: Point;
  controlPoints?: Point[];
}

export interface StrokePath {
  path: string;
  order: number;
  completed: boolean;
  accuracy?: number;
}

export interface Point {
  x: number;
  y: number;
}

export type StrokeType = 
  | 'horizontal' // 一
  | 'vertical' // 丨
  | 'left-falling' // 丿
  | 'right-falling' // 丶
  | 'rising' // 丶
  | 'turning' // 乛
  | 'hook' // 亅
  | 'complex'; // 复合笔画

export type StrokeDirection = 
  | 'left-to-right'
  | 'right-to-left' 
  | 'top-to-bottom'
  | 'bottom-to-top'
  | 'clockwise'
  | 'counter-clockwise';

export interface WritingPadProps {
  character: WritingCharacter;
  onStrokeComplete?: (stroke: DrawnStroke, accuracy: number) => void;
  onCharacterComplete?: (accuracy: number, timeSpent: number) => void;
  showGuides?: boolean;
  showStrokeOrder?: boolean;
  enableFeedback?: boolean;
  strokeWidth?: number;
  canvasSize?: { width: number; height: number };
}

export interface DrawnStroke {
  id: string;
  path: Point[];
  timestamp: number;
  duration: number;
  accuracy: number;
  matchedStroke?: CharacterStroke;
}

export interface StrokeOrderProps {
  character: WritingCharacter;
  currentStroke?: number;
  showAnimation?: boolean;
  animationSpeed?: number;
  onStrokeSelect?: (strokeIndex: number) => void;
  highlightColor?: string;
  completedColor?: string;
  pendingColor?: string;
}

export interface WritingSession {
  id: string;
  characterId: string;
  startTime: Date;
  endTime?: Date;
  strokes: DrawnStroke[];
  accuracy: number;
  completed: boolean;
  timeSpent: number; // in milliseconds
}

export interface WritingStats {
  totalCharacters: number;
  completedCharacters: number;
  averageAccuracy: number;
  averageTimePerCharacter: number;
  totalPracticeTime: number;
  streakDays: number;
  masteredStrokes: StrokeType[];
}

export interface WritingProgress {
  characterId: string;
  attempts: number;
  bestAccuracy: number;
  averageAccuracy: number;
  lastPracticed: Date;
  mastery: 'new' | 'learning' | 'familiar' | 'mastered';
} 