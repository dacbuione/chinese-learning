import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { CardProps } from './Card.types';
import { colors, Layout } from '../../../../theme';
import { getResponsiveSpacing } from '../../../../theme/responsive';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  borderRadius = 'lg',
  style,
  onPress,
  disabled = false,
  testID,
}) => {
  const cardStyle = getCardStyle(variant, size, borderRadius);
  
  const Component = onPress ? TouchableOpacity : View;
  const touchableProps = onPress ? {
    onPress,
    disabled,
    activeOpacity: 0.95,
    testID,
  } : { testID };

  if (variant === 'glass') {
    return (
      <BlurView intensity={20} style={[cardStyle, style]}>
        <Component style={styles.glassContent} {...touchableProps}>
          {children}
        </Component>
      </BlurView>
    );
  }

  return (
    <Component 
      style={[
        cardStyle,
        disabled && styles.disabled,
        style
      ]} 
      {...touchableProps}
    >
      {children}
    </Component>
  );
};

const getCardStyle = (variant: CardProps['variant'], size: CardProps['size'], borderRadius: CardProps['borderRadius']) => {
  const baseStyle = {
    ...styles.base,
    ...getSizeStyle(size!),
    ...getBorderRadiusStyle(borderRadius!),
  };

  switch (variant) {
    case 'elevated':
      return { ...baseStyle, ...styles.elevated };
    case 'outlined':
      return { ...baseStyle, ...styles.outlined };
    case 'filled':
      return { ...baseStyle, ...styles.filled };
    case 'glass':
      return { ...baseStyle, ...styles.glass };
    default:
      return { ...baseStyle, ...styles.default };
  }
};

const getSizeStyle = (size: CardProps['size']) => {
  const sizes = {
    sm: {
      padding: getResponsiveSpacing('sm'),
      minHeight: 80,
    },
    md: {
      padding: getResponsiveSpacing('md'),
      minHeight: 100,
    },
    lg: {
      padding: getResponsiveSpacing('lg'),
      minHeight: 120,
    },
    xl: {
      padding: getResponsiveSpacing('xl'),
      minHeight: 140,
    },
  };
  return sizes[size!];
};

const getBorderRadiusStyle = (borderRadius: CardProps['borderRadius']) => {
  const radii = {
    none: { borderRadius: 0 },
    sm: { borderRadius: Layout.isMobile ? 8 : 10 },
    md: { borderRadius: Layout.isMobile ? 12 : 14 },
    lg: { borderRadius: Layout.isMobile ? 16 : 20 },
    xl: { borderRadius: Layout.isMobile ? 24 : 28 },
    full: { borderRadius: 9999 },
  };
  return radii[borderRadius!];
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  
  // Variants
  default: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  elevated: {
    backgroundColor: colors.neutral[50],
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  
  filled: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  
  glassContent: {
    flex: 1,
  },
  
  disabled: {
    opacity: 0.5,
  },
}); 