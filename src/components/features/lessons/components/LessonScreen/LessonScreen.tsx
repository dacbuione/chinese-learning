import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Volume2,
  CheckCircle,
  XCircle,
  Star,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Clock,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

// Import UI components
import { Button } from '../../../../ui/atoms/Button';
import { Card } from '../../../../ui/atoms/Card';
import { ProgressBar } from '../../../../ui/molecules/ProgressBar';
import { AudioPlayer } from '../../../../ui/molecules/AudioPlayer';

// Import services and types
import { lessonService, Lesson, Exercise, ChineseCharacter } from '../../../../../services/LessonService';
import { useVocabularyTTS } from '../../../../../hooks/useTTS';

// Import theme
import { colors } from '../../../../../theme/colors';
import { typography } from '../../../../../theme/typography';
import { getResponsiveSpacing, getResponsiveFontSize, device } from '../../../../../theme';

const { width: screenWidth } = Dimensions.get('window');

interface LessonScreenProps {
  lessonId: string;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({ lessonId }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // State management
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Animation values
  const cardScale = useSharedValue(1);
  const resultOpacity = useSharedValue(0);
  const progressValue = useSharedValue(0);

  // TTS Hook
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    speakVocabulary,
    stop: stopTTS,
  } = useVocabularyTTS();

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  useEffect(() => {
    if (lesson) {
      progressValue.value = withTiming(currentStep / lesson.totalSteps, { duration: 500 });
    }
  }, [currentStep, lesson]);

  const loadLesson = async () => {
    const lessonData = lessonService.getLessonById(lessonId);
    if (lessonData) {
      setLesson(lessonData);
      if (lessonData.exercises.length > 0) {
        setCurrentExerciseIndex(0);
      }
    }
  };

  const handleAnswerSelect = (answer: string | number) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    
    // Animate card selection
    cardScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
  };

  const handleSubmitAnswer = () => {
    if (!lesson || !lesson.exercises[currentExerciseIndex]) return;

    const result = lessonService.checkAnswer(lesson.exercises[currentExerciseIndex].id, selectedAnswer!);
    
    setIsCorrect(result.correct);
    setScore(result.xpEarned);
    setShowResult(true);

    // Animate result appearance
    resultOpacity.value = withTiming(1, { duration: 300 });

    // Update lesson progress
    if (lesson) {
      lessonService.updateLessonProgress(lesson.id, currentStep + 1);
    }
  };

  const handleNextStep = () => {
    if (!lesson) return;

    const nextStep = currentStep + 1;
    
    if (nextStep >= lesson.totalSteps) {
      // Lesson completed
      handleLessonComplete();
    } else {
      // Move to next exercise
      setCurrentStep(nextStep);
      if (nextStep < lesson.exercises.length) {
        setCurrentExerciseIndex(nextStep);
      }
      
      // Reset state
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
      setScore(0);
      resultOpacity.value = 0;
    }
  };

  const handleLessonComplete = async () => {
    if (!lesson) return;

    const success = await lessonService.completeLesson(lesson.id);
    
    if (success) {
      Alert.alert(
        'Chúc mừng! 🎉',
        `Bạn đã hoàn thành bài học "${lesson.title}"!\n\nXP nhận được: +${lesson.xpReward}`,
        [
          {
            text: 'Tiếp tục học',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  const handlePlayAudio = async (character: ChineseCharacter) => {
    try {
      if (isTTSPlaying) {
        await stopTTS();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        await speakVocabulary({
          simplified: character.hanzi,
          pinyin: character.pinyin,
          tone: 1, // Default tone
        });
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Character audio error:', error);
      setIsPlaying(false);
    }
  };

  const renderCharacterCard = (character: ChineseCharacter, index: number) => (
    <Card key={index} variant="elevated" style={styles.characterCard}>
      <View style={styles.characterHeader}>
        <Text style={styles.hanziText}>{character.hanzi}</Text>
        <TouchableOpacity
          style={[
            styles.audioButton,
            (isTTSLoading || isTTSPlaying) && styles.audioButtonActive
          ]}
          onPress={() => handlePlayAudio(character)}
          disabled={isTTSLoading || isPlaying}
        >
          {isTTSLoading ? (
            <ActivityIndicator size="small" color={colors.primary[600]} />
          ) : (isPlaying || isTTSPlaying) ? (
            <Pause size={20} color={colors.primary[600]} />
          ) : (
            <Volume2 size={20} color={colors.primary[600]} />
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.pinyinText}>{character.pinyin}</Text>
      
      <View style={styles.translationContainer}>
        <Text style={styles.englishText}>{character.english}</Text>
        <Text style={styles.vietnameseText}>{character.vietnamese}</Text>
      </View>

      {character.examples.length > 0 && (
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Ví dụ:</Text>
          {character.examples.map((example, idx) => (
            <View key={idx} style={styles.exampleItem}>
              <Text style={styles.exampleHanzi}>{example.hanzi}</Text>
              <Text style={styles.examplePinyin}>{example.pinyin}</Text>
              <Text style={styles.exampleTranslation}>{example.vietnamese}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const renderMultipleChoiceExercise = (exercise: Exercise) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.questionText}>{exercise.question}</Text>
      
      <View style={styles.optionsContainer}>
        {exercise.options?.map((option, index) => (
          <Animated.View
            key={index}
            style={[styles.animatedContainer, animatedCardStyle]}
          >
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.optionButtonSelected,
                showResult && selectedAnswer === index && isCorrect && styles.optionButtonCorrect,
                showResult && selectedAnswer === index && !isCorrect && styles.optionButtonIncorrect,
              ]}
              onPress={() => handleAnswerSelect(index)}
              disabled={showResult}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedAnswer === index && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
              
              {showResult && selectedAnswer === index && (
                <View style={styles.resultIcon}>
                  {isCorrect ? (
                    <CheckCircle size={20} color={colors.accent[500]} />
                  ) : (
                    <XCircle size={20} color={colors.error[500]} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderToneRecognitionExercise = (exercise: Exercise) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.questionText}>{exercise.question}</Text>
      
      {exercise.character && (
        <Card variant="elevated" style={styles.toneCharacterCard}>
          <Text style={styles.toneHanziText}>{exercise.character.hanzi}</Text>
          <TouchableOpacity
            style={styles.audioButton}
            onPress={() => handlePlayAudio(exercise.character!)}
          >
            <Volume2 size={24} color={colors.primary[600]} />
          </TouchableOpacity>
        </Card>
      )}
      
      <View style={styles.toneOptionsContainer}>
        {exercise.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.toneOptionButton,
              selectedAnswer === index && styles.toneOptionButtonSelected,
              showResult && selectedAnswer === index && isCorrect && styles.toneOptionButtonCorrect,
              showResult && selectedAnswer === index && !isCorrect && styles.toneOptionButtonIncorrect,
            ]}
            onPress={() => handleAnswerSelect(index)}
            disabled={showResult}
          >
            <Text
              style={[
                styles.toneOptionText,
                selectedAnswer === index && styles.toneOptionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExercise = () => {
    if (!lesson || !lesson.exercises[currentExerciseIndex]) return null;

    switch (lesson.exercises[currentExerciseIndex].type) {
      case 'multiple_choice':
        return renderMultipleChoiceExercise(lesson.exercises[currentExerciseIndex]);
      case 'tone_recognition':
        return renderToneRecognitionExercise(lesson.exercises[currentExerciseIndex]);
      default:
        return (
          <Text style={styles.placeholderText}>
            Loại bài tập này đang được phát triển...
          </Text>
        );
    }
  };

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  const animatedResultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
  }));

  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải bài học...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.semantic.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{lesson.title}</Text>
            <Text style={styles.headerSubtitle}>{lesson.subtitle}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.xpBadge}>
              <Star size={16} color={colors.secondary[600]} />
              <Text style={styles.xpText}>+{lesson.xpReward}</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={currentStep / lesson.totalSteps}
            showLabel={true}
            label={`${currentStep}/${lesson.totalSteps}`}
            showPercentage={false}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Vocabulary Section */}
          {currentStep === 0 && lesson.characters.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Từ vựng mới</Text>
              {lesson.characters.map((character, index) => 
                renderCharacterCard(character, index)
              )}
              
              <Button
                variant="primary"
                size="lg"
                onPress={() => setCurrentStep(1)}
                style={styles.continueButton}
              >
                Bắt đầu luyện tập
              </Button>
            </View>
          )}

          {/* Exercise Section */}
          {currentStep > 0 && currentExerciseIndex !== null && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Bài tập {currentStep}/{lesson.exercises.length}
              </Text>
              
              {renderExercise()}
              
              {!showResult && selectedAnswer !== null && (
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSubmitAnswer}
                  style={styles.submitButton}
                >
                  Kiểm tra đáp án
                </Button>
              )}
              
              {showResult && (
                <Animated.View style={[styles.resultContainer, animatedResultStyle]}>
                  <Card
                    variant="elevated"
                    style={StyleSheet.flatten([
                      styles.resultCard,
                      isCorrect ? styles.resultCardCorrect : styles.resultCardIncorrect,
                    ])}
                  >
                    <View style={styles.resultHeader}>
                      {isCorrect ? (
                        <CheckCircle size={32} color={colors.accent[500]} />
                      ) : (
                        <XCircle size={32} color={colors.error[500]} />
                      )}
                      <Text
                        style={[
                          styles.resultTitle,
                          isCorrect ? styles.resultTitleCorrect : styles.resultTitleIncorrect,
                        ]}
                      >
                        {isCorrect ? 'Chính xác!' : 'Chưa đúng'}
                      </Text>
                    </View>
                    
                    <Text style={styles.resultExplanation}>{lesson.exercises[currentExerciseIndex].explanation}</Text>
                    
                    {score > 0 && (
                      <View style={styles.xpEarnedContainer}>
                        <Trophy size={16} color={colors.secondary[600]} />
                        <Text style={styles.xpEarnedText}>+{score} XP</Text>
                      </View>
                    )}
                    
                    <Button
                      variant="primary"
                      size="lg"
                      onPress={handleNextStep}
                      style={styles.nextButton}
                    >
                      {currentStep >= lesson.totalSteps - 1 ? 'Hoàn thành' : 'Tiếp tục'}
                    </Button>
                  </Card>
                </Animated.View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.background,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.semantic.background,
  },
  loadingText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.semantic.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: getResponsiveSpacing('sm'),
    marginRight: getResponsiveSpacing('md'),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: typography.weights.semibold,
    color: colors.semantic.text,
  },
  headerSubtitle: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.semantic.textSecondary,
    marginTop: getResponsiveSpacing('xs'),
  },
  headerRight: {
    marginLeft: getResponsiveSpacing('md'),
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[100],
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('xs'),
    borderRadius: 12,
    gap: getResponsiveSpacing('xs'),
  },
  xpText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: typography.weights.medium,
    color: colors.secondary[700],
  },
  progressContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getResponsiveSpacing('xl'),
  },
  section: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('xl'),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: typography.weights.semibold,
    color: colors.semantic.text,
    marginBottom: getResponsiveSpacing('lg'),
  },
  characterCard: {
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  characterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  hanziText: {
    fontSize: getResponsiveFontSize('6xl'),
    fontFamily: 'System',
    color: colors.semantic.text,
    fontWeight: typography.weights.bold,
  },
  audioButton: {
    padding: getResponsiveSpacing('sm'),
    backgroundColor: colors.primary[100],
    borderRadius: 20,
  },
  pinyinText: {
    fontSize: getResponsiveFontSize('xl'),
    color: colors.primary[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('md'),
    fontStyle: 'italic',
  },
  translationContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  englishText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.semantic.textSecondary,
    marginBottom: getResponsiveSpacing('xs'),
  },
  vietnameseText: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: typography.weights.medium,
    color: colors.semantic.text,
  },
  examplesContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: getResponsiveSpacing('md'),
  },
  examplesTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: typography.weights.medium,
    color: colors.semantic.text,
    marginBottom: getResponsiveSpacing('sm'),
  },
  exampleItem: {
    marginBottom: getResponsiveSpacing('sm'),
  },
  exampleHanzi: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: typography.weights.medium,
    color: colors.semantic.text,
  },
  examplePinyin: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
    fontStyle: 'italic',
  },
  exampleTranslation: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.semantic.textSecondary,
  },
  continueButton: {
    marginTop: getResponsiveSpacing('xl'),
  },
  exerciseContainer: {
    marginBottom: getResponsiveSpacing('xl'),
  },
  questionText: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: typography.weights.medium,
    color: colors.semantic.text,
    marginBottom: getResponsiveSpacing('lg'),
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed,
  },
  optionsContainer: {
    gap: getResponsiveSpacing('md'),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    minHeight: 60,
  },
  optionButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionButtonCorrect: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  optionButtonIncorrect: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  optionText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.semantic.text,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: typography.weights.medium,
    color: colors.primary[700],
  },
  resultIcon: {
    marginLeft: getResponsiveSpacing('md'),
  },
  toneCharacterCard: {
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  toneHanziText: {
    fontSize: getResponsiveFontSize('7xl'),
    fontFamily: 'System',
    color: colors.semantic.text,
    fontWeight: typography.weights.bold,
    marginBottom: getResponsiveSpacing('md'),
  },
  toneOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
    justifyContent: 'center',
  },
  toneOptionButton: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: 25,
    minWidth: device.isMobile ? (screenWidth - getResponsiveSpacing('lg') * 2 - getResponsiveSpacing('md')) / 2 : 120,
  },
  toneOptionButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  toneOptionButtonCorrect: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  toneOptionButtonIncorrect: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  toneOptionText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.semantic.text,
    textAlign: 'center',
  },
  toneOptionTextSelected: {
    fontWeight: typography.weights.medium,
    color: colors.primary[700],
  },
  submitButton: {
    marginTop: getResponsiveSpacing('xl'),
  },
  resultContainer: {
    marginTop: getResponsiveSpacing('xl'),
  },
  resultCard: {
    padding: getResponsiveSpacing('xl'),
  },
  resultCardCorrect: {
    borderColor: colors.accent[200],
    backgroundColor: colors.accent[50],
  },
  resultCardIncorrect: {
    borderColor: colors.error[200],
    backgroundColor: colors.error[50],
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
    gap: getResponsiveSpacing('md'),
  },
  resultTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: typography.weights.semibold,
  },
  resultTitleCorrect: {
    color: colors.accent[700],
  },
  resultTitleIncorrect: {
    color: colors.error[700],
  },
  resultExplanation: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.semantic.text,
    lineHeight: typography.lineHeights.relaxed,
    marginBottom: getResponsiveSpacing('lg'),
  },
  xpEarnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  xpEarnedText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: typography.weights.medium,
    color: colors.secondary[700],
  },
  nextButton: {
    marginTop: getResponsiveSpacing('md'),
  },
  placeholderText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.semantic.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  animatedContainer: {
    // Empty style for animated container
  },
  audioButtonActive: {
    backgroundColor: colors.primary[100],
  },
}); 