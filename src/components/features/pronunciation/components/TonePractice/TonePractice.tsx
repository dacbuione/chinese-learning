import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../../../../ui/atoms/Card';
import { ChineseText, PinyinText, TranslationText } from '../../../../ui/atoms/Text';
import { Button } from '../../../../ui/atoms/Button';
import { colors, Layout, getResponsiveSpacing } from '../../../../../theme';
import { ToneExample, TonePracticeProps } from '../../types/pronunciation.types';
import { Volume2, Check, X, RefreshCw, Headphones } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVocabularyTTS } from '../../../../../hooks/useTTS';

export const TonePractice: React.FC<TonePracticeProps> = ({
  examples,
  onComplete,
  showResults = true,
  autoAdvance = true,
  timeLimit,
  variant = 'default',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(examples.length);
  const [selectedTone, setSelectedTone] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | undefined>(timeLimit);
  const [isTimerActive, setIsTimerActive] = useState(Boolean(timeLimit));

  // TTS Hook
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    speakVocabulary,
    stop: stopTTS,
  } = useVocabularyTTS();

  const currentExample = examples[currentIndex];

  // Tone configuration with Vietnamese descriptions
  const toneInfo = [
    { 
      tone: 1, 
      name: 'Thanh ngang', 
      symbol: '¯', 
      color: colors.tones.tone1, 
      description: 'Giọng ngang, cao và đều',
      example: 'mā (妈 - mẹ)'
    },
    { 
      tone: 2, 
      name: 'Thanh sắc', 
      symbol: '´', 
      color: colors.tones.tone2, 
      description: 'Giọng lên, từ thấp đến cao',
      example: 'má (麻 - má)'
    },
    { 
      tone: 3, 
      name: 'Thanh huyền', 
      symbol: 'ˇ', 
      color: colors.tones.tone3, 
      description: 'Giọng xuống rồi lên',
      example: 'mǎ (马 - ngựa)'
    },
    { 
      tone: 4, 
      name: 'Thanh nặng', 
      symbol: '`', 
      color: colors.tones.tone4, 
      description: 'Giọng xuống, từ cao đến thấp',
      example: 'mà (骂 - mắng)'
    },
  ];

  // Timer effect
  useEffect(() => {
    if (timeLimit && isTimerActive && timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [timeLeft, isTimerActive, timeLimit]);

  // Start timer when component mounts
  useEffect(() => {
    if (timeLimit) {
      setIsTimerActive(true);
    }
  }, [timeLimit]);

  const handleToneSelect = (tone: number) => {
    if (isAnswered) return;
    
    setSelectedTone(tone);
    setIsAnswered(true);
    setIsTimerActive(false);
    
    if (tone === currentExample.tone) {
      setScore(score + 1);
    }
    
    // Auto advance if enabled
    if (autoAdvance) {
      setTimeout(() => {
        handleNext();
      }, 2000);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedTone(null);
      setIsAnswered(false);
      setTimeLeft(timeLimit);
      setIsTimerActive(Boolean(timeLimit));
    } else {
      finishPractice();
    }
  };

  const handleTimeUp = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      setIsTimerActive(false);
      
      if (autoAdvance) {
        setTimeout(() => {
          handleNext();
        }, 2000);
      }
    }
  };

  const finishPractice = () => {
    setShowResult(true);
    if (onComplete) {
      const percentage = Math.round((score / totalQuestions) * 100);
      onComplete(percentage, score, totalQuestions);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedTone(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
    setTimeLeft(timeLimit);
    setIsTimerActive(Boolean(timeLimit));
  };

  const playAudio = async () => {
    try {
      if (isTTSPlaying) {
        await stopTTS();
      } else {
        await speakVocabulary({
          simplified: currentExample.character,
          pinyin: currentExample.pinyin,
          tone: currentExample.tone,
        });
      }
    } catch (error) {
      console.error('TonePractice audio error:', error);
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return colors.accent[500];
    if (percentage >= 70) return colors.warning[500];
    return colors.error[500];
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return 'Xuất sắc! 🎉';
    if (percentage >= 70) return 'Tốt lắm! 👏';
    if (percentage >= 50) return 'Khá ổn! 👍';
    return 'Cần luyện tập thêm! 💪';
  };

  // Compact variant for embedded use
  const renderCompactVariant = () => (
    <Card variant="default" style={styles.compactContainer}>
      <View style={styles.compactHeader}>
        <ChineseText size="4xl" tone={currentExample.tone}>
          {currentExample.character}
        </ChineseText>
        <Button 
          variant="ghost" 
          size="sm" 
          onPress={playAudio}
          disabled={isTTSLoading}
        >
          <Volume2 size={20} color={isTTSPlaying ? colors.secondary[500] : colors.primary[500]} />
        </Button>
      </View>
      
      <View style={styles.compactTones}>
        {toneInfo.map((tone) => (
          <TouchableOpacity
            key={tone.tone}
            style={[
              styles.compactToneButton,
              { backgroundColor: tone.color },
              selectedTone === tone.tone && styles.selectedCompactTone,
            ]}
            onPress={() => handleToneSelect(tone.tone)}
            disabled={isAnswered}
          >
            <TranslationText size="sm" color={colors.neutral[50]} weight="medium">
              {tone.tone}
            </TranslationText>
          </TouchableOpacity>
        ))}
      </View>
      
      {isAnswered && (
        <TranslationText 
          size="sm" 
          color={selectedTone === currentExample.tone ? colors.accent[600] : colors.error[600]}
          style={styles.compactFeedback}
        >
          {selectedTone === currentExample.tone ? '✅ Đúng!' : `❌ Đáp án: Thanh ${currentExample.tone}`}
        </TranslationText>
      )}
    </Card>
  );

  // Results screen
  if (showResult && showResults) {
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <Card variant="elevated" style={styles.resultContainer}>
        <View style={styles.resultContent}>
          <TranslationText size="2xl" weight="bold" style={styles.resultTitle}>
            Kết quả luyện tập
          </TranslationText>
          
          <View style={styles.scoreContainer}>
            <TranslationText 
              size="6xl" 
              weight="bold" 
              color={getPerformanceColor(percentage)}
              style={styles.scoreText}
            >
              {percentage}%
            </TranslationText>
            <TranslationText size="lg" color={colors.neutral[600]}>
              {score}/{totalQuestions} câu đúng
            </TranslationText>
          </View>
          
          <TranslationText 
            size="xl" 
            weight="medium" 
            color={getPerformanceColor(percentage)}
            style={styles.performanceMessage}
          >
            {getPerformanceMessage(percentage)}
          </TranslationText>
          
          <View style={styles.resultActions}>
            <Button 
              variant="primary" 
              size="lg" 
              onPress={handleRestart}
              style={styles.retryButton}
            >
              <RefreshCw size={20} color={colors.neutral[50]} />
              <TranslationText size="base" color={colors.neutral[50]} weight="medium">
                Thử lại
              </TranslationText>
            </Button>
          </View>
        </View>
      </Card>
    );
  }

  if (variant === 'compact') {
    return renderCompactVariant();
  }

  return (
    <Card variant="default" style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <TranslationText size="base" weight="medium" color={colors.neutral[600]}>
            Câu {currentIndex + 1}/{totalQuestions}
          </TranslationText>
          {timeLimit && timeLeft !== undefined && (
            <TranslationText size="base" weight="medium" color={timeLeft <= 10 ? colors.error[500] : colors.neutral[600]}>
              ⏱️ {timeLeft}s
            </TranslationText>
          )}
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex + 1) / totalQuestions) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Question Section */}
      <View style={styles.questionContainer}>
        <TranslationText size="lg" weight="medium" style={styles.instructionText}>
          Chọn thanh điệu đúng cho:
        </TranslationText>
        
        <View style={styles.characterContainer}>
          <ChineseText size="7xl" tone={currentExample.tone} style={styles.character}>
            {currentExample.character}
          </ChineseText>
          
          <View style={styles.audioControls}>
            <Button 
              variant={isTTSPlaying ? "secondary" : "primary"} 
              size="md" 
              onPress={playAudio} 
              style={styles.audioButton}
              disabled={isTTSLoading}
            >
              <Headphones size={24} color={colors.neutral[50]} />
              <TranslationText size="sm" color={colors.neutral[50]} weight="medium">
                {isTTSLoading ? 'Đang tải...' : isTTSPlaying ? 'Đang phát' : 'Nghe'}
              </TranslationText>
            </Button>
          </View>
        </View>
        
        <PinyinText size="xl" style={styles.pinyin}>
          {currentExample.pinyin}
        </PinyinText>
        
        <TranslationText size="base" color={colors.neutral[600]} style={styles.meaning}>
          ({currentExample.vietnamese})
        </TranslationText>
      </View>

      {/* Tone Options */}
      <View style={styles.toneOptions}>
        {toneInfo.map((tone) => (
          <TouchableOpacity
            key={tone.tone}
            style={[
              styles.toneOption,
              { borderColor: tone.color },
              selectedTone === tone.tone && styles.selectedTone,
              isAnswered && tone.tone === currentExample.tone && styles.correctTone,
              isAnswered && selectedTone === tone.tone && tone.tone !== currentExample.tone && styles.wrongTone,
            ]}
            onPress={() => handleToneSelect(tone.tone)}
            disabled={isAnswered}
          >
            <View style={styles.toneHeader}>
              <TranslationText style={[styles.toneSymbol, { color: tone.color }]}>
                {tone.symbol}
              </TranslationText>
              <TranslationText size="base" weight="medium" color={tone.color}>
                {tone.name}
              </TranslationText>
            </View>
            
            <TranslationText size="xs" color={colors.neutral[600]} style={styles.toneDescription}>
              {tone.description}
            </TranslationText>
            
            <TranslationText size="xs" color={colors.neutral[500]} style={styles.toneExample}>
              VD: {tone.example}
            </TranslationText>
            
            {/* Feedback Icons */}
            {isAnswered && tone.tone === currentExample.tone && (
              <View style={styles.feedbackIcon}>
                <Check size={24} color={colors.accent[500]} />
              </View>
            )}
            {isAnswered && selectedTone === tone.tone && tone.tone !== currentExample.tone && (
              <View style={styles.feedbackIcon}>
                <X size={24} color={colors.error[500]} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback Section */}
      {isAnswered && (
        <View style={styles.feedbackContainer}>
          <TranslationText 
            size="lg" 
            weight="medium"
            color={selectedTone === currentExample.tone ? colors.accent[600] : colors.error[600]}
            style={styles.feedbackText}
          >
            {selectedTone === currentExample.tone 
              ? '🎉 Chính xác! Bạn đã nhận biết đúng thanh điệu!'
              : `❌ Chưa đúng! Đáp án đúng là ${toneInfo.find(t => t.tone === currentExample.tone)?.name}`
            }
          </TranslationText>
          
          {!autoAdvance && (
            <Button 
              variant="primary" 
              size="md" 
              onPress={handleNext}
              style={styles.nextButton}
            >
              <TranslationText size="base" color={colors.neutral[50]} weight="medium">
                Tiếp tục
              </TranslationText>
            </Button>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: getResponsiveSpacing('lg'),
    minHeight: Layout.isMobile ? 400 : 500,
  },
  
  // Progress styles
  progressContainer: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
  
  // Question styles
  questionContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xl'),
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('lg'),
    color: colors.neutral[700],
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  character: {
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  audioControls: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('sm'),
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  pinyin: {
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('sm'),
    fontStyle: 'italic',
  },
  meaning: {
    textAlign: 'center',
  },
  
  // Tone options styles
  toneOptions: {
    gap: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  toneOption: {
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderRadius: Layout.isMobile ? 12 : 16,
    padding: getResponsiveSpacing('lg'),
    position: 'relative',
  },
  selectedTone: {
    backgroundColor: colors.primary[50],
    borderWidth: 3,
  },
  correctTone: {
    backgroundColor: colors.accent[50],
    borderColor: colors.accent[500],
  },
  wrongTone: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[500],
  },
  toneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
    gap: getResponsiveSpacing('md'),
  },
  toneSymbol: {
    fontSize: Layout.isMobile ? 32 : 40,
    fontWeight: 'bold',
  },
  toneDescription: {
    marginBottom: getResponsiveSpacing('xs'),
  },
  toneExample: {
    fontStyle: 'italic',
  },
  feedbackIcon: {
    position: 'absolute',
    top: getResponsiveSpacing('md'),
    right: getResponsiveSpacing('md'),
  },
  
  // Feedback styles
  feedbackContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: Layout.isMobile ? 12 : 16,
    padding: getResponsiveSpacing('lg'),
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  feedbackText: {
    textAlign: 'center',
  },
  nextButton: {
    marginTop: getResponsiveSpacing('sm'),
  },
  
  // Result styles
  resultContainer: {
    marginBottom: getResponsiveSpacing('lg'),
    minHeight: Layout.isMobile ? 300 : 400,
  },
  resultContent: {
    alignItems: 'center',
    gap: getResponsiveSpacing('lg'),
  },
  resultTitle: {
    textAlign: 'center',
    color: colors.neutral[800],
  },
  scoreContainer: {
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  scoreText: {
    textAlign: 'center',
  },
  performanceMessage: {
    textAlign: 'center',
  },
  resultActions: {
    marginTop: getResponsiveSpacing('lg'),
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  
  // Compact variant styles
  compactContainer: {
    padding: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  compactTones: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('sm'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  compactToneButton: {
    flex: 1,
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: Layout.isMobile ? 6 : 8,
    alignItems: 'center',
  },
  selectedCompactTone: {
    opacity: 0.8,
  },
  compactFeedback: {
    textAlign: 'center',
  },
}); 