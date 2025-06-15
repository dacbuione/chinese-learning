import { ViewStyle, TextStyle } from 'react-native';

/**
 * Loading animation variants
 */
export type LoadingVariant =
  | 'spinner'     // Classic spinner animation
  | 'dots'        // Bouncing dots animation
  | 'pulse'       // Pulsing circle animation
  | 'bars'        // Animated bars
  | 'chinese'     // Chinese character animation
  | 'skeleton';   // Skeleton loading

/**
 * Loading sizes
 */
export type LoadingSize =
  | 'xs'          // Extra small: 16px
  | 'sm'          // Small: 24px
  | 'md'          // Medium: 32px
  | 'lg'          // Large: 48px
  | 'xl';         // Extra large: 64px

/**
 * Loading color themes
 */
export type LoadingColorTheme =
  | 'primary'     // Primary app colors
  | 'secondary'   // Secondary colors
  | 'neutral'     // Neutral colors
  | 'accent'      // Accent colors
  | 'tone'        // Chinese tone colors
  | 'custom';     // Custom colors

/**
 * Custom color configuration
 */
export interface LoadingCustomColors {
  /** Primary color for animation */
  primary?: string;
  /** Secondary color for animation */
  secondary?: string;
  /** Background color */
  background?: string;
  /** Text color */
  text?: string;
}

/**
 * Animation configuration
 */
export interface LoadingAnimationConfig {
  /** Animation duration in milliseconds */
  duration?: number;
  /** Animation delay between elements */
  delay?: number;
  /** Repeat animation infinitely */
  repeat?: boolean;
  /** Animation easing function */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  /** Animation direction */
  direction?: 'normal' | 'reverse' | 'alternate';
}

/**
 * Chinese character animation configuration
 */
export interface ChineseLoadingConfig {
  /** Characters to animate through */
  characters?: string[];
  /** Show pinyin below characters */
  showPinyin?: boolean;
  /** Pinyin for each character */
  pinyin?: string[];
  /** Character rotation animation */
  rotate?: boolean;
  /** Character scale animation */
  scale?: boolean;
  /** Stroke order animation */
  strokeOrder?: boolean;
}

/**
 * Skeleton loading configuration
 */
export interface SkeletonConfig {
  /** Number of skeleton lines */
  lines?: number;
  /** Width of each line (percentage or fixed) */
  lineWidths?: (string | number)[];
  /** Width of skeleton */
  width?: string | number;
  /** Height of skeleton lines */
  lineHeight?: number;
  /** Height of skeleton */
  height?: number;
  /** Spacing between lines */
  spacing?: number;
  /** Show avatar skeleton */
  avatar?: boolean;
  /** Avatar size */
  avatarSize?: number;
  /** Shimmer animation */
  shimmer?: boolean;
}

/**
 * Enhanced Loading component props
 */
export interface LoadingProps {
  /**
   * Loading animation variant
   * @default 'spinner'
   */
  variant?: LoadingVariant;

  /**
   * Loading size
   * @default 'md'
   */
  size?: LoadingSize;

  /**
   * Color theme
   * @default 'primary'
   */
  colorTheme?: LoadingColorTheme;

  /**
   * Custom colors (used when colorTheme is 'custom')
   */
  customColors?: LoadingCustomColors;

  /**
   * Loading text to display
   */
  text?: string;

  /**
   * Show loading text
   * @default false
   */
  showText?: boolean;

  /**
   * Text position relative to loading animation
   * @default 'bottom'
   */
  textPosition?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Center the loading component
   * @default true
   */
  center?: boolean;

  /**
   * Full screen overlay
   * @default false
   */
  overlay?: boolean;

  /**
   * Overlay background color
   */
  overlayColor?: string;

  /**
   * Overlay opacity
   */
  overlayOpacity?: number;

  /**
   * Animation configuration
   */
  animationConfig?: LoadingAnimationConfig;

  /**
   * Chinese character animation config
   */
  chineseConfig?: ChineseLoadingConfig;

  /**
   * Skeleton loading config
   */
  skeletonConfig?: SkeletonConfig;

  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;

  /**
   * Custom text style
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
   * Loading state
   * @default true
   */
  loading?: boolean;

  /**
   * Children to show when not loading
   */
  children?: React.ReactNode;

  /**
   * Animation start callback
   */
  onAnimationStart?: () => void;

  /**
   * Animation end callback
   */
  onAnimationEnd?: () => void;
}

/**
 * Internal loading styles interface
 */
export interface LoadingStyles {
  container: ViewStyle;
  overlay: ViewStyle;
  loadingContainer: ViewStyle;
  animationContainer: ViewStyle;
  text: TextStyle;
  textContainer: ViewStyle;
  spinner: ViewStyle;
  dotsContainer: ViewStyle;
  dot: ViewStyle;
  pulseCircle: ViewStyle;
  barsContainer: ViewStyle;
  bar: ViewStyle;
  chineseContainer: ViewStyle;
  chineseCharacter: TextStyle;
  pinyinText: TextStyle;
  skeletonContainer: ViewStyle;
  skeletonShimmer: ViewStyle;
  skeletonLine: ViewStyle;
  skeletonAvatar: ViewStyle;
} 