import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Components  
import { TranslationText } from '../../../src/components/ui/atoms/Text';
import { Button } from '../../../src/components/ui/atoms/Button';
import { Card } from '../../../src/components/ui/atoms/Card';

// Theme
import { colors, getResponsiveSpacing } from '../../../src/theme';
import { ArrowLeft, Mic, Volume2, Pause } from 'lucide-react-native';

export default function PronunciationPracticeScreen() {
  const router = useRouter();
  
  // Sample pronunciation exercises
  const pronunciationExercises = [
    {
      id: '1',
      character: '你好',
      pinyin: 'nǐ hǎo',
      vietnamese: 'xin chào',
      english: 'hello',
      audioUrl: '',
      difficulty: 'beginner',
    },
    {
      id: '2',
      character: '谢谢',
      pinyin: 'xiè xiè',
      vietnamese: 'cám ơn',
      english: 'thank you',
      audioUrl: '',
      difficulty: 'beginner',
    },
    {
      id: '3',
      character: '再见',
      pinyin: 'zài jiàn',
      vietnamese: 'tạm biệt',
      english: 'goodbye',
      audioUrl: '',
      difficulty: 'beginner',
    },
    {
      id: '4',
      character: '对不起',
      pinyin: 'duì bù qǐ',
      vietnamese: 'xin lỗi',
      english: 'sorry',
      audioUrl: '',
      difficulty: 'intermediate',
    },
  ];

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentExercise = pronunciationExercises[currentExerciseIndex];

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
    
    Alert.alert('Phát âm thanh', `Đang phát: ${currentExercise.pinyin}`);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setIsRecording(false);
      Alert.alert('Ghi âm hoàn thành', 'Độ chính xác: 85%');
    }, 3000);
  };

  const nextExercise = () => {
    if (currentExerciseIndex < pronunciationExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.accent[500];
      case 'intermediate': return colors.warning[500];
      case 'advanced': return colors.error[500];
      default: return colors.neutral[500];
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung bình';
      case 'advanced': return 'Nâng cao';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.neutral[700]} />
        </Button>
        
        <View style={styles.headerTitle}>
          <TranslationText size="lg" weight="bold" color={colors.neutral[900]}>
            Luyện phát âm
          </TranslationText>
          <TranslationText size="sm" color={colors.neutral[600]}>
            {currentExerciseIndex + 1}/{pronunciationExercises.length}
          </TranslationText>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card variant="default" style={styles.exerciseCard}>
          {/* Difficulty Badge */}
          <View style={styles.difficultyContainer}>
            <View style={[
              styles.difficultyBadge, 
              { backgroundColor: getDifficultyColor(currentExercise.difficulty) }
            ]}>
              <TranslationText size="xs" color={colors.neutral[50]}>
                {getDifficultyLabel(currentExercise.difficulty)}
              </TranslationText>
            </View>
          </View>

          {/* Chinese Character */}
          <View style={styles.characterContainer}>
            <TranslationText size="6xl" weight="bold" style={styles.character}>
              {currentExercise.character}
            </TranslationText>
          </View>

          {/* Pinyin */}
          <TranslationText size="2xl" color={colors.primary[600]} style={styles.pinyin}>
            {currentExercise.pinyin}
          </TranslationText>

          {/* Translations */}
          <View style={styles.translationsContainer}>
            <TranslationText size="lg" weight="medium" color={colors.neutral[800]}>
              {currentExercise.vietnamese}
            </TranslationText>
            <TranslationText size="base" color={colors.neutral[600]}>
              {currentExercise.english}
            </TranslationText>
          </View>

          {/* Audio Controls */}
          <View style={styles.audioControls}>
            <Button 
              variant="outline" 
              size="lg" 
              onPress={handlePlayAudio}
              disabled={isPlaying}
              style={styles.audioButton}
            >
              {isPlaying ? (
                <Pause size={24} color={colors.primary[500]} />
              ) : (
                <Volume2 size={24} color={colors.primary[500]} />
              )}
              <TranslationText size="base" color={colors.primary[500]}>
                {isPlaying ? 'Đang phát...' : 'Nghe phát âm'}
              </TranslationText>
            </Button>

            <Button 
              variant="primary" 
              size="lg" 
              onPress={handleStartRecording}
              disabled={isRecording}
              style={styles.recordButton}
            >
              <Mic size={24} color={colors.neutral[50]} />
              <TranslationText size="base" color={colors.neutral[50]}>
                {isRecording ? 'Đang ghi âm...' : 'Ghi âm luyện tập'}
              </TranslationText>
            </Button>
          </View>
        </Card>

        {/* Tips */}
        <Card variant="default" style={styles.tipsContainer}>
          <TranslationText size="sm" weight="medium" color={colors.primary[600]}>
            💡 Mẹo phát âm:
          </TranslationText>
          <TranslationText size="sm" color={colors.neutral[600]}>
            • Lắng nghe kỹ thanh điệu của từng âm tiết
          </TranslationText>
          <TranslationText size="sm" color={colors.neutral[600]}>
            • Luyện tập từ từ, rõ ràng từng âm
          </TranslationText>
          <TranslationText size="sm" color={colors.neutral[600]}>
            • Ghi âm để so sánh với bản mẫu
          </TranslationText>
        </Card>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <Button 
          variant="outline" 
          size="sm" 
          onPress={previousExercise}
          disabled={currentExerciseIndex === 0}
        >
          <TranslationText size="sm" color={colors.neutral[600]}>
            Trước
          </TranslationText>
        </Button>
        
        <View style={styles.progressIndicator}>
          {pronunciationExercises.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index === currentExerciseIndex 
                    ? colors.primary[500] 
                    : colors.neutral[300]
                }
              ]}
            />
          ))}
        </View>
        
        <Button 
          variant="outline" 
          size="sm" 
          onPress={nextExercise}
          disabled={currentExerciseIndex === pronunciationExercises.length - 1}
        >
          <TranslationText size="sm" color={colors.neutral[600]}>
            Tiếp
          </TranslationText>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('xl'),
  },
  exerciseCard: {
    padding: getResponsiveSpacing('xl'),
    alignItems: 'center',
    gap: getResponsiveSpacing('lg'),
  },
  difficultyContainer: {
    alignSelf: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('xs'),
    borderRadius: 12,
  },
  characterContainer: {
    alignItems: 'center',
    marginVertical: getResponsiveSpacing('lg'),
  },
  character: {
    textAlign: 'center',
    lineHeight: 80,
  },
  pinyin: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: getResponsiveSpacing('md'),
  },
  translationsContainer: {
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  audioControls: {
    width: '100%',
    gap: getResponsiveSpacing('md'),
  },
  audioButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('md'),
  },
  recordButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('md'),
  },
  tipsContainer: {
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.primary[50],
    gap: getResponsiveSpacing('sm'),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  progressIndicator: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('xs'),
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}); 