import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { TranslationText } from '../../atoms/Text';
import { colors, Layout, getResponsiveSpacing } from '../../../../theme';
import { ProgressBarProps } from './ProgressBar.types';

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'md',
  variant = 'default',
  animated = true,
  showLabel = false,
  labelPosition = 'top',
  color,
  backgroundColor,
  showPercentage = false,
  label,
  secondaryProgress,
  steps,
  style,
  testID,
}) => {
  const progressValue = Math.min(Math.max(progress, 0), 100);
  const secondaryValue = secondaryProgress ? Math.min(Math.max(secondaryProgress, 0), 100) : 0;
  
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const secondaryAnimatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progressValue,
        duration: 500,
        useNativeDriver: false,
      }).start();

      if (secondaryProgress) {
        Animated.timing(secondaryAnimatedValue, {
          toValue: secondaryValue,
          duration: 500,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [progressValue, secondaryValue, animated]);

  const getHeightValue = () => {
    const heights = {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
    };
    return heights[height];
  };

  const getProgressColor = () => {
    if (color) return color;
    
    switch (variant) {
      case 'success':
        return colors.accent[500];
      case 'warning':
        return colors.warning[500];
      case 'error':
        return colors.error[500];
      case 'info':
        return colors.info[500];
      case 'tone1':
        return colors.tones.tone1;
      case 'tone2':
        return colors.tones.tone2;
      case 'tone3':
        return colors.tones.tone3;
      case 'tone4':
        return colors.tones.tone4;
      default:
        return colors.primary[500];
    }
  };

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    return colors.neutral[200];
  };

  const renderLabel = () => {
    if (!showLabel && !showPercentage) return null;

    const labelText = label || (showPercentage ? `${Math.round(progressValue)}%` : '');
    if (!labelText) return null;

    return (
      <View style={[
        styles.labelContainer,
        labelPosition === 'bottom' && styles.labelBottom
      ]}>
        <TranslationText size="sm" weight="medium" color={colors.neutral[600]}>
          {labelText}
        </TranslationText>
      </View>
    );
  };

  const renderSteps = () => {
    if (!steps || steps.length === 0) return null;

    return (
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View
            key={index}
            style={[
              styles.step,
              {
                backgroundColor: index <= (progressValue / 100) * (steps.length - 1)
                  ? getProgressColor()
                  : getBackgroundColor(),
                width: `${100 / steps.length}%`,
                height: getHeightValue(),
              }
            ]}
          />
        ))}
      </View>
    );
  };

  if (steps && steps.length > 0) {
    return (
      <View style={[styles.container, style]} testID={testID}>
        {labelPosition === 'top' && renderLabel()}
        {renderSteps()}
        {labelPosition === 'bottom' && renderLabel()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      {labelPosition === 'top' && renderLabel()}
      
      <View style={[
        styles.track,
        {
          height: getHeightValue(),
          backgroundColor: getBackgroundColor(),
          borderRadius: getHeightValue() / 2,
        }
      ]}>
        {/* Secondary progress (e.g., buffered content) */}
        {secondaryProgress && (
          <Animated.View
            style={[
              styles.secondaryFill,
              {
                width: animated
                  ? secondaryAnimatedValue.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    })
                  : `${secondaryValue}%`,
                height: getHeightValue(),
                backgroundColor: colors.neutral[300],
                borderRadius: getHeightValue() / 2,
              }
            ]}
          />
        )}
        
        {/* Primary progress */}
        <Animated.View
          style={[
            styles.fill,
            {
              width: animated
                ? animatedValue.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  })
                : `${progressValue}%`,
              height: getHeightValue(),
              backgroundColor: getProgressColor(),
              borderRadius: getHeightValue() / 2,
            }
          ]}
        />

        {/* Gradient overlay for enhanced variants */}
        {variant === 'gradient' && (
          <View style={[
            styles.gradientOverlay,
            {
              height: getHeightValue(),
              borderRadius: getHeightValue() / 2,
            }
          ]} />
        )}
      </View>
      
      {labelPosition === 'bottom' && renderLabel()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xs'),
  },
  labelBottom: {
    marginBottom: 0,
    marginTop: getResponsiveSpacing('xs'),
  },
  track: {
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  secondaryFill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    backgroundColor: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
  },
  stepsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  step: {
    borderRadius: 2,
  },
}); 