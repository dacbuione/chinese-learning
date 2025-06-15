import React, { useCallback, useMemo } from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Import theme and utilities
import { colors } from '../../../../theme/colors';
import { getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../theme';
import { useTranslation } from '../../../../localization';

// Import types
import type { 
  ButtonProps, 
  ButtonStyles, 
  ButtonVariant, 
  ButtonSize, 
  ButtonState 
} from './Button.types';

// Animated components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Enhanced Button Component for Chinese Learning App
 * 
 * Features:
 * - 5 variants: primary, secondary, outline, ghost, gradient
 * - 4 sizes: sm, md, lg, xl
 * - 5 states: default, loading, disabled, success, error
 * - Smooth animations with Reanimated
 * - Chinese learning specific features
 * - Responsive design
 * - Accessibility support
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  state = 'default',
  fullWidth = false,
  icon,
  loadingText,
  successText,
  errorText,
  animation = { pressAnimation: true, pressScale: 0.95, duration: 150 },
  style,
  textStyle,
  testID,
  accessibilityLabel,
  toneColor,
  hskLevel,
  audioFeedback = false,
  hapticFeedback = true,
  xpReward,
  celebrationAnimation = false,
  onPress,
  disabled,
  ...pressableProps
}) => {
  const { t } = useTranslation();
  
  // Animation values
  const pressScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);
  const successScale = useSharedValue(1);

  // Determine if button is disabled
  const isDisabled = disabled || state === 'disabled' || state === 'loading';
  
  // Get dynamic content based on state
  const getContent = useCallback(() => {
    switch (state) {
      case 'loading':
        return loadingText || 'Đang tải...';
      case 'success':
        return successText || 'Chính xác!';
      case 'error':
        return errorText || 'Sai rồi!';
      default:
        return children;
    }
  }, [state, loadingText, successText, errorText, children]);

  // Button styles based on props
  const buttonStyles = useMemo((): ButtonStyles => {
    const baseSpacing = getResponsiveSpacing('md');
    const baseFontSize = getResponsiveFontSize('base');
    
    // Size configurations
    const sizeConfig = {
      sm: {
        height: Layout.isMobile ? 32 : 36,
        paddingHorizontal: getResponsiveSpacing('sm'),
        fontSize: getResponsiveFontSize('sm'),
      },
      md: {
        height: Layout.isMobile ? 44 : 48,
        paddingHorizontal: getResponsiveSpacing('md'),
        fontSize: getResponsiveFontSize('base'),
      },
      lg: {
        height: Layout.isMobile ? 52 : 56,
        paddingHorizontal: getResponsiveSpacing('lg'),
        fontSize: getResponsiveFontSize('lg'),
      },
      xl: {
        height: Layout.isMobile ? 60 : 64,
        paddingHorizontal: getResponsiveSpacing('xl'),
        fontSize: getResponsiveFontSize('xl'),
      },
    };

    const currentSize = sizeConfig[size];

    // Base container style
    let containerStyle: any = {
      height: currentSize.height,
      paddingHorizontal: currentSize.paddingHorizontal,
      borderRadius: Layout.isMobile ? 12 : 16,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      minWidth: currentSize.height, // Ensure square buttons are possible
      ...(fullWidth && { width: '100%' }),
    };

    // Text style
    let textStyleBase: any = {
      fontSize: currentSize.fontSize,
      fontWeight: '600' as const,
      textAlign: 'center' as const,
      letterSpacing: 0.5,
    };

    // Variant-specific styles
    switch (variant) {
      case 'primary':
        containerStyle = {
          ...containerStyle,
          backgroundColor: toneColor || colors.primary[500],
          shadowColor: colors.neutral[900],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
        textStyleBase.color = colors.neutral[50];
        break;

      case 'secondary':
        containerStyle = {
          ...containerStyle,
          backgroundColor: colors.secondary[500],
          shadowColor: colors.neutral[900],
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 2,
          elevation: 2,
        };
        textStyleBase.color = colors.neutral[900];
        break;

      case 'outline':
        containerStyle = {
          ...containerStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: toneColor || colors.primary[500],
        };
        textStyleBase.color = toneColor || colors.primary[500];
        break;

      case 'ghost':
        containerStyle = {
          ...containerStyle,
          backgroundColor: 'transparent',
        };
        textStyleBase.color = toneColor || colors.primary[500];
        break;

      case 'gradient':
        // Will be handled by LinearGradient wrapper
        containerStyle = {
          ...containerStyle,
          backgroundColor: 'transparent',
        };
        textStyleBase.color = colors.neutral[50];
        break;
    }

    // State-specific modifications
    switch (state) {
      case 'disabled':
        containerStyle.opacity = 0.5;
        break;
      case 'success':
        if (variant === 'primary' || variant === 'gradient') {
          containerStyle.backgroundColor = colors.accent[500];
        }
        textStyleBase.color = variant === 'outline' || variant === 'ghost' 
          ? colors.accent[500] 
          : colors.neutral[50];
        break;
      case 'error':
        if (variant === 'primary' || variant === 'gradient') {
          containerStyle.backgroundColor = colors.error[500];
        }
        textStyleBase.color = variant === 'outline' || variant === 'ghost'
          ? colors.error[500]
          : colors.neutral[50];
        break;
    }

    // HSK level styling override
    if (hskLevel && colors.hsk) {
      const hskColor = colors.hsk[`hsk${hskLevel}` as keyof typeof colors.hsk];
      if (variant === 'primary') {
        containerStyle.backgroundColor = hskColor;
      } else if (variant === 'outline' || variant === 'ghost') {
        containerStyle.borderColor = hskColor;
        textStyleBase.color = hskColor;
      }
    }

    return {
      container: containerStyle,
      content: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: getResponsiveSpacing('xs'),
      },
      text: textStyleBase,
      icon: {
        marginRight: icon?.position === 'left' ? getResponsiveSpacing('xs') : 0,
        marginLeft: icon?.position === 'right' ? getResponsiveSpacing('xs') : 0,
      },
      loadingSpinner: {
        marginRight: getResponsiveSpacing('xs'),
      },
      ripple: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: containerStyle.borderRadius,
        backgroundColor: colors.neutral[50],
        opacity: 0,
      },
    };
  }, [variant, size, state, fullWidth, toneColor, hskLevel, icon]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value * successScale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
  }));

  // Handle press with animations and feedback
  const handlePress = useCallback((event: any) => {
    if (isDisabled || !onPress) return;

    // Haptic feedback
    if (hapticFeedback && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Press animation
    if (animation.pressAnimation) {
      pressScale.value = withSpring(animation.pressScale || 0.95, {
        duration: animation.duration || 150,
        dampingRatio: 0.8,
      }, () => {
        pressScale.value = withSpring(1, {
          duration: animation.duration || 150,
          dampingRatio: 0.8,
        });
      });
    }

    // Ripple effect
    if (animation.ripple) {
      rippleOpacity.value = withTiming(0.2, { duration: 150 }, () => {
        rippleOpacity.value = withTiming(0, { duration: 300 });
      });
    }

    // Success celebration animation
    if (celebrationAnimation && state === 'success') {
      successScale.value = withSpring(1.1, { duration: 200 }, () => {
        successScale.value = withSpring(1, { duration: 200 });
      });
    }

    // Call the actual onPress handler
    runOnJS(onPress)(event);
  }, [
    isDisabled, 
    onPress, 
    hapticFeedback, 
    animation, 
    celebrationAnimation, 
    state,
    pressScale,
    rippleOpacity,
    successScale,
  ]);

  // Render loading spinner
  const renderLoadingSpinner = () => {
    if (state !== 'loading') return null;
    
    return (
      <ActivityIndicator
        size="small"
        color={
          variant === 'outline' || variant === 'ghost'
            ? (toneColor || colors.primary[500])
            : colors.neutral[50]
        }
        style={buttonStyles.loadingSpinner}
      />
    );
  };

  // Render icon
  const renderIcon = () => {
    if (!icon || state === 'loading') return null;
    
    // For now, return a placeholder - in real app, use icon library
    return (
      <View style={buttonStyles.icon}>
        <Text style={{
          fontSize: (icon.size || buttonStyles.text.fontSize || 16) * 1.2,
          color: icon.color || buttonStyles.text.color,
        }}>
          {icon.name}
        </Text>
      </View>
    );
  };

  // Render button content
  const renderContent = () => (
    <View style={buttonStyles.content}>
      {icon?.position === 'left' && renderIcon()}
      {renderLoadingSpinner()}
      <Text 
        style={[buttonStyles.text, textStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {getContent()}
      </Text>
      {icon?.position === 'right' && renderIcon()}
    </View>
  );

  // Render button with or without gradient
  const renderButton = () => {
    const buttonContent = (
      <AnimatedPressable
        style={[
          buttonStyles.container,
          animatedStyle,
          style,
        ]}
        onPress={handlePress}
        disabled={isDisabled}
        testID={testID}
        accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
          busy: state === 'loading',
        }}
        {...pressableProps}
      >
        {/* Ripple effect */}
        {animation?.ripple && (
          <Animated.View style={[buttonStyles.ripple, rippleStyle]} />
        )}
        
        {renderContent()}
      </AnimatedPressable>
    );

    // Wrap with gradient for gradient variant
    if (variant === 'gradient') {
      const gradientColors: string[] = 
        state === 'success'
          ? [colors.accent[500], colors.accent[600] || colors.accent[500]]
          : state === 'error'
          ? [colors.error[500], colors.error[600] || colors.error[500]]
          : hskLevel && colors.hsk
          ? [
              colors.hsk[`hsk${hskLevel}` as keyof typeof colors.hsk],
              colors.hsk[`hsk${hskLevel}` as keyof typeof colors.hsk],
            ]
          : [colors.primary[500], colors.secondary[500]];

      return (
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            buttonStyles.container,
            style,
          ]}
        >
          <AnimatedPressable
            style={[
              { flex: 1, justifyContent: 'center', alignItems: 'center' },
              animatedStyle,
            ]}
            onPress={handlePress}
            disabled={isDisabled}
            testID={testID}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={{
              disabled: isDisabled,
              busy: state === 'loading',
            }}
            {...pressableProps}
          >
            {/* Ripple effect */}
            {animation?.ripple && (
              <Animated.View style={[buttonStyles.ripple, rippleStyle]} />
            )}
            
            {renderContent()}
          </AnimatedPressable>
        </LinearGradient>
      );
    }

    return buttonContent;
  };

  return renderButton();
}; 