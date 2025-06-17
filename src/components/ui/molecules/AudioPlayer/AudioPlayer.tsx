import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';

// Import theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, device } from '@/theme';
import { useLessonTTS } from '@/hooks/useTTS';

// Simple AudioPlayer Props
interface SimpleAudioPlayerProps {
  title?: string;
  subtitle?: string;
  variant?: 'standard' | 'minimal' | 'pronunciation';
  size?: 'sm' | 'md' | 'lg';
  showPlayButton?: boolean;
  showProgress?: boolean;
  showTime?: boolean;
  autoPlay?: boolean;
  containerStyle?: any;
  chineseText?: string;  // Text to speak in Chinese
  speed?: number;       // Playback speed
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

/**
 * Simple AudioPlayer Component - No Infinite Loops
 * 
 * Features:
 * - Play/Pause functionality
 * - Progress bar
 * - Time display
 * - Pronunciation support
 * - Responsive design
 */
export const AudioPlayer: React.FC<SimpleAudioPlayerProps> = ({
  title = 'Audio',
  subtitle,
  variant = 'standard',
  size = 'md',
  showPlayButton = true,
  showProgress = true,
  showTime = true,
  autoPlay = false,
  containerStyle,
  chineseText,
  speed,
  onPlay,
  onPause,
  onEnd,
}) => {
  // Simple state
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(30); // Mock duration

  // TTS Hook
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    speakLessonContent,
    stop: stopTTS,
  } = useLessonTTS();

  // Animation values
  const playButtonScale = useSharedValue(1);
  const progressWidth = useSharedValue(currentTime / duration);

  // Size configuration
  const sizeConfig = {
    sm: {
      height: device.isMobile ? 60 : 70,
      fontSize: getResponsiveFontSize('sm'),
      iconSize: 16,
      spacing: getResponsiveSpacing('sm'),
    },
    md: {
      height: device.isMobile ? 80 : 90,
      fontSize: getResponsiveFontSize('base'),
      iconSize: 20,
      spacing: getResponsiveSpacing('md'),
    },
    lg: {
      height: device.isMobile ? 100 : 110,
      fontSize: getResponsiveFontSize('lg'),
      iconSize: 24,
      spacing: getResponsiveSpacing('lg'),
    },
  }[size];

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    try {
      // Use actual TTS state
      const actualPlaying = isTTSPlaying || isPlaying;
      
      if (actualPlaying) {
        // Stop TTS if playing
        if (isTTSPlaying) {
          await stopTTS();
        }
        setIsPlaying(false);
        onPause?.();
      } else {
        // Start TTS if Chinese text provided
        if (chineseText) {
          await speakLessonContent({
            chinese: chineseText,
            speed: speed || 1.0,
          });
        }
        setIsPlaying(true);
        onPlay?.();
      }

      // Animate button
      playButtonScale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );

      // Update progress animation
      if (!actualPlaying) {
        progressWidth.value = withTiming(1, { duration: (duration - currentTime) * 1000 });
      } else {
        progressWidth.value = currentTime / duration;
      }
    } catch (error) {
      console.error('AudioPlayer TTS Error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, isTTSPlaying, currentTime, duration, playButtonScale, progressWidth, onPlay, onPause, chineseText, speakLessonContent, stopTTS, speed]);

  // Animated styles
  const playButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: playButtonScale.value }],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value * 100}%`,
    };
  });

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render different variants
  const renderContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <View style={styles.minimalContainer}>
            {showPlayButton && (
              <Animated.View style={playButtonAnimatedStyle}>
                <TouchableOpacity style={[styles.playButton, { width: sizeConfig.iconSize * 2, height: sizeConfig.iconSize * 2 }]} onPress={handlePlayPause}>
                  <Text style={[styles.playIcon, { fontSize: sizeConfig.iconSize }]}>
                    {(isPlaying || isTTSPlaying) ? '⏸️' : '▶️'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
            {showTime && (
              <Text style={[styles.timeText, { fontSize: sizeConfig.fontSize * 0.8 }]}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            )}
          </View>
        );

      case 'pronunciation':
        return (
          <View style={styles.pronunciationContainer}>
            <View style={styles.pronunciationHeader}>
              <Text style={[styles.pronunciationTitle, { fontSize: sizeConfig.fontSize }]}>
                {title}
              </Text>
              <View style={styles.toneIndicator} />
            </View>
            {showPlayButton && (
              <Animated.View style={playButtonAnimatedStyle}>
                <TouchableOpacity style={[styles.pronunciationPlayButton, { width: sizeConfig.iconSize * 3, height: sizeConfig.iconSize * 3 }]} onPress={handlePlayPause}>
                  <Text style={[styles.playIcon, { fontSize: sizeConfig.iconSize * 1.5 }]}>
                    {(isPlaying || isTTSPlaying) ? '⏸️' : '🔊'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        );

      default: // standard
        return (
          <View style={styles.standardContainer}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, { fontSize: sizeConfig.fontSize }]}>{title}</Text>
                {subtitle && (
                  <Text style={[styles.subtitle, { fontSize: sizeConfig.fontSize * 0.85 }]}>{subtitle}</Text>
                )}
              </View>
              {showPlayButton && (
                <Animated.View style={playButtonAnimatedStyle}>
                  <TouchableOpacity style={[styles.playButton, { width: sizeConfig.iconSize * 2.5, height: sizeConfig.iconSize * 2.5 }]} onPress={handlePlayPause}>
                    <Text style={[styles.playIcon, { fontSize: sizeConfig.iconSize }]}>
                      {(isPlaying || isTTSPlaying) ? '⏸️' : '▶️'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
            
            {showProgress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
                </View>
                {showTime && (
                  <View style={styles.timeContainer}>
                    <Text style={[styles.timeText, { fontSize: sizeConfig.fontSize * 0.8 }]}>
                      {formatTime(currentTime)}
                    </Text>
                    <Text style={[styles.timeText, { fontSize: sizeConfig.fontSize * 0.8 }]}>
                      {formatTime(duration)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { minHeight: sizeConfig.height }, containerStyle]}>
      {renderContent()}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[50],
    borderRadius: device.isMobile ? 12 : 16,
    padding: getResponsiveSpacing('md'),
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  standardContainer: {
    flex: 1,
  },
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  pronunciationContainer: {
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  subtitle: {
    color: colors.neutral[600],
  },
  pronunciationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  pronunciationTitle: {
    fontWeight: '600',
    color: colors.neutral[900],
  },
  toneIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  playButton: {
    borderRadius: 100,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pronunciationPlayButton: {
    borderRadius: 100,
    backgroundColor: colors.accent[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: colors.neutral[50],
  },
  progressContainer: {
    gap: getResponsiveSpacing('xs'),
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: colors.neutral[600],
  },
});

export default AudioPlayer; 