import { TextInputProps, ViewStyle, TextStyle } from 'react-native';

/**
 * Enhanced Input variants for Chinese learning app
 */
export type InputVariant =
  | 'default'     // Standard input
  | 'outlined'    // Outlined border input
  | 'filled'      // Filled background input
  | 'underlined'  // Underlined input
  | 'search';     // Search input with icon

/**
 * Input sizes with Chinese text optimization
 */
export type InputSize =
  | 'sm'          // Small: 32px height
  | 'md'          // Medium: 44px height, standard size
  | 'lg'          // Large: 52px height
  | 'xl';         // Extra large: 60px height

/**
 * Input states for interactive feedback
 */
export type InputState =
  | 'default'     // Normal state
  | 'focused'     // Focused state
  | 'error'       // Error state
  | 'success'     // Success state
  | 'disabled';   // Disabled state

/**
 * Chinese input methods
 */
export type ChineseInputMethod =
  | 'pinyin'      // Pinyin input with tone marks
  | 'english'     // English/Vietnamese input
  | 'mixed'       // Mixed input (pinyin + characters)
  | 'character';  // Direct character input

/**
 * Icon configuration for inputs
 */
export interface InputIcon {
  /** Icon name from icon library */
  name: string;
  /** Icon position relative to input */
  position?: 'left' | 'right';
  /** Icon size override */
  size?: number;
  /** Icon color override */
  color?: string;
  /** Icon press handler */
  onPress?: () => void;
}

/**
 * Input validation configuration
 */
export interface InputValidation {
  /** Is field required */
  required?: boolean;
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Custom validation pattern */
  pattern?: RegExp;
  /** Custom validation function */
  validator?: (value: string) => boolean | string;
  /** Real-time validation */
  validateOnChange?: boolean;
}

/**
 * Chinese-specific input features
 */
export interface ChineseInputFeatures {
  /** Enable tone marks in pinyin */
  toneMarks?: boolean;
  /** Show tone indicators */
  showTones?: boolean;
  /** Enable pinyin suggestions */
  pinyinSuggestions?: boolean;
  /** Character limit for Chinese text */
  chineseCharLimit?: number;
  /** Pronunciation feedback */
  pronunciationFeedback?: boolean;
  /** Character stroke order hints */
  strokeOrderHints?: boolean;
}

/**
 * Enhanced Input component props
 */
export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Input visual variant
   * @default 'default'
   */
  variant?: InputVariant;

  /**
   * Input size
   * @default 'md'
   */
  size?: InputSize;

  /**
   * Current input state
   * @default 'default'
   */
  state?: InputState;

  /**
   * Full width input
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Left icon configuration
   */
  leftIcon?: InputIcon;

  /**
   * Right icon configuration
   */
  rightIcon?: InputIcon;

  /**
   * Helper text below input
   */
  helperText?: string;

  /**
   * Error message
   */
  errorMessage?: string;

  /**
   * Success message
   */
  successMessage?: string;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Clear button
   */
  clearable?: boolean;

  /**
   * Validation configuration
   */
  validation?: InputValidation;

  /**
   * Chinese input method
   * @default 'english'
   */
  inputMethod?: ChineseInputMethod;

  /**
   * Chinese-specific features
   */
  chineseFeatures?: ChineseInputFeatures;

  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;

  /**
   * Custom input style
   */
  inputStyle?: TextStyle;

  /**
   * Custom label style
   */
  labelStyle?: TextStyle;

  /**
   * Custom helper text style
   */
  helperTextStyle?: TextStyle;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Input change handler with validation
   */
  onChangeText?: (text: string, isValid?: boolean) => void;

  /**
   * Focus event handler
   */
  onFocus?: () => void;

  /**
   * Blur event handler
   */
  onBlur?: () => void;

  /**
   * Clear button press handler
   */
  onClear?: () => void;

  /**
   * Chinese character selection handler
   */
  onChineseCharacterSelect?: (character: string, pinyin: string, tone: number) => void;

  /**
   * Tone selection handler for pinyin input
   */
  onToneSelect?: (tone: 1 | 2 | 3 | 4 | 0) => void;
}

/**
 * Internal input styles interface
 */
export interface InputStyles {
  container: ViewStyle;
  inputContainer: ViewStyle;
  input: TextStyle;
  label: TextStyle;
  helperText: TextStyle;
  errorText: TextStyle;
  successText: TextStyle;
  leftIcon: ViewStyle;
  rightIcon: ViewStyle;
  clearButton: ViewStyle;
  loadingSpinner: ViewStyle;
  chineseSuggestions: ViewStyle;
  toneIndicators: ViewStyle;
} 