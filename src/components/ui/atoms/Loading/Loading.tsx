import React, { useEffect, useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// Import theme and utilities
import { colors } from '../../../../theme/colors';
import { getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../theme';

// Import types
import type { LoadingProps, LoadingStyles } from './Loading.types';

// Animated components
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * Enhanced Loading Component for Chinese Learning App
 * 
 * Features:
 * - 6 different loading variants
 * - Chinese character animations
 * - Skeleton loading with shimmer
 * - Responsive design
 * - Custom colors and themes
 * - Smooth animations
 */
export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  colorTheme = 'primary',
  text,
  textPosition = 'bottom',
  showText = false,
  chineseConfig,
  skeletonConfig,
  customColors,
  containerStyle,
  textStyle,
  ...props
}) => {
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const shimmerX = useSharedValue(-1);

  // Chinese character animation values
  const char1Opacity = useSharedValue(0.3);
  const char2Opacity = useSharedValue(0.3);
  const char3Opacity = useSharedValue(0.3);
  const char1Scale = useSharedValue(0.8);
  const char2Scale = useSharedValue(0.8);
  const char3Scale = useSharedValue(0.8);

  // Get theme colors
  const themeColors = useMemo(() => {
    if (customColors) {
      return [customColors.primary || colors.primary[500], customColors.secondary || colors.primary[600]];
    }
    
    switch (colorTheme) {
      case 'primary':
        return [colors.primary[500], colors.primary[600]];
      case 'secondary':
        return [colors.secondary[500], colors.secondary[600]];
      case 'accent':
        return [colors.accent[500], colors.accent[600]];
      case 'neutral':
        return [colors.neutral[400], colors.neutral[500]];
      case 'tone':
        return [colors.tones.tone1, colors.primary[600]];
      default:
        return [colors.primary[500], colors.primary[600]];
    }
  }, [colorTheme, customColors]);

  // Size configurations
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'xs':
        return { 
          container: 16, 
          dot: 4, 
          text: getResponsiveFontSize('xs'),
          chinese: getResponsiveFontSize('lg'),
        };
      case 'sm':
        return { 
          container: 24, 
          dot: 6, 
          text: getResponsiveFontSize('sm'),
          chinese: getResponsiveFontSize('xl'),
        };
      case 'md':
        return { 
          container: 32, 
          dot: 8, 
          text: getResponsiveFontSize('base'),
          chinese: getResponsiveFontSize('2xl'),
        };
      case 'lg':
        return { 
          container: 48, 
          dot: 12, 
          text: getResponsiveFontSize('lg'),
          chinese: getResponsiveFontSize('3xl'),
        };
      case 'xl':
        return { 
          container: 64, 
          dot: 16, 
          text: getResponsiveFontSize('xl'),
          chinese: getResponsiveFontSize('4xl'),
        };
      default:
        return { 
          container: 32, 
          dot: 8, 
          text: getResponsiveFontSize('base'),
          chinese: getResponsiveFontSize('2xl'),
        };
    }
  }, [size]);

  // Start animations
  useEffect(() => {
    switch (variant) {
      case 'spinner':
        rotation.value = withRepeat(
          withTiming(360, { duration: 1000, easing: Easing.linear }),
          -1,
          false
        );
        break;

      case 'dots':
        const dotAnimation = () => {
          opacity.value = withSequence(
            withTiming(0.3, { duration: 300 }),
            withTiming(1, { duration: 300 }),
            withTiming(0.3, { duration: 300 })
          );
        };
        dotAnimation();
        const interval = setInterval(dotAnimation, 900);
        return () => clearInterval(interval);

      case 'pulse':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 600 }),
            withTiming(1, { duration: 600 })
          ),
          -1,
          false
        );
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 600 }),
            withTiming(1, { duration: 600 })
          ),
          -1,
          false
        );
        break;

      case 'bars':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 400 }),
            withTiming(0, { duration: 400 })
          ),
          -1,
          false
        );
        break;

      case 'chinese':
        // Animate Chinese characters in sequence
        const animateChineseChars = () => {
          char1Opacity.value = withSequence(
            withTiming(1, { duration: 300 }),
            withDelay(200, withTiming(0.3, { duration: 300 }))
          );
          char1Scale.value = withSequence(
            withTiming(1.1, { duration: 300 }),
            withDelay(200, withTiming(0.8, { duration: 300 }))
          );

          char2Opacity.value = withSequence(
            withDelay(300, withTiming(1, { duration: 300 })),
            withDelay(500, withTiming(0.3, { duration: 300 }))
          );
          char2Scale.value = withSequence(
            withDelay(300, withTiming(1.1, { duration: 300 })),
            withDelay(500, withTiming(0.8, { duration: 300 }))
          );

          char3Opacity.value = withSequence(
            withDelay(600, withTiming(1, { duration: 300 })),
            withDelay(800, withTiming(0.3, { duration: 300 }))
          );
          char3Scale.value = withSequence(
            withDelay(600, withTiming(1.1, { duration: 300 })),
            withDelay(800, withTiming(0.8, { duration: 300 }))
          );
        };

        animateChineseChars();
        const chineseInterval = setInterval(animateChineseChars, 1200);
        return () => clearInterval(chineseInterval);

      case 'skeleton':
        shimmerX.value = withRepeat(
          withTiming(1, { duration: 1500, easing: Easing.linear }),
          -1,
          false
        );
        break;
    }
  }, [variant, rotation, scale, opacity, translateY, char1Opacity, char2Opacity, char3Opacity, char1Scale, char2Scale, char3Scale, shimmerX]);

  // Loading styles
  const loadingStyles = useMemo((): LoadingStyles => ({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: getResponsiveSpacing('md'),
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    animationContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    spinner: {
      width: sizeConfig.container,
      height: sizeConfig.container,
      borderRadius: sizeConfig.container / 2,
      borderWidth: 3,
      borderColor: colors.neutral[200],
      borderTopColor: themeColors[0],
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getResponsiveSpacing('xs'),
    },
    dot: {
      width: sizeConfig.dot,
      height: sizeConfig.dot,
      borderRadius: sizeConfig.dot / 2,
      backgroundColor: themeColors[0],
    },
    pulseCircle: {
      width: sizeConfig.container,
      height: sizeConfig.container,
      borderRadius: sizeConfig.container / 2,
      backgroundColor: themeColors[0],
    },
    barsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: getResponsiveSpacing('xs'),
      height: sizeConfig.container,
    },
    bar: {
      width: sizeConfig.dot,
      backgroundColor: themeColors[0],
      borderRadius: sizeConfig.dot / 2,
    },
    chineseContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getResponsiveSpacing('sm'),
    },
    chineseCharacter: {
      fontSize: sizeConfig.chinese,
      fontWeight: '600',
      color: themeColors[0],
    },
    skeletonContainer: {
      width: '100%',
      backgroundColor: colors.neutral[100],
      borderRadius: Layout.isMobile ? 8 : 12,
      overflow: 'hidden',
    },
    skeletonShimmer: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.neutral[200],
    },
    textContainer: {
      marginTop: textPosition === 'bottom' ? getResponsiveSpacing('md') : 0,
      marginBottom: textPosition === 'top' ? getResponsiveSpacing('md') : 0,
    },
    text: {
      fontSize: sizeConfig.text,
      color: colors.neutral[600],
      textAlign: 'center',
      fontWeight: '500',
    },
    pinyinText: {
      fontSize: sizeConfig.text * 0.8,
      color: colors.neutral[500],
      textAlign: 'center',
    },
    skeletonLine: {
      backgroundColor: colors.neutral[200],
      borderRadius: 4,
      marginBottom: 8,
    },
    skeletonAvatar: {
      backgroundColor: colors.neutral[200],
      borderRadius: 50,
      width: 40,
      height: 40,
    },
  }), [sizeConfig, themeColors, textPosition, Layout]);

  // Animated styles
  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const dotsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const barsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const char1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: char1Opacity.value,
    transform: [{ scale: char1Scale.value }],
  }));

  const char2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: char2Opacity.value,
    transform: [{ scale: char2Scale.value }],
  }));

  const char3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: char3Opacity.value,
    transform: [{ scale: char3Scale.value }],
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmerX.value,
          [-1, 1],
          [-Dimensions.get('window').width, Dimensions.get('window').width]
        ),
      },
    ],
  }));

  // Render loading variants
  const renderLoadingVariant = () => {
    switch (variant) {
      case 'spinner':
        return (
          <AnimatedView style={[loadingStyles.spinner, spinnerAnimatedStyle]} />
        );

      case 'dots':
        return (
          <View style={loadingStyles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <AnimatedView
                key={index}
                style={[
                  loadingStyles.dot,
                  dotsAnimatedStyle,
                  { animationDelay: `${index * 200}ms` },
                ]}
              />
            ))}
          </View>
        );

      case 'pulse':
        return (
          <AnimatedView style={[loadingStyles.pulseCircle, pulseAnimatedStyle]} />
        );

      case 'bars':
        return (
          <View style={loadingStyles.barsContainer}>
            {[0, 1, 2, 3].map((index) => (
              <AnimatedView
                key={index}
                style={[
                  loadingStyles.bar,
                  barsAnimatedStyle,
                  {
                    height: sizeConfig.container * (0.4 + (index % 2) * 0.3),
                    animationDelay: `${index * 100}ms`,
                  },
                ]}
              />
            ))}
          </View>
        );

      case 'chinese':
        const characters = chineseConfig?.characters || ['学', '习', '中'];
        return (
          <View style={loadingStyles.chineseContainer}>
            <AnimatedText style={[loadingStyles.chineseCharacter, char1AnimatedStyle]}>
              {characters[0]}
            </AnimatedText>
            <AnimatedText style={[loadingStyles.chineseCharacter, char2AnimatedStyle]}>
              {characters[1]}
            </AnimatedText>
            <AnimatedText style={[loadingStyles.chineseCharacter, char3AnimatedStyle]}>
              {characters[2]}
            </AnimatedText>
          </View>
        );

      case 'skeleton':
        const skeletonHeight = skeletonConfig?.height || 20;
        const skeletonWidth = skeletonConfig?.width || '100%';
        
        return (
          <View style={[
            loadingStyles.skeletonContainer,
            { 
              height: skeletonHeight, 
              width: typeof skeletonWidth === 'string' ? skeletonWidth as any : skeletonWidth 
            }
          ]}>
            <AnimatedView style={[loadingStyles.skeletonShimmer, shimmerAnimatedStyle]}>
              <LinearGradient
                colors={[
                  colors.neutral[100],
                  colors.neutral[200],
                  colors.neutral[100],
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </AnimatedView>
          </View>
        );

      default:
        return null;
    }
  };

  // Render text
  const renderText = () => {
    if (!showText || !text) return null;

    return (
      <View style={loadingStyles.textContainer}>
        <Text style={[loadingStyles.text, textStyle]}>{text}</Text>
      </View>
    );
  };

  return (
    <View style={[loadingStyles.container, containerStyle]} {...props}>
      {textPosition === 'top' && renderText()}
      {renderLoadingVariant()}
      {textPosition === 'bottom' && renderText()}
    </View>
  );
}; 