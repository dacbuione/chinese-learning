import { StyleSheet } from 'react-native';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../theme';
import { ButtonVariant, ButtonSize } from './Button.types';

export const createButtonStyles = (variant: ButtonVariant, size: ButtonSize, fullWidth?: boolean) => {
  const baseStyles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Layout.isMobile ? 8 : 12,
      borderWidth: 1,
      minHeight: 44, // Minimum touch target
      paddingHorizontal: getResponsiveSpacing('md'),
      paddingVertical: getResponsiveSpacing('sm'),
      width: fullWidth ? '100%' : 'auto',
    },
    buttonText: {
      fontWeight: '600',
      textAlign: 'center',
    },
    disabled: {
      opacity: 0.5,
    },
    loading: {
      opacity: 0.7,
    },
    leftIcon: {
      marginRight: getResponsiveSpacing('xs'),
    },
    rightIcon: {
      marginLeft: getResponsiveSpacing('xs'),
    },
  });

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    secondary: {
      backgroundColor: colors.secondary[500],
      borderColor: colors.secondary[500],
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary[500],
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.error[500],
      borderColor: colors.error[500],
    },
  };

  // Text color variants
  const textColorVariants = {
    primary: colors.neutral[50],
    secondary: colors.neutral[50],
    outline: colors.primary[500],
    ghost: colors.primary[500],
    danger: colors.neutral[50],
  };

  // Size styles
  const sizeStyles = {
    sm: {
      paddingHorizontal: getResponsiveSpacing('sm'),
      paddingVertical: getResponsiveSpacing('xs'),
      minHeight: 32,
    },
    md: {
      paddingHorizontal: getResponsiveSpacing('md'),
      paddingVertical: getResponsiveSpacing('sm'),
      minHeight: 44,
    },
    lg: {
      paddingHorizontal: getResponsiveSpacing('lg'),
      paddingVertical: getResponsiveSpacing('md'),
      minHeight: 52,
    },
    xl: {
      paddingHorizontal: getResponsiveSpacing('xl'),
      paddingVertical: getResponsiveSpacing('lg'),
      minHeight: 60,
    },
  };

  // Font size per size
  const fontSizes = {
    sm: getResponsiveFontSize('sm'),
    md: getResponsiveFontSize('base'),
    lg: getResponsiveFontSize('lg'),
    xl: getResponsiveFontSize('xl'),
  };

  return {
    button: [
      baseStyles.button,
      variantStyles[variant],
      sizeStyles[size],
    ],
    buttonText: [
      baseStyles.buttonText,
      {
        color: textColorVariants[variant],
        fontSize: fontSizes[size],
      },
    ],
    disabled: baseStyles.disabled,
    loading: baseStyles.loading,
    leftIcon: baseStyles.leftIcon,
    rightIcon: baseStyles.rightIcon,
  };
}; 