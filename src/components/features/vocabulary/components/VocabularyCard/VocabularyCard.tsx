import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../../../../ui/atoms/Card';
import { ChineseText, PinyinText, TranslationText } from '../../../../ui/atoms/Text';
import { Button } from '../../../../ui/atoms/Button';
import { colors, Layout, getResponsiveSpacing } from '../../../../../theme';
import { VocabularyItem } from '../../types/vocabulary.types';
import { Volume2, Heart, BookOpen } from 'lucide-react-native';
import { useVocabularyTTS } from '../../../../../hooks/useTTS';

interface VocabularyCardProps {
  vocabulary: VocabularyItem;
  onPress?: (vocabulary: VocabularyItem) => void;
  onAudioPress?: (audioUrl: string) => void;
  onToggleFavorite?: (id: string) => void;
  variant?: 'default' | 'compact' | 'quiz' | 'practice';
  showProgress?: boolean;
  isFavorite?: boolean;
  progress?: {
    correct: number;
    total: number;
    streak: number;
  };
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  vocabulary,
  onPress,
  onAudioPress,
  onToggleFavorite,
  variant = 'default',
  showProgress = false,
  isFavorite = false,
  progress,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);

  // TTS Hook
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    speakVocabulary,
    stop: stopTTS,
  } = useVocabularyTTS();

  const getToneColor = (tone: number) => {
    const toneColors = {
      1: colors.tones.tone1, // Thanh ngang - Red
      2: colors.tones.tone2, // Thanh sắc - Yellow
      3: colors.tones.tone3, // Thanh huyền - Green
      4: colors.tones.tone4, // Thanh nặng - Blue
      0: colors.tones.neutral, // Thanh nhẹ - Gray
    };
    return toneColors[tone as keyof typeof toneColors] || colors.tones.neutral;
  };

  const getToneName = (tone: number) => {
    const toneNames = {
      1: 'Thanh ngang',
      2: 'Thanh sắc',
      3: 'Thanh huyền', 
      4: 'Thanh nặng',
      0: 'Thanh nhẹ',
    };
    return toneNames[tone as keyof typeof toneNames] || 'Thanh nhẹ';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.accent[500];
      case 'intermediate': return colors.warning[500];
      case 'advanced': return colors.error[500];
      default: return colors.neutral[500];
    }
  };

  const handleCardPress = () => {
    if (variant === 'quiz' || variant === 'practice') {
      setIsFlipped(!isFlipped);
    } else {
      onPress?.(vocabulary);
    }
  };

  const handleAudioPress = async () => {
    try {
      if (isTTSPlaying) {
        await stopTTS();
      } else {
        await speakVocabulary({
          simplified: vocabulary.hanzi,
          pinyin: vocabulary.pinyin,
          tone: vocabulary.tone,
        });
      }
    } catch (error) {
      console.error('VocabularyCard TTS Error:', error);
    }
    
    // Fallback to original audio URL if available
    if (vocabulary.audioUrl && onAudioPress) {
      onAudioPress(vocabulary.audioUrl);
    }
  };

  const handleFavoritePress = () => {
    onToggleFavorite?.(vocabulary.id);
  };

  const renderCompactVariant = () => (
    <TouchableOpacity style={styles.compactContainer} onPress={handleCardPress}>
      <View style={styles.compactContent}>
        <ChineseText size="3xl" tone={vocabulary.tone}>
          {vocabulary.hanzi}
        </ChineseText>
        <View style={styles.compactInfo}>
          <PinyinText size="sm">{vocabulary.pinyin}</PinyinText>
          <TranslationText language="vi" size="sm">
            {vocabulary.vietnamese}
          </TranslationText>
        </View>
      </View>
      <Button variant="ghost" size="sm" onPress={handleAudioPress}>
        <Volume2 size={16} color={colors.primary[500]} />
      </Button>
    </TouchableOpacity>
  );

  const renderQuizVariant = () => (
    <Card variant="elevated" style={styles.quizContainer}>
      <TouchableOpacity onPress={handleCardPress} style={styles.quizContent}>
        {!isFlipped ? (
          <View style={styles.quizFront}>
            <ChineseText size="6xl" tone={vocabulary.tone} showTone>
              {vocabulary.hanzi}
            </ChineseText>
            <TranslationText size="sm" color={colors.neutral[500]}>
              Chạm để xem nghĩa
            </TranslationText>
          </View>
        ) : (
          <View style={styles.quizBack}>
            <PinyinText size="xl">{vocabulary.pinyin}</PinyinText>
            <TranslationText language="vi" size="lg" weight="medium">
              {vocabulary.vietnamese}
            </TranslationText>
            <TranslationText language="en" size="base" color={colors.neutral[600]}>
              {vocabulary.english}
            </TranslationText>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );

  if (variant === 'compact') return renderCompactVariant();
  if (variant === 'quiz' || variant === 'practice') return renderQuizVariant();

  return (
    <Card variant="default" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <TranslationText size="xs" color={colors.neutral[600]}>
            {vocabulary.category}
          </TranslationText>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(vocabulary.difficulty) }]}>
            <TranslationText size="xs" color={colors.neutral[50]} weight="medium">
              {vocabulary.difficulty}
            </TranslationText>
          </View>
        </View>
        
        <View style={styles.actions}>
          {vocabulary.audioUrl && (
            <Button variant="ghost" size="sm" onPress={handleAudioPress}>
              <Volume2 size={20} color={colors.primary[500]} />
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onPress={handleFavoritePress}>
            <Heart 
              size={20} 
              color={isFavorite ? colors.error[500] : colors.neutral[400]}
              fill={isFavorite ? colors.error[500] : 'transparent'}
            />
          </Button>
        </View>
      </View>

      {/* Main Content */}
      <TouchableOpacity style={styles.content} onPress={handleCardPress}>
        <View style={styles.toneIndicator}>
          <View style={[styles.toneDot, { backgroundColor: getToneColor(vocabulary.tone) }]} />
          <TranslationText size="xs" color={getToneColor(vocabulary.tone)}>
            {getToneName(vocabulary.tone)}
          </TranslationText>
        </View>

        <ChineseText size="5xl" tone={vocabulary.tone} style={styles.hanzi}>
          {vocabulary.hanzi}
        </ChineseText>

        <PinyinText size="xl" style={styles.pinyin}>
          {vocabulary.pinyin}
        </PinyinText>

        <View style={styles.translations}>
          <TranslationText language="vi" size="lg" weight="medium" style={styles.vietnamese}>
            {vocabulary.vietnamese}
          </TranslationText>
          <TranslationText language="en" size="base" color={colors.neutral[600]}>
            {vocabulary.english}
          </TranslationText>
        </View>
      </TouchableOpacity>

      {/* Progress Section */}
      {showProgress && progress && (
        <View style={styles.progressSection}>
          <View style={styles.progressStats}>
            <TranslationText size="xs" color={colors.neutral[600]}>
              Đúng: {progress.correct}/{progress.total}
            </TranslationText>
            <TranslationText size="xs" color={colors.neutral[600]}>
              Streak: {progress.streak}
            </TranslationText>
          </View>
        </View>
      )}

      {/* Stroke Order Section */}
      {vocabulary.strokeOrder && vocabulary.strokeOrder.length > 0 && (
        <View style={styles.strokeOrderSection}>
          <Button 
            variant="ghost" 
            size="sm"
            onPress={() => setShowStrokeOrder(!showStrokeOrder)}
            style={styles.strokeOrderToggle}
          >
            <BookOpen size={16} color={colors.primary[500]} />
            <TranslationText size="sm" color={colors.primary[500]}>
              {showStrokeOrder ? 'Ẩn thứ tự nét' : 'Xem thứ tự nét'}
            </TranslationText>
          </Button>
          
          {showStrokeOrder && (
            <View style={styles.strokeOrderContainer}>
              <TranslationText size="sm" weight="medium" style={styles.strokeOrderTitle}>
                Thứ tự viết nét:
              </TranslationText>
              <View style={styles.strokeOrderList}>
                {vocabulary.strokeOrder.map((stroke, index) => (
                  <View key={index} style={styles.strokeItem}>
                    <TranslationText size="xs" color={colors.neutral[600]}>
                      {index + 1}
          </TranslationText>
                    <ChineseText size="lg">{stroke}</ChineseText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: getResponsiveSpacing('md'),
    minHeight: Layout.isMobile ? 180 : 200,
    },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  difficultyBadge: {
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('xs'),
    borderRadius: Layout.isMobile ? 4 : 6,
  },
  actions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('xs'),
  },
  content: {
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing('lg'),
  },
  toneIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  toneDot: {
    width: Layout.isMobile ? 8 : 10,
    height: Layout.isMobile ? 8 : 10,
    borderRadius: Layout.isMobile ? 4 : 5,
  },
  hanzi: {
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  pinyin: {
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('md'),
    fontStyle: 'italic',
  },
  translations: {
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  vietnamese: {
    textAlign: 'center',
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: getResponsiveSpacing('sm'),
    marginTop: getResponsiveSpacing('md'),
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strokeOrderSection: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: getResponsiveSpacing('sm'),
    marginTop: getResponsiveSpacing('md'),
  },
  strokeOrderToggle: {
    alignSelf: 'flex-start',
    marginBottom: getResponsiveSpacing('sm'),
  },
  strokeOrderTitle: {
    marginBottom: getResponsiveSpacing('sm'),
  },
  strokeOrderList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
  },
  strokeItem: {
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  strokeOrderContainer: {
    padding: getResponsiveSpacing('sm'),
    backgroundColor: colors.neutral[50],
    borderRadius: Layout.isMobile ? 8 : 12,
  },
  
  // Compact variant styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral[50],
    padding: getResponsiveSpacing('md'),
    borderRadius: Layout.isMobile ? 8 : 12,
    marginBottom: getResponsiveSpacing('sm'),
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  compactInfo: {
    flex: 1,
    gap: getResponsiveSpacing('xs'),
  },

  // Quiz variant styles
  quizContainer: {
    minHeight: Layout.isMobile ? 200 : 250,
    marginBottom: getResponsiveSpacing('md'),
  },
  quizContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  quizFront: {
    alignItems: 'center',
    gap: getResponsiveSpacing('lg'),
  },
  quizBack: {
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
}); 