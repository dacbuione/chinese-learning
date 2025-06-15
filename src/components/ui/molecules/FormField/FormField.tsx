import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TEMPORARILY DISABLED - FormField has infinite loop issues
// This is a placeholder to prevent import errors

// Import components
import { Input } from '../../atoms/Input';

// Import theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, device } from '../../../../theme';

// Simple FormField Props
interface SimpleFormFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  error?: string;
  success?: string;
  helpText?: string;
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
}

/**
 * Simple FormField Component - No Infinite Loops
 * 
 * Features:
 * - Label and input field
 * - Error and success states
 * - Help text
 * - Responsive design
 * - Simple state management
 */
export const FormField: React.FC<SimpleFormFieldProps> = ({
  label,
  placeholder,
  value,
  defaultValue = '',
  required = false,
  disabled = false,
  readOnly = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  secureTextEntry = false,
  error,
  success,
  helpText,
  containerStyle,
  inputStyle,
  labelStyle,
  onChangeText,
  onFocus,
  onBlur,
  onSubmitEditing,
}) => {
  // Simple state
  const [internalValue, setInternalValue] = useState(value || defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  // Handle value change
  const handleChangeText = useCallback((text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
  }, [onChangeText]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  // Determine current state
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;
  const currentValue = value !== undefined ? value : internalValue;

  // Render label
  const renderLabel = () => {
    if (!label) return null;

    return (
      <View style={styles.labelContainer}>
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.requiredIndicator}> *</Text>}
        </Text>
      </View>
    );
  };

  // Render error message
  const renderError = () => {
    if (!hasError) return null;

    return (
      <View style={styles.messageContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  };

  // Render success message
  const renderSuccess = () => {
    if (!hasSuccess) return null;

    return (
      <View style={styles.messageContainer}>
        <Text style={styles.successText}>✅ {success}</Text>
      </View>
    );
  };

  // Render help text
  const renderHelpText = () => {
    if (!helpText || hasError || hasSuccess) return null;

    return (
      <View style={styles.messageContainer}>
        <Text style={styles.helpText}>💡 {helpText}</Text>
      </View>
    );
  };

  // Render character counter
  const renderCharacterCounter = () => {
    if (!maxLength) return null;

    const count = currentValue.length;
    const isNearLimit = count >= maxLength * 0.8;
    const isOverLimit = count > maxLength;

    return (
      <View style={styles.counterContainer}>
        <Text style={[
          styles.counterText,
          isOverLimit && styles.counterError,
          isNearLimit && !isOverLimit && styles.counterWarning,
        ]}>
          {count}/{maxLength}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderLabel()}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        hasError && styles.inputContainerError,
        hasSuccess && styles.inputContainerSuccess,
        disabled && styles.inputContainerDisabled,
      ]}>
        <Input
          value={currentValue}
          placeholder={placeholder}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          editable={!disabled && !readOnly}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          containerStyle={inputStyle || styles.input}
        />
      </View>

      {renderError()}
      {renderSuccess()}
      {renderHelpText()}
      {renderCharacterCounter()}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: getResponsiveSpacing('md'),
  },
  labelContainer: {
    marginBottom: getResponsiveSpacing('xs'),
  },
  label: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[700],
  },
  requiredIndicator: {
    color: colors.primary[500],
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: device.isMobile ? 8 : 12,
    backgroundColor: colors.neutral[50],
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.primary[500], // Using primary as error color
    borderWidth: 2,
  },
  inputContainerSuccess: {
    borderColor: colors.accent[500],
    borderWidth: 2,
  },
  inputContainerDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },
  input: {
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  messageContainer: {
    marginTop: getResponsiveSpacing('xs'),
  },
  errorText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
  },
  successText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.accent[600],
  },
  helpText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  counterContainer: {
    alignItems: 'flex-end',
    marginTop: getResponsiveSpacing('xs'),
  },
  counterText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[500],
  },
  counterWarning: {
    color: colors.secondary[600],
  },
  counterError: {
    color: colors.primary[600],
  },
});

export default FormField; 