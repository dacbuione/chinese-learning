import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, getResponsiveSpacing } from '../../theme';
import { useVocabularyTTS, usePronunciationTTS } from '../../hooks/useTTS';

/**
 * 🎵 AudioButton Component
 * 
 * Button để play TTS audio với visual feedback
 * 
 * Props:
 * - hanzi: Chữ Hán cần phát âm
 * - pinyin: Phiên âm pinyin
 * - tone: Thanh điệu (1-4)
 * - speed: Tốc độ phát âm (0.5-2.0)
 * - size: Kích thước button ('small', 'medium', 'large')
 * - variant: Kiểu button ('primary', 'secondary', 'minimal')
 * - disabled: Vô hiệu hóa button
 */

export interface AudioButtonProps {
  hanzi: string;
  pinyin: string;
  tone: number;
  speed?: number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'minimal';
  disabled?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  hanzi,
  pinyin,
  tone,
  speed = 1.0,
  size = 'medium',
  variant = 'primary',
  disabled = false,
  onPlayStart,
  onPlayEnd,
  onError,
}) => {
  const {
    isLoading,
    isPlaying,
    error,
    speakVocabulary,
    stop,
  } = useVocabularyTTS();

  const handlePress = async () => {
    try {
      if (isPlaying) {
        // Nếu đang play thì stop
        await stop();
        onPlayEnd?.();
      } else {
        // Nếu không play thì bắt đầu
        onPlayStart?.();
        await speakVocabulary({
          simplified: hanzi,
          pinyin,
          tone,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Audio playback failed';
      onError?.(errorMessage);
    }
  };

  // Determine icon based on state
  const getIcon = () => {
    if (isLoading) return null; // Show spinner instead
    if (isPlaying) return 'stop';
    return 'volume-high';
  };

  // Get button style based on variant and size
  const buttonStyle = [
    styles.button,
    styles[`button_${size}`],
    styles[`button_${variant}`],
    isPlaying && styles.button_playing,
    disabled && styles.button_disabled,
    error && styles.button_error,
  ];

  const iconSize = {
    small: 16,
    medium: 20,
    large: 24,
  }[size];

  const iconColor = variant === 'minimal' 
    ? colors.primary[600] 
    : colors.neutral[50];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      accessibilityLabel={`Phát âm ${hanzi} (${pinyin})`}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || isLoading,
        busy: isLoading,
      }}
    >
      {isLoading ? (
        <ActivityIndicator 
          size={iconSize} 
          color={iconColor}
        />
      ) : (
        <Ionicons
          name={getIcon() as any}
          size={iconSize}
          color={iconColor}
        />
      )}
    </TouchableOpacity>
  );
};

/**
 * 🎯 Specialized AudioButton for different contexts
 */

// Button cho vocabulary cards
export const VocabularyAudioButton: React.FC<{
  hanzi: string;
  pinyin: string;
  tone: number;
  size?: 'small' | 'medium' | 'large';
}> = ({ hanzi, pinyin, tone, size = 'medium' }) => (
  <AudioButton
    hanzi={hanzi}
    pinyin={pinyin}
    tone={tone}
    speed={1.0}
    size={size}
    variant="primary"
  />
);

// Button cho pronunciation practice (slower speed)
export const PronunciationAudioButton: React.FC<{
  hanzi: string;
  pinyin: string;
  tone: number;
  size?: 'small' | 'medium' | 'large';
}> = ({ hanzi, pinyin, tone, size = 'large' }) => {
  const {
    isLoading,
    isPlaying,
    error,
    speakForPractice,
    stop,
  } = usePronunciationTTS();

  const handlePress = async () => {
    try {
      console.log(`🎯 PronunciationAudioButton clicked: ${hanzi}`);
      if (isPlaying) {
        console.log('🛑 Stopping audio...');
        await stop();
      } else {
        console.log('▶️ Starting pronunciation...');
        await speakForPractice(hanzi, 0.8); // Slower for practice
      }
    } catch (err) {
      console.error('❌ Pronunciation audio error:', err);
    }
  };

  const getIcon = () => {
    if (isLoading) return null;
    if (isPlaying) return 'stop';
    return 'volume-high';
  };

  const buttonStyle = [
    styles.button,
    styles[`button_${size}`],
    styles.button_primary,
    isPlaying && styles.button_playing,
    error && styles.button_error,
  ];

  const iconSize = {
    small: 16,
    medium: 20,
    large: 24,
  }[size];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
      accessibilityLabel={`Phát âm ${hanzi}`}
      accessibilityRole="button"
    >
      {isLoading ? (
        <ActivityIndicator 
          size={iconSize} 
          color={colors.neutral[50]}
        />
      ) : (
        <Ionicons
          name={getIcon() as any}
          size={iconSize}
          color={colors.neutral[50]}
        />
      )}
    </TouchableOpacity>
  );
};

// Minimal button cho inline text
export const InlineAudioButton: React.FC<{
  hanzi: string;
  pinyin: string;
  tone: number;
}> = ({ hanzi, pinyin, tone }) => (
  <AudioButton
    hanzi={hanzi}
    pinyin={pinyin}
    tone={tone}
    speed={1.0}
    size="small"
    variant="minimal"
  />
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Size variants
  button_small: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  button_medium: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  button_large: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },

  // Style variants
  button_primary: {
    backgroundColor: colors.primary[500],
  },
  button_secondary: {
    backgroundColor: colors.secondary[500],
  },
  button_minimal: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },

  // State variants
  button_playing: {
    backgroundColor: colors.accent[500],
  },
  button_disabled: {
    backgroundColor: colors.neutral[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  button_error: {
    backgroundColor: colors.error[500],
  },
});

export default AudioButton; 