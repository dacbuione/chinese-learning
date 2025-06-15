/**
 * Enhanced Vocabulary Card Component
 * 
 * Features: Pronunciation, Spaced Repetition, Progress Tracking, Vietnamese-first design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

// Theme and utils
import { colors, getResponsiveSpacing, getResponsiveFontSize, device } from '../../theme';
import { useTranslation } from '../../localization';

// Types
import { ChineseWord, VocabularyProgress } from '../../services/vocabularyService';

interface VocabularyCardProps {
  word: ChineseWord;
  progress?: VocabularyProgress;
  mode: 'study' | 'practice' | 'review';
  showAnswer?: boolean;
  onAnswer?: (isCorrect: boolean, responseTime: number) => void;
  onFavorite?: (wordId: string) => void;
  onPlayAudio?: (word: ChineseWord) => void;
  autoReveal?: boolean;
  hideTranslations?: boolean;
  style?: any;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  progress,
  mode,
  showAnswer = false,
  onAnswer,
  onFavorite,
  onPlayAudio,
  autoReveal = false,
  hideTranslations = false,
  style,
}) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(showAnswer);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Auto-reveal for study mode
  useEffect(() => {
    if (autoReveal && mode === 'study') {
      const timer = setTimeout(() => {
        handleFlip();
      }, 2000); // Auto reveal after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [autoReveal, mode]);

  // Cleanup sound
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleAnswer = (isCorrect: boolean) => {
    const responseTime = Date.now() - startTime;
    
    // Haptic feedback
    if (isCorrect) {
      Vibration.vibrate(50); // Short success vibration
    } else {
      Vibration.vibrate([0, 100, 50, 100]); // Double vibration for error
    }
    
    onAnswer?.(isCorrect, responseTime);
    setStartTime(Date.now()); // Reset timer for next word
  };

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    
    try {
      setIsPlayingAudio(true);
      
      if (onPlayAudio) {
        onPlayAudio(word);
      } else if (word.audioUrl) {
        // Play actual audio file
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: word.audioUrl },
          { shouldPlay: true }
        );
        setSound(newSound);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlayingAudio(false);
          }
        });
      } else {
        // Simulate audio playback for demo
        setTimeout(() => {
          setIsPlayingAudio(false);
        }, 1000);
      }
    } catch (error) {
      console.log('Audio playback error:', error);
      setIsPlayingAudio(false);
    }
  };

  const getDifficultyColor = () => {
    if (!progress) return colors.neutral[400];
    
    switch (progress.reviewRecord.difficulty) {
      case 'easy': return colors.success[500];
      case 'medium': return colors.warning[500];
      case 'hard': return colors.error[500];
      case 'very_hard': return colors.error[600];
      default: return colors.neutral[400];
    }
  };

  const getMasteryIcon = () => {
    if (!progress) return 'help-circle-outline';
    
    switch (progress.masteryLevel) {
      case 'new': return 'add-circle-outline';
      case 'learning': return 'school-outline';
      case 'review': return 'refresh-outline';
      case 'mastered': return 'checkmark-circle';
      default: return 'help-circle-outline';
    }
  };

  const getToneColor = (pinyinChar: string) => {
    // Simple tone detection based on tone marks
    if (pinyinChar.includes('ā') || pinyinChar.includes('ē') || pinyinChar.includes('ī') || 
        pinyinChar.includes('ō') || pinyinChar.includes('ū') || pinyinChar.includes('ǖ')) {
      return colors.tones.tone1; // First tone
    } else if (pinyinChar.includes('á') || pinyinChar.includes('é') || pinyinChar.includes('í') || 
               pinyinChar.includes('ó') || pinyinChar.includes('ú') || pinyinChar.includes('ǘ')) {
      return colors.tones.tone2; // Second tone
    } else if (pinyinChar.includes('ǎ') || pinyinChar.includes('ě') || pinyinChar.includes('ǐ') || 
               pinyinChar.includes('ǒ') || pinyinChar.includes('ǔ') || pinyinChar.includes('ǚ')) {
      return colors.tones.tone3; // Third tone
    } else if (pinyinChar.includes('à') || pinyinChar.includes('è') || pinyinChar.includes('ì') || 
               pinyinChar.includes('ò') || pinyinChar.includes('ù') || pinyinChar.includes('ǜ')) {
      return colors.tones.tone4; // Fourth tone
    }
    return colors.tones.neutral; // Neutral tone
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Front of card */}
      <Animated.View 
        style={[
          styles.cardFace,
          styles.cardFront,
          { transform: [{ rotateY: frontInterpolate }] },
          isFlipped && styles.hidden
        ]}
      >
        <LinearGradient
          colors={[colors.neutral[50], colors.neutral[100]]}
          style={styles.cardGradient}
        >
          {/* Header with metadata */}
          <View style={styles.cardHeader}>
            <View style={styles.metadataRow}>
              <View style={[styles.hskBadge, { backgroundColor: colors.primary[500] }]}>
                <Text style={styles.hskText}>HSK {word.hskLevel}</Text>
              </View>
              
              <View style={styles.statusIcons}>
                {progress && (
                  <View style={[styles.difficultyIndicator, { backgroundColor: getDifficultyColor() }]}>
                    <Ionicons 
                      name={getMasteryIcon()} 
                      size={12} 
                      color={colors.neutral[50]} 
                    />
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => onFavorite?.(word.id)}
                >
                  <Ionicons
                    name={progress?.isFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={progress?.isFavorite ? colors.error[500] : colors.neutral[400]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Main character */}
          <View style={styles.characterContainer}>
            <Text style={styles.chineseCharacter}>{word.simplified}</Text>
            {word.traditional && word.traditional !== word.simplified && (
              <Text style={styles.traditionalCharacter}>({word.traditional})</Text>
            )}
          </View>
          
          {/* Pronunciation with audio */}
          <TouchableOpacity 
            style={styles.pronunciationContainer}
            onPress={handlePlayAudio}
            disabled={isPlayingAudio}
          >
            <Text style={[styles.pinyin, { color: getToneColor(word.pinyin) }]}>
              {word.pinyin}
            </Text>
            <Ionicons
              name={isPlayingAudio ? 'volume-high' : 'volume-medium-outline'}
              size={24}
              color={colors.primary[500]}
              style={styles.audioIcon}
            />
          </TouchableOpacity>
          
          {/* Category badge */}
          <View style={[styles.categoryBadge, { backgroundColor: word.category.color }]}>
            <Ionicons name={word.category.icon as any} size={16} color={colors.neutral[50]} />
            <Text style={styles.categoryText}>{word.category.nameVi}</Text>
          </View>
          
          {/* Tap to reveal hint */}
          <TouchableOpacity style={styles.flipHint} onPress={handleFlip}>
            <Text style={styles.flipHintText}>
              {t.vocabulary.tapToReveal || 'Nhấn để xem nghĩa'}
            </Text>
            <Ionicons name="eye-outline" size={16} color={colors.neutral[500]} />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
      
      {/* Back of card */}
      <Animated.View 
        style={[
          styles.cardFace,
          styles.cardBack,
          { transform: [{ rotateY: backInterpolate }] },
          !isFlipped && styles.hidden
        ]}
      >
        <LinearGradient
          colors={[colors.secondary[50], colors.secondary[100]]}
          style={styles.cardGradient}
        >
          {/* Character (smaller on back) */}
          <View style={styles.backCharacterContainer}>
            <Text style={styles.backChineseCharacter}>{word.simplified}</Text>
            <Text style={[styles.backPinyin, { color: getToneColor(word.pinyin) }]}>
              {word.pinyin}
            </Text>
          </View>
          
          {/* Translations */}
          {!hideTranslations && (
            <View style={styles.translationsContainer}>
              <View style={styles.translationGroup}>
                <Text style={styles.translationLabel}>Tiếng Việt:</Text>
                <Text style={styles.vietnameseTranslation}>
                  {word.vietnamese.join(', ')}
                </Text>
              </View>
              
              <View style={styles.translationGroup}>
                <Text style={styles.translationLabel}>English:</Text>
                <Text style={styles.englishTranslation}>
                  {word.english.join(', ')}
                </Text>
              </View>
            </View>
          )}
          
          {/* Example sentence */}
          {word.example && (
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleLabel}>Ví dụ:</Text>
              <Text style={styles.exampleChinese}>{word.example.simplified}</Text>
              <Text style={styles.examplePinyin}>{word.example.pinyin}</Text>
              <Text style={styles.exampleVietnamese}>{word.example.vietnamese}</Text>
            </View>
          )}
          
          {/* Answer buttons for practice mode */}
          {mode === 'practice' && onAnswer && (
            <View style={styles.answerButtons}>
              <TouchableOpacity
                style={[styles.answerButton, styles.incorrectButton]}
                onPress={() => handleAnswer(false)}
              >
                <Ionicons name="close" size={24} color={colors.neutral[50]} />
                <Text style={styles.answerButtonText}>Sai</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.answerButton, styles.correctButton]}
                onPress={() => handleAnswer(true)}
              >
                <Ionicons name="checkmark" size={24} color={colors.neutral[50]} />
                <Text style={styles.answerButtonText}>Đúng</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Flip back hint */}
          <TouchableOpacity style={styles.flipHint} onPress={handleFlip}>
            <Text style={styles.flipHintText}>
              {t.vocabulary.tapToHide || 'Nhấn để ẩn nghĩa'}
            </Text>
            <Ionicons name="eye-off-outline" size={16} color={colors.neutral[500]} />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
      
      {/* Progress indicator */}
      {progress && mode === 'review' && (
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            Lần ôn: {progress.reviewRecord.repetitions} | 
            Độ khó: {progress.reviewRecord.easeFactor.toFixed(1)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: device.isMobile ? 400 : 450,
    marginBottom: getResponsiveSpacing('lg'),
  },
  
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: device.isMobile ? 16 : 20,
    elevation: 4,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  cardFront: {
    zIndex: 2,
  },
  
  cardBack: {
    zIndex: 1,
  },
  
  hidden: {
    opacity: 0,
  },
  
  cardGradient: {
    flex: 1,
    borderRadius: device.isMobile ? 16 : 20,
    padding: getResponsiveSpacing('lg'),
    justifyContent: 'space-between',
  },
  
  // Header styles
  cardHeader: {
    marginBottom: getResponsiveSpacing('md'),
  },
  
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  hskBadge: {
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('xs'),
    borderRadius: 12,
  },
  
  hskText: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '600',
    color: colors.neutral[50],
  },
  
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  
  difficultyIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  favoriteButton: {
    padding: getResponsiveSpacing('xs'),
  },
  
  // Character styles
  characterContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  
  chineseCharacter: {
    fontSize: getResponsiveFontSize('7xl'),
    fontWeight: '300',
    color: colors.neutral[900],
    textAlign: 'center',
    lineHeight: device.isMobile ? 80 : 100,
  },
  
  traditionalCharacter: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('xs'),
  },
  
  // Pronunciation styles
  pronunciationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing('md'),
  },
  
  pinyin: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '500',
    textAlign: 'center',
  },
  
  audioIcon: {
    marginLeft: getResponsiveSpacing('sm'),
  },
  
  // Category styles
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: 20,
    gap: getResponsiveSpacing('xs'),
  },
  
  categoryText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[50],
  },
  
  // Back card styles
  backCharacterContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  
  backChineseCharacter: {
    fontSize: getResponsiveFontSize('4xl'),
    fontWeight: '300',
    color: colors.neutral[900],
  },
  
  backPinyin: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '500',
    marginTop: getResponsiveSpacing('xs'),
  },
  
  // Translation styles
  translationsContainer: {
    flex: 1,
    gap: getResponsiveSpacing('md'),
  },
  
  translationGroup: {
    gap: getResponsiveSpacing('xs'),
  },
  
  translationLabel: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[600],
  },
  
  vietnameseTranslation: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '500',
    color: colors.neutral[900],
    lineHeight: getResponsiveFontSize('lg') * 1.3,
  },
  
  englishTranslation: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    lineHeight: getResponsiveFontSize('base') * 1.3,
  },
  
  // Example styles
  exampleContainer: {
    backgroundColor: colors.neutral[50],
    padding: getResponsiveSpacing('md'),
    borderRadius: 12,
    gap: getResponsiveSpacing('xs'),
  },
  
  exampleLabel: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[600],
  },
  
  exampleChinese: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[900],
  },
  
  examplePinyin: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    fontStyle: 'italic',
  },
  
  exampleVietnamese: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
  },
  
  // Answer button styles
  answerButtons: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('md'),
    marginTop: getResponsiveSpacing('lg'),
  },
  
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 12,
    gap: getResponsiveSpacing('xs'),
  },
  
  correctButton: {
    backgroundColor: colors.success[500],
  },
  
  incorrectButton: {
    backgroundColor: colors.error[500],
  },
  
  answerButtonText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[50],
  },
  
  // Flip hint styles
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveSpacing('xs'),
    paddingVertical: getResponsiveSpacing('sm'),
  },
  
  flipHintText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[500],
  },
  
  // Progress indicator
  progressIndicator: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  
  progressText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[500],
  },
}); 