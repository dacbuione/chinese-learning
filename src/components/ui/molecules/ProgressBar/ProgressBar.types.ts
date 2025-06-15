import type { ViewStyle, TextStyle } from 'react-native';

/**
 * Progress bar variants for different use cases
 */
export type ProgressBarVariant = 
  | 'linear'      // Standard linear progress bar
  | 'circular'    // Circular progress indicator
  | 'segmented'   // Multi-segment progress
  | 'hsk'         // HSK level progress
  | 'mastery'     // Skill mastery progress
  | 'streaks'     // Daily streak visualization
  | 'xp'          // Experience points progress
  | 'buffer';     // Progress with buffer/loading

/**
 * Progress bar sizes
 */
export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Progress bar themes
 */
export type ProgressBarTheme = 
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'chinese'
  | 'hsk'
  | 'tone'
  | 'gradient';

/**
 * Animation types
 */
export type ProgressBarAnimation = 'none' | 'smooth' | 'spring' | 'bounce';

/**
 * Custom colors configuration
 */
export interface ProgressBarColors {
  background?: string;
  fill?: string;
  buffer?: string;
  text?: string;
  accent?: string;
}

/**
 * Segment configuration for segmented progress
 */
export interface SegmentConfig {
  id: string;
  label?: string;
  weight?: number;
  completed: boolean;
  current?: boolean;
  color?: string;
}

/**
 * Milestone configuration
 */
export interface MilestoneConfig {
  position: number; // 0-1
  label?: string;
  icon?: string;
  achieved?: boolean;
  color?: string;
}

/**
 * HSK Level configuration
 */
export interface HSKLevelConfig {
  currentLevel: 1 | 2 | 3 | 4 | 5 | 6;
  charactersLearned: number;
  charactersNeeded: number;
  wordsMastered: number;
  grammarPoints: number;
  nextLevelProgress: number; // 0-1
}

/**
 * Mastery configuration for skills
 */
export interface MasteryConfig {
  skill: string;
  icon: string;
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5; // 0=Beginner, 5=Master
  xp: number;
  nextLevelXP: number;
  progress: number; // 0-1
}

/**
 * Streak configuration
 */
export interface StreakConfig {
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: boolean[]; // 7 days, true = completed
  todayMinutes: number;
  dailyGoal: number;
  streakGoal: number;
}

/**
 * XP configuration
 */
export interface XPConfig {
  currentXP: number;
  currentLevel: number;
  nextLevelXP: number;
  todayXP: number;
  dailyXPGoal: number;
  totalXP: number;
  levelProgress: number; // 0-1
}

/**
 * Progress bar state
 */
export interface ProgressBarState {
  progress: number;
  isAnimating: boolean;
  animationProgress: number;
  bufferProgress?: number;
  hasError: boolean;
  errorMessage?: string;
}

/**
 * Progress bar analytics
 */
export interface ProgressBarAnalytics {
  variant: ProgressBarVariant;
  initialProgress: number;
  finalProgress: number;
  milestonesReached: MilestoneConfig[];
  segmentsInteracted: string[];
  completionAchieved: boolean;
  animationDuration: number;
  timestamp: Date;
}

/**
 * Progress bar styles
 */
export interface ProgressBarStyles {
  container: ViewStyle;
  progressContainer: ViewStyle;
  progressTrack: ViewStyle;
  progressFill: ViewStyle;
  progressBuffer: ViewStyle;
  labelContainer: ViewStyle;
  label: TextStyle;
  percentage: TextStyle;
  segmentsContainer: ViewStyle;
  segment: ViewStyle;
  segmentCompleted: ViewStyle;
  segmentCurrent: ViewStyle;
  milestonesContainer: ViewStyle;
  milestone: ViewStyle;
  milestoneIcon: TextStyle;
  milestoneLabel: TextStyle;
  hskContainer: ViewStyle;
  hskLevel: TextStyle;
  hskProgress: TextStyle;
  masteryContainer: ViewStyle;
  masteryLabel: TextStyle;
  masteryLevel: ViewStyle;
  masteryBar: ViewStyle;
  streakContainer: ViewStyle;
  streakNumber: TextStyle;
  streakDays: ViewStyle;
  streakDay: ViewStyle;
  streakDayActive: ViewStyle;
  xpContainer: ViewStyle;
  xpCurrent: TextStyle;
  xpNext: TextStyle;
  xpBar: ViewStyle;
  circularContainer: ViewStyle;
  circularTrack: ViewStyle;
  circularProgress: ViewStyle;
  circularLabel: TextStyle;
  completionOverlay: ViewStyle;
  completionText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
}

/**
 * Main ProgressBar component props
 */
export interface ProgressBarProps {
  progress: number; // 0-100
  height?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'tone1' | 'tone2' | 'tone3' | 'tone4' | 'gradient';
  animated?: boolean;
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom';
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
  secondaryProgress?: number;
  steps?: string[];
  style?: any;
  testID?: string;
}

/**
 * ProgressBar component ref methods
 */
export interface ProgressBarRef {
  updateProgress: (progress: number, animated?: boolean) => void;
  reset: () => void;
  complete: () => void;
  getProgress: () => number;
  getState: () => ProgressBarState;
  getAnalytics: () => ProgressBarAnalytics;
}

/**
 * Progress bar hook return type
 */
export interface UseProgressBarReturn {
  progress: number;
  isAnimating: boolean;
  updateProgress: (progress: number, animated?: boolean) => void;
  reset: () => void;
  complete: () => void;
  state: ProgressBarState;
  analytics: ProgressBarAnalytics;
}

/**
 * Progress calculation utilities
 */
export interface ProgressCalculator {
  calculateHSKProgress: (config: HSKLevelConfig) => number;
  calculateMasteryProgress: (config: MasteryConfig) => number;
  calculateStreakProgress: (config: StreakConfig) => number;
  calculateXPProgress: (config: XPConfig) => number;
  calculateOverallProgress: (configs: {
    hsk?: HSKLevelConfig;
    mastery?: MasteryConfig[];
    streak?: StreakConfig;
    xp?: XPConfig;
  }) => number;
}

/**
 * Progress bar preset configurations
 */
export interface ProgressBarPresets {
  dailyGoal: Partial<ProgressBarProps>;
  hskLevel: Partial<ProgressBarProps>;
  skillMastery: Partial<ProgressBarProps>;
  weeklyStreak: Partial<ProgressBarProps>;
  xpProgress: Partial<ProgressBarProps>;
  lessonProgress: Partial<ProgressBarProps>;
  overallProgress: Partial<ProgressBarProps>;
}

/**
 * Progress bar accessibility props
 */
export interface ProgressBarA11yProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityValue?: {
    min: number;
    max: number;
    now: number;
    text?: string;
  };
  accessibilityRole?: 'progressbar';
}

/**
 * Extended props with accessibility
 */
export interface ProgressBarPropsWithA11y extends ProgressBarProps, ProgressBarA11yProps {}

// All types are already exported inline above 