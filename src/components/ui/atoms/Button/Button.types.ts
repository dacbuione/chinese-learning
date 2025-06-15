import { ViewStyle, TextStyle, PressableProps } from 'react-native';

/**
 * Enhanced Button variants for Chinese learning app
 */
export type ButtonVariant =
  | 'primary'     // Main actions (học tập, luyện tập)
  | 'secondary'   // Secondary actions (skip, back)
  | 'outline'     // Outlined buttons (cancel, more options)
  | 'ghost'       // Minimal buttons (icon buttons, links)
  | 'gradient';   // Special gradient buttons (achievements, premium)

/**
 * Button sizes with Chinese text optimization
 */
export type ButtonSize =
  | 'sm'          // Small: 32px height, compact text
  | 'md'          // Medium: 44px height, standard size
  | 'lg'          // Large: 52px height, prominent actions
  | 'xl';         // Extra large: 60px height, hero buttons

/**
 * Button states for interactive feedback
 */
export type ButtonState =
  | 'default'     // Normal state
  | 'loading'     // Loading with spinner
  | 'disabled'    // Disabled state
  | 'success'     // Success state (correct answers)
  | 'error';      // Error state (incorrect answers)

/**
 * Icon configuration for buttons
 */
export interface ButtonIcon {
  /** Icon name from icon library */
  name: string;
  /** Icon position relative to text */
  position?: 'left' | 'right';
  /** Icon size override */
  size?: number;
  /** Icon color override */
  color?: string;
}

/**
 * Animation configuration for button interactions
 */
export interface ButtonAnimation {
  /** Enable press animation */
  pressAnimation?: boolean;
  /** Scale factor for press animation (default: 0.95) */
  pressScale?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Enable ripple effect */
  ripple?: boolean;
  /** Ripple color */
  rippleColor?: string;
}

/**
 * Enhanced Button component props
 */
export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  /**
   * Button content - can be string or React element
   */
  children: React.ReactNode;

  /**
   * Button visual variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Current button state
   * @default 'default'
   */
  state?: ButtonState;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Icon configuration
   */
  icon?: ButtonIcon;

  /**
   * Loading text (displayed during loading state)
   */
  loadingText?: string;

  /**
   * Success text (displayed during success state)
   */
  successText?: string;

  /**
   * Error text (displayed during error state)
   */
  errorText?: string;

  /**
   * Animation configuration
   */
  animation?: ButtonAnimation;

  /**
   * Custom style overrides
   */
  style?: ViewStyle;

  /**
   * Custom text style overrides
   */
  textStyle?: TextStyle;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Chinese learning specific props
   */
  
  /**
   * Tone color override (for pronunciation buttons)
   */
  toneColor?: string;

  /**
   * HSK level styling (for level-based buttons)
   */
  hskLevel?: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Audio feedback on press
   */
  audioFeedback?: boolean;

  /**
   * Haptic feedback on press
   */
  hapticFeedback?: boolean;

  /**
   * XP reward for button action
   */
  xpReward?: number;

  /**
   * Celebration animation on success
   */
  celebrationAnimation?: boolean;
}

/**
 * Internal button styles interface
 */
export interface ButtonStyles {
  container: ViewStyle;
  content: ViewStyle;
  text: TextStyle;
  icon: ViewStyle;
  loadingSpinner: ViewStyle;
  ripple: ViewStyle;
} 