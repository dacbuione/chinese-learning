import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

// Import theme and utilities
import { colors } from '@/theme/colors';
import { getResponsiveSpacing, getResponsiveFontSize, Layout } from '@/theme';

// Import types
import type { 
  InputProps, 
  InputStyles, 
  InputVariant, 
  InputSize, 
  InputState 
} from './Input.types';

// Animated components
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/**
 * Enhanced Input Component for Chinese Learning App
 * 
 * Features:
 * - 5 variants: default, outlined, filled, underlined, search
 * - 4 sizes: sm, md, lg, xl
 * - 5 states with animations
 * - Chinese input method support
 * - Real-time validation
 * - Responsive design
 * - Accessibility support
 */
export const Input: React.FC<InputProps> = ({
  label,
  variant = 'outlined',
  size = 'md',
  state = 'default',
  fullWidth = true,
  leftIcon,
  rightIcon,
  helperText,
  errorMessage,
  successMessage,
  loading = false,
  clearable = false,
  validation,
  inputMethod = 'english',
  chineseFeatures,
  containerStyle,
  inputStyle,
  labelStyle,
  helperTextStyle,
  testID,
  accessibilityLabel,
  onChangeText,
  onFocus,
  onBlur,
  onClear,
  onChineseCharacterSelect,
  onToneSelect,
  value,
  placeholder,
  editable = true,
  multiline = false,
  numberOfLines,
  maxLength,
  ...textInputProps
}) => {
  // Local state
  const [internalValue, setInternalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [showChineseSuggestions, setShowChineseSuggestions] = useState(false);

  // Refs
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const labelPosition = useSharedValue(internalValue || placeholder ? 1 : 0);
  const borderColor = useSharedValue(0);
  const focusScale = useSharedValue(1);

  // Determine current state
  const currentState = useMemo(() => {
    if (!editable) return 'disabled';
    if (errorMessage || validationMessage) return 'error';
    if (successMessage) return 'success';
    if (isFocused) return 'focused';
    return state;
  }, [editable, errorMessage, validationMessage, successMessage, isFocused, state]);

  // Validation function
  const validateInput = useCallback((text: string): { isValid: boolean; message: string } => {
    if (!validation) return { isValid: true, message: '' };

    // Required validation
    if (validation.required && !text.trim()) {
      return { isValid: false, message: 'Trường này là bắt buộc' };
    }

    // Min length validation
    if (validation.minLength && text.length < validation.minLength) {
      return { isValid: false, message: `Tối thiểu ${validation.minLength} ký tự` };
    }

    // Max length validation
    if (validation.maxLength && text.length > validation.maxLength) {
      return { isValid: false, message: `Tối đa ${validation.maxLength} ký tự` };
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(text)) {
      return { isValid: false, message: 'Định dạng không hợp lệ' };
    }

    // Custom validator
    if (validation.validator) {
      const result = validation.validator(text);
      if (typeof result === 'string') {
        return { isValid: false, message: result };
      }
      if (!result) {
        return { isValid: false, message: 'Giá trị không hợp lệ' };
      }
    }

    return { isValid: true, message: '' };
  }, [validation]);

  // Handle text change
  const handleChangeText = useCallback((text: string) => {
    setInternalValue(text);

    // Validation
    if (validation?.validateOnChange) {
      const validationResult = validateInput(text);
      setIsValid(validationResult.isValid);
      setValidationMessage(validationResult.message);
    }

    // Chinese input suggestions
    if (inputMethod === 'pinyin' && chineseFeatures?.pinyinSuggestions) {
      setShowChineseSuggestions(text.length > 0);
    }

    // Call parent handler
    onChangeText?.(text, isValid);
  }, [validation, validateInput, inputMethod, chineseFeatures, onChangeText, isValid]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    
    // Animate label
    labelPosition.value = withSpring(1, { duration: 200 });
    borderColor.value = withTiming(1, { duration: 200 });
    focusScale.value = withSpring(1.02, { duration: 150 });

    onFocus?.();
  }, [labelPosition, borderColor, focusScale, onFocus]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    
    // Animate label back if empty
    if (!internalValue && !placeholder) {
      labelPosition.value = withSpring(0, { duration: 200 });
    }
    borderColor.value = withTiming(0, { duration: 200 });
    focusScale.value = withSpring(1, { duration: 150 });

    // Final validation on blur
    if (validation && !validation.validateOnChange) {
      const validationResult = validateInput(internalValue);
      setIsValid(validationResult.isValid);
      setValidationMessage(validationResult.message);
    }

    setShowChineseSuggestions(false);
    onBlur?.();
  }, [internalValue, placeholder, labelPosition, borderColor, focusScale, validation, validateInput, onBlur]);

  // Handle clear
  const handleClear = useCallback(() => {
    setInternalValue('');
    setIsValid(true);
    setValidationMessage('');
    inputRef.current?.focus();
    onClear?.();
    onChangeText?.('', true);
  }, [onClear, onChangeText]);

  // Input styles based on props
  const inputStyles = useMemo((): InputStyles => {
    // Size configurations
    const sizeConfig = {
      sm: {
        height: Layout.isMobile ? 32 : 36,
        paddingHorizontal: getResponsiveSpacing('sm'),
        fontSize: getResponsiveFontSize('sm'),
        iconSize: 16,
      },
      md: {
        height: Layout.isMobile ? 44 : 48,
        paddingHorizontal: getResponsiveSpacing('md'),
        fontSize: getResponsiveFontSize('base'),
        iconSize: 20,
      },
      lg: {
        height: Layout.isMobile ? 52 : 56,
        paddingHorizontal: getResponsiveSpacing('lg'),
        fontSize: getResponsiveFontSize('lg'),
        iconSize: 24,
      },
      xl: {
        height: Layout.isMobile ? 60 : 64,
        paddingHorizontal: getResponsiveSpacing('xl'),
        fontSize: getResponsiveFontSize('xl'),
        iconSize: 28,
      },
    };

    const currentSize = sizeConfig[size];

    // Base container style
    const containerStyle: any = {
      width: fullWidth ? '100%' : 'auto',
      marginBottom: getResponsiveSpacing('md'),
    };

    // Input container style based on variant
    let inputContainerStyle: any = {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: currentSize.height,
      paddingHorizontal: currentSize.paddingHorizontal,
      backgroundColor: 'transparent',
    };

    // Variant-specific styles
    switch (variant) {
      case 'outlined':
        inputContainerStyle = {
          ...inputContainerStyle,
          borderWidth: 1,
          borderRadius: Layout.isMobile ? 8 : 12,
          borderColor: colors.neutral[300],
          backgroundColor: colors.neutral[50],
        };
        break;

      case 'filled':
        inputContainerStyle = {
          ...inputContainerStyle,
          backgroundColor: colors.neutral[100],
          borderRadius: Layout.isMobile ? 8 : 12,
          borderWidth: 0,
        };
        break;

      case 'underlined':
        inputContainerStyle = {
          ...inputContainerStyle,
          borderBottomWidth: 1,
          borderBottomColor: colors.neutral[300],
          borderRadius: 0,
          paddingHorizontal: 0,
        };
        break;

      case 'search':
        inputContainerStyle = {
          ...inputContainerStyle,
          backgroundColor: colors.neutral[100],
          borderRadius: Layout.isMobile ? 20 : 24,
          borderWidth: 0,
        };
        break;

      case 'default':
      default:
        inputContainerStyle = {
          ...inputContainerStyle,
          borderWidth: 1,
          borderColor: colors.neutral[300],
          borderRadius: Layout.isMobile ? 4 : 6,
        };
        break;
    }

    // State-specific color modifications
    switch (currentState) {
      case 'focused':
        if (variant === 'underlined') {
          inputContainerStyle.borderBottomColor = colors.primary[500];
          inputContainerStyle.borderBottomWidth = 2;
        } else {
          inputContainerStyle.borderColor = colors.primary[500];
          inputContainerStyle.borderWidth = variant === 'filled' ? 1 : inputContainerStyle.borderWidth;
        }
        break;

      case 'error':
        if (variant === 'underlined') {
          inputContainerStyle.borderBottomColor = colors.error[500];
          inputContainerStyle.borderBottomWidth = 2;
        } else {
          inputContainerStyle.borderColor = colors.error[500];
          inputContainerStyle.borderWidth = variant === 'filled' ? 1 : inputContainerStyle.borderWidth;
        }
        break;

      case 'success':
        if (variant === 'underlined') {
          inputContainerStyle.borderBottomColor = colors.accent[500];
          inputContainerStyle.borderBottomWidth = 2;
        } else {
          inputContainerStyle.borderColor = colors.accent[500];
          inputContainerStyle.borderWidth = variant === 'filled' ? 1 : inputContainerStyle.borderWidth;
        }
        break;

      case 'disabled':
        inputContainerStyle.opacity = 0.5;
        inputContainerStyle.backgroundColor = colors.neutral[100];
        break;
    }

    // Text input style
    const inputTextStyle: any = {
      flex: 1,
      fontSize: currentSize.fontSize,
      color: colors.neutral[900],
      fontFamily: inputMethod === 'pinyin' || inputMethod === 'character' ? 'System' : 'System',
      paddingVertical: Platform.OS === 'ios' ? getResponsiveSpacing('sm') : getResponsiveSpacing('xs'),
      textAlignVertical: multiline ? 'top' : 'center',
      minHeight: multiline ? currentSize.height * 2 : currentSize.height - (getResponsiveSpacing('sm') * 2),
    };

    // Chinese-specific font optimizations
    if (inputMethod === 'character' || inputMethod === 'mixed') {
      inputTextStyle.fontSize = Math.round(currentSize.fontSize * 1.1);
      inputTextStyle.lineHeight = Math.round(currentSize.fontSize * 1.3);
    }

    return {
      container: containerStyle,
      inputContainer: inputContainerStyle,
      input: inputTextStyle,
      label: {
        fontSize: getResponsiveFontSize('sm'),
        color: colors.neutral[700],
        marginBottom: getResponsiveSpacing('xs'),
        fontWeight: '500',
      },
      helperText: {
        fontSize: getResponsiveFontSize('xs'),
        color: colors.neutral[600],
        marginTop: getResponsiveSpacing('xs'),
        lineHeight: getResponsiveFontSize('xs') * 1.4,
      },
      errorText: {
        fontSize: getResponsiveFontSize('xs'),
        color: colors.error[500],
        marginTop: getResponsiveSpacing('xs'),
        lineHeight: getResponsiveFontSize('xs') * 1.4,
      },
      successText: {
        fontSize: getResponsiveFontSize('xs'),
        color: colors.accent[500],
        marginTop: getResponsiveSpacing('xs'),
        lineHeight: getResponsiveFontSize('xs') * 1.4,
      },
      leftIcon: {
        marginRight: getResponsiveSpacing('sm'),
        width: currentSize.iconSize,
        height: currentSize.iconSize,
        justifyContent: 'center',
        alignItems: 'center',
      },
      rightIcon: {
        marginLeft: getResponsiveSpacing('sm'),
        width: currentSize.iconSize,
        height: currentSize.iconSize,
        justifyContent: 'center',
        alignItems: 'center',
      },
      clearButton: {
        marginLeft: getResponsiveSpacing('xs'),
        width: currentSize.iconSize,
        height: currentSize.iconSize,
        borderRadius: currentSize.iconSize / 2,
        backgroundColor: colors.neutral[400],
        justifyContent: 'center',
        alignItems: 'center',
      },
      loadingSpinner: {
        marginLeft: getResponsiveSpacing('xs'),
        width: currentSize.iconSize,
        height: currentSize.iconSize,
      },
      chineseSuggestions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: colors.neutral[50],
        borderRadius: Layout.isMobile ? 8 : 12,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        maxHeight: 150,
        zIndex: 1000,
      },
      toneIndicators: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: getResponsiveSpacing('xs'),
        backgroundColor: colors.neutral[100],
        borderRadius: Layout.isMobile ? 6 : 8,
        marginTop: getResponsiveSpacing('xs'),
      },
    };
  }, [variant, size, currentState, fullWidth, inputMethod, multiline, Layout]);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
  }));

  // Render icons
  const renderIcon = (iconConfig: typeof leftIcon, position: 'left' | 'right') => {
    if (!iconConfig) return null;

    const iconStyle = position === 'left' ? inputStyles.leftIcon : inputStyles.rightIcon;

    return (
      <TouchableOpacity
        style={iconStyle}
        onPress={iconConfig.onPress}
        disabled={!iconConfig.onPress}
        activeOpacity={iconConfig.onPress ? 0.7 : 1}
      >
        <Text style={{
          fontSize: iconConfig.size || 20,
          color: iconConfig.color || colors.neutral[600],
        }}>
          {iconConfig.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render clear button
  const renderClearButton = () => {
    if (!clearable || !internalValue) return null;

    return (
      <TouchableOpacity
        style={inputStyles.clearButton}
        onPress={handleClear}
        activeOpacity={0.7}
      >
        <Text style={{
          fontSize: 16,
          color: colors.neutral[50],
        }}>
          ×
        </Text>
      </TouchableOpacity>
    );
  };

  // Render loading spinner
  const renderLoadingSpinner = () => {
    if (!loading) return null;

    return (
      <ActivityIndicator
        size="small"
        color={colors.primary[500]}
        style={inputStyles.loadingSpinner}
      />
    );
  };

  // Render helper/error/success message
  const renderMessage = () => {
    const message = errorMessage || validationMessage || successMessage || helperText;
    if (!message) return null;

    const messageStyle = errorMessage || validationMessage
      ? inputStyles.errorText
      : successMessage
      ? inputStyles.successText
      : inputStyles.helperText;

    return (
      <Text style={[messageStyle, helperTextStyle]}>
        {message}
      </Text>
    );
  };

  return (
    <AnimatedView style={[inputStyles.container, animatedContainerStyle, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[inputStyles.label, labelStyle]}>
          {label}
          {validation?.required && <Text style={{ color: colors.error[500] }}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={inputStyles.inputContainer}>
        {/* Left Icon */}
        {renderIcon(leftIcon, 'left')}

        {/* Text Input */}
        <AnimatedTextInput
          ref={inputRef}
          style={[inputStyles.input, inputStyle]}
          value={internalValue}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[500]}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
          accessibilityLabel={accessibilityLabel || label}
          editable={editable && !loading}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength || chineseFeatures?.chineseCharLimit}
          {...textInputProps}
        />

        {/* Right Icon */}
        {renderIcon(rightIcon, 'right')}

        {/* Clear Button */}
        {renderClearButton()}

        {/* Loading Spinner */}
        {renderLoadingSpinner()}
      </View>

      {/* Message */}
      {renderMessage()}

      {/* Chinese Tone Indicators */}
      {inputMethod === 'pinyin' && chineseFeatures?.showTones && (
        <View style={inputStyles.toneIndicators}>
          {[1, 2, 3, 4, 0].map((tone) => (
            <TouchableOpacity
              key={tone}
              onPress={() => onToneSelect?.(tone as any)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.tones?.[`tone${tone === 0 ? 'neutral' : tone}` as keyof typeof colors.tones] || colors.neutral[400],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.neutral[50], fontSize: 12, fontWeight: '600' }}>
                {tone === 0 ? '·' : tone}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </AnimatedView>
  );
}; 