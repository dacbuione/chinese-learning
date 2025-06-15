import { ViewStyle, TextStyle } from 'react-native';
import { InputProps } from '../../atoms/Input/Input.types';

/**
 * Form field validation rule
 */
export interface ValidationRule {
  /** Rule type */
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'chinese' | 'pinyin' | 'custom';
  /** Rule value (for minLength, maxLength, pattern) */
  value?: any;
  /** Error message */
  message: string;
  /** Custom validation function */
  validator?: (value: string) => boolean;
}

/**
 * Chinese-specific validation rules
 */
export interface ChineseValidationRules {
  /** Validate Chinese characters only */
  chineseOnly?: boolean;
  /** Validate pinyin format */
  pinyinFormat?: boolean;
  /** Validate tone marks */
  toneMarks?: boolean;
  /** Validate HSK level characters */
  hskLevel?: number;
  /** Validate stroke count range */
  strokeRange?: { min: number; max: number };
  /** Validate radical presence */
  hasRadical?: string[];
}

/**
 * Form field state
 */
export interface FormFieldState {
  /** Current value */
  value: string;
  /** Is field focused */
  isFocused: boolean;
  /** Is field valid */
  isValid: boolean;
  /** Is field touched (user interacted) */
  isTouched: boolean;
  /** Is field dirty (value changed) */
  isDirty: boolean;
  /** Current error message */
  error?: string;
  /** Validation in progress */
  isValidating?: boolean;
}

/**
 * Form field help text configuration
 */
export interface HelpTextConfig {
  /** Help text content */
  text: string;
  /** Help text type */
  type?: 'info' | 'warning' | 'success' | 'error';
  /** Show help text conditionally */
  showWhen?: 'always' | 'focus' | 'error' | 'success';
  /** Help text icon */
  icon?: string;
  /** Help text action */
  action?: {
    text: string;
    onPress: () => void;
  };
}

/**
 * Form field character counter configuration
 */
export interface CharacterCounterConfig {
  /** Enable character counter */
  enabled?: boolean;
  /** Maximum character count */
  maxCount?: number;
  /** Show counter when */
  showWhen?: 'always' | 'focus' | 'near-limit';
  /** Near limit threshold (percentage) */
  nearLimitThreshold?: number;
  /** Count Chinese characters differently */
  chineseCharacterWeight?: number;
}

/**
 * Form field suggestion configuration
 */
export interface FieldSuggestionConfig {
  /** Enable suggestions */
  enabled?: boolean;
  /** Suggestion data source */
  suggestions?: string[];
  /** Dynamic suggestion function */
  getSuggestions?: (value: string) => Promise<string[]>;
  /** Maximum suggestions to show */
  maxSuggestions?: number;
  /** Show suggestions when */
  showWhen?: 'focus' | 'typing' | 'always';
  /** Chinese-specific suggestions */
  chineseSuggestions?: {
    pinyinToCharacter?: boolean;
    characterToMeaning?: boolean;
    relatedWords?: boolean;
  };
}

/**
 * Enhanced FormField component props
 */
export interface FormFieldProps extends Omit<InputProps, 'onChangeText' | 'onFocus' | 'onBlur'> {
  /**
   * Field label
   */
  label?: string;

  /**
   * Field name/identifier
   */
  name?: string;

  /**
   * Field value
   */
  value?: string;

  /**
   * Default value
   */
  defaultValue?: string;

  /**
   * Field placeholder
   */
  placeholder?: string;

  /**
   * Is field required
   * @default false
   */
  required?: boolean;

  /**
   * Is field disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Is field read-only
   * @default false
   */
  readOnly?: boolean;

  /**
   * Validation rules
   */
  rules?: ValidationRule[];

  /**
   * Chinese-specific validation
   */
  chineseValidation?: ChineseValidationRules;

  /**
   * Help text configuration
   */
  helpText?: HelpTextConfig;

  /**
   * Character counter configuration
   */
  characterCounter?: CharacterCounterConfig;

  /**
   * Field suggestions configuration
   */
  suggestions?: FieldSuggestionConfig;

  /**
   * Show validation on change
   * @default true
   */
  validateOnChange?: boolean;

  /**
   * Show validation on blur
   * @default true
   */
  validateOnBlur?: boolean;

  /**
   * Debounce validation delay (ms)
   * @default 300
   */
  validationDelay?: number;

  /**
   * Custom error message
   */
  error?: string;

  /**
   * Success message
   */
  success?: string;

  /**
   * Show field state icons
   * @default true
   */
  showStateIcons?: boolean;

  /**
   * Custom label style
   */
  labelStyle?: TextStyle;

  /**
   * Custom error style
   */
  errorStyle?: TextStyle;

  /**
   * Custom help text style
   */
  helpTextStyle?: TextStyle;

  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;

  /**
   * Value change handler
   */
  onValueChange?: (value: string, fieldState: FormFieldState) => void;

  /**
   * Field focus handler
   */
  onFocus?: (fieldState: FormFieldState) => void;

  /**
   * Field blur handler
   */
  onBlur?: (fieldState: FormFieldState) => void;

  /**
   * Validation complete handler
   */
  onValidation?: (isValid: boolean, error?: string) => void;

  /**
   * Field state change handler
   */
  onStateChange?: (fieldState: FormFieldState) => void;

  /**
   * Suggestion selection handler
   */
  onSuggestionSelect?: (suggestion: string) => void;
}

/**
 * Internal FormField styles interface
 */
export interface FormFieldStyles {
  container: ViewStyle;
  labelContainer: ViewStyle;
  label: TextStyle;
  requiredIndicator: TextStyle;
  inputContainer: ViewStyle;
  input: ViewStyle;
  stateIcon: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  errorIcon: ViewStyle;
  successContainer: ViewStyle;
  successText: TextStyle;
  successIcon: ViewStyle;
  helpContainer: ViewStyle;
  helpText: TextStyle;
  helpIcon: ViewStyle;
  helpAction: ViewStyle;
  helpActionText: TextStyle;
  counterContainer: ViewStyle;
  counterText: TextStyle;
  counterWarning: TextStyle;
  counterError: TextStyle;
  suggestionsContainer: ViewStyle;
  suggestionsList: ViewStyle;
  suggestionItem: ViewStyle;
  suggestionText: TextStyle;
  chineseSuggestion: ViewStyle;
  chineseCharacter: TextStyle;
  pinyinText: TextStyle;
  meaningText: TextStyle;
}

/**
 * Form field validation result
 */
export interface ValidationResult {
  /** Is field valid */
  isValid: boolean;
  /** Error message (if invalid) */
  error?: string;
  /** Validation metadata */
  metadata?: {
    /** Validation rule that failed */
    failedRule?: ValidationRule;
    /** Chinese validation details */
    chineseValidation?: {
      characterCount?: number;
      pinyinValid?: boolean;
      toneMarksValid?: boolean;
      hskLevelValid?: boolean;
      strokeCountValid?: boolean;
    };
  };
} 