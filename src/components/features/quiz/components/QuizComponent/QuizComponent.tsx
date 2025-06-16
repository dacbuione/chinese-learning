import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../../../ui/atoms/Card';
import { ChineseText, PinyinText, TranslationText } from '../../../../ui/atoms/Text';
import { Button } from '../../../../ui/atoms/Button';
import { ProgressBar } from '../../../../ui/molecules/ProgressBar';
import { colors, Layout, getResponsiveSpacing } from '../../../../../theme';
import { QuizComponentProps, QuizQuestion, QuizResult } from '../../types/quiz.types';
import { Check, X, SkipForward, Volume2, Timer, Award, ChevronRight } from 'lucide-react-native';
import { useVocabularyTTS } from '../../../../../hooks/useTTS';

export const QuizComponent: React.FC<QuizComponentProps> = ({
  questions,
  quizType = 'multiple-choice',
  onComplete,
  onQuestionAnswered,
  timeLimit,
  allowSkip = true,
  showProgress = true,
  showResults = true,
  shuffleQuestions = false,
  shuffleAnswers = false,
  variant = 'default',
  difficulty = 'intermediate',
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
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

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const totalQuestions = shuffledQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Process questions on mount
  useEffect(() => {
    let processed = [...questions];
    
    if (shuffleQuestions) {
      processed = shuffleArray(processed);
    }
    
    if (shuffleAnswers) {
      processed = processed.map(q => ({
        ...q,
        options: q.options ? shuffleArray([...q.options]) : q.options
      }));
    }
    
    setShuffledQuestions(processed);
  }, [questions, shuffleQuestions, shuffleAnswers]);

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

  // Start timer when question changes
  useEffect(() => {
    if (timeLimit && currentQuestion) {
      setTimeLeft(timeLimit);
      setIsTimerActive(true);
    }
  }, [currentQuestionIndex, timeLimit, currentQuestion]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setIsTimerActive(false);
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    onQuestionAnswered?.(currentQuestion, answer, isCorrect);
    
    // Auto advance after 1.5 seconds
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const handleSkip = () => {
    if (!allowSkip) return;
    
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: '' }));
    setIsAnswered(true);
    setIsTimerActive(false);
    
    onQuestionAnswered?.(currentQuestion, '', false);
    
    setTimeout(() => {
      handleNext();
    }, 500);
  };

  const handleTimeUp = () => {
    if (!isAnswered) {
      setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: '' }));
      setIsAnswered(true);
      setIsTimerActive(false);
      
      onQuestionAnswered?.(currentQuestion, '', false);
      
      setTimeout(() => {
        handleNext();
      }, 1000);
    }
  };

  const finishQuiz = () => {
    setShowResult(true);
    
    const quizResults: QuizResult[] = shuffledQuestions.map((question, index) => ({
      question,
      userAnswer: userAnswers[index] || '',
      correctAnswer: question.correctAnswer,
      isCorrect: userAnswers[index] === question.correctAnswer,
      points: userAnswers[index] === question.correctAnswer ? 1 : 0,
    }));
    
    const finalScore = quizResults.reduce((sum, result) => sum + result.points, 0);
    const percentage = Math.round((finalScore / totalQuestions) * 100);
    
    onComplete?.(percentage, finalScore, totalQuestions, quizResults);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setUserAnswers({});
    setScore(0);
    setShowResult(false);
    setTimeLeft(timeLimit);
    setIsTimerActive(Boolean(timeLimit));
  };

  const playAudio = async () => {
    try {
      if (isTTSPlaying) {
        await stopTTS();
      } else if (currentQuestion.question) {
        // Try to speak the question content
        await speakVocabulary({
          simplified: currentQuestion.question,
          pinyin: '', // QuizQuestion doesn't have pinyin field
          tone: currentQuestion.tone || 1,
        });
      }
    } catch (error) {
      console.error('Quiz audio error:', error);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return colors.accent[500];
    if (percentage >= 70) return colors.warning[500];
    return colors.error[500];
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Xuất sắc! 🏆';
    if (percentage >= 70) return 'Tốt lắm! 👏';
    if (percentage >= 50) return 'Khá ổn! 👍';
    return 'Cần cố gắng thêm! 💪';
  };

  // Compact variant for embedded quizzes
  const renderCompactVariant = () => (
    <Card variant="default" style={styles.compactContainer}>
      <View style={styles.compactHeader}>
        <TranslationText size="base" weight="medium">
          Câu {currentQuestionIndex + 1}/{totalQuestions}
        </TranslationText>
        {timeLimit && timeLeft !== undefined && (
          <TranslationText size="sm" color={timeLeft <= 10 ? colors.error[500] : colors.neutral[600]}>
            {timeLeft}s
          </TranslationText>
        )}
      </View>
      
      <ChineseText size="3xl" style={styles.compactQuestion}>
        {currentQuestion.question}
      </ChineseText>
      
      <View style={styles.compactOptions}>
        {currentQuestion.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.compactOption,
              selectedAnswer === option && styles.compactSelectedOption,
              isAnswered && option === currentQuestion.correctAnswer && styles.compactCorrectOption,
              isAnswered && selectedAnswer === option && option !== currentQuestion.correctAnswer && styles.compactWrongOption,
            ]}
            onPress={() => handleAnswerSelect(option)}
            disabled={isAnswered}
          >
            <TranslationText size="sm" color={colors.neutral[700]}>
              {option}
            </TranslationText>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  // Results screen
  if (showResult && showResults) {
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <ScrollView style={styles.resultsContainer}>
        <Card variant="elevated" style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Award size={48} color={getScoreColor(percentage)} />
            <TranslationText size="2xl" weight="bold" style={styles.resultTitle}>
              Kết quả bài kiểm tra
            </TranslationText>
          </View>
          
          <View style={styles.scoreSection}>
            <TranslationText 
              size="6xl" 
              weight="bold" 
              color={getScoreColor(percentage)}
              style={styles.scoreText}
            >
              {percentage}%
            </TranslationText>
            <TranslationText size="lg" color={colors.neutral[600]}>
              {score}/{totalQuestions} câu đúng
            </TranslationText>
            <TranslationText 
              size="xl" 
              weight="medium" 
              color={getScoreColor(percentage)}
              style={styles.scoreMessage}
            >
              {getScoreMessage(percentage)}
            </TranslationText>
          </View>
          
          <ProgressBar
            progress={percentage}
            variant={percentage >= 90 ? 'success' : percentage >= 70 ? 'warning' : 'error'}
            height="lg"
            showPercentage={false}
            style={styles.resultProgress}
          />
          
          <View style={styles.resultActions}>
            <Button 
              variant="primary" 
              size="lg" 
              onPress={restartQuiz}
              style={styles.actionButton}
            >
              <TranslationText size="base" color={colors.neutral[50]} weight="medium">
                Làm lại
              </TranslationText>
            </Button>
          </View>
        </Card>
      </ScrollView>
    );
  }

  if (!currentQuestion) {
    return (
      <Card variant="default" style={styles.loadingContainer}>
        <TranslationText size="lg" color={colors.neutral[600]}>
          Đang tải câu hỏi...
        </TranslationText>
      </Card>
    );
  }

  if (variant === 'compact') {
    return renderCompactVariant();
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Progress Section */}
      {showProgress && (
        <Card variant="default" style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <TranslationText size="base" weight="medium" color={colors.neutral[600]}>
                Câu {currentQuestionIndex + 1}/{totalQuestions}
              </TranslationText>
              <TranslationText size="sm" color={colors.neutral[500]}>
                {difficulty} • {quizType}
              </TranslationText>
            </View>
            
            {timeLimit && timeLeft !== undefined && (
              <View style={styles.timerContainer}>
                <Timer size={16} color={timeLeft <= 10 ? colors.error[500] : colors.neutral[600]} />
                <TranslationText 
                  size="base" 
                  weight="medium" 
                  color={timeLeft <= 10 ? colors.error[500] : colors.neutral[600]}
                >
                  {timeLeft}s
                </TranslationText>
              </View>
            )}
          </View>
          
          <ProgressBar
            progress={progress}
            variant="default"
            height="md"
            animated={true}
            style={styles.progressBar}
          />
        </Card>
      )}

      {/* Question Section */}
      <Card variant="default" style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <TranslationText size="lg" weight="medium" style={styles.questionLabel}>
            {quizType === 'hanzi-to-vietnamese' ? 'Nghĩa của từ này là gì?' :
             quizType === 'vietnamese-to-hanzi' ? 'Từ tiếng Trung nào có nghĩa này?' :
             quizType === 'pinyin-to-hanzi' ? 'Chữ Hán nào có pinyin này?' :
             'Chọn đáp án đúng:'}
          </TranslationText>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onPress={playAudio}
            disabled={isTTSLoading}
          >
            <Volume2 size={20} color={isTTSPlaying ? colors.secondary[500] : colors.primary[500]} />
          </Button>
        </View>
        
        <View style={styles.questionContent}>
          {quizType === 'hanzi-to-vietnamese' && (
            <ChineseText size="6xl" tone={currentQuestion.tone} style={styles.questionText}>
              {currentQuestion.question}
            </ChineseText>
          )}
          
          {quizType === 'pinyin-to-hanzi' && (
            <PinyinText size="4xl" style={styles.questionText}>
              {currentQuestion.question}
            </PinyinText>
          )}
          
          {(quizType === 'vietnamese-to-hanzi' || quizType === 'multiple-choice') && (
            <TranslationText size="2xl" weight="medium" style={styles.questionText}>
              {currentQuestion.question}
            </TranslationText>
          )}
          
          {currentQuestion.hint && !isAnswered && (
            <TranslationText size="sm" color={colors.neutral[500]} style={styles.hint}>
              💡 Gợi ý: {currentQuestion.hint}
            </TranslationText>
          )}
        </View>
      </Card>

      {/* Options Section */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === option && styles.selectedOption,
              isAnswered && option === currentQuestion.correctAnswer && styles.correctOption,
              isAnswered && selectedAnswer === option && option !== currentQuestion.correctAnswer && styles.wrongOption,
            ]}
            onPress={() => handleAnswerSelect(option)}
            disabled={isAnswered}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIndex}>
                <TranslationText size="base" weight="medium" color={colors.neutral[600]}>
                  {String.fromCharCode(65 + index)}
                </TranslationText>
              </View>
              
              <View style={styles.optionText}>
                {quizType === 'vietnamese-to-hanzi' || quizType === 'pinyin-to-hanzi' ? (
                  <ChineseText size="xl">{option}</ChineseText>
                ) : (
                  <TranslationText size="base" weight="medium">{option}</TranslationText>
                )}
              </View>
              
              {isAnswered && option === currentQuestion.correctAnswer && (
                <Check size={24} color={colors.accent[500]} />
              )}
              {isAnswered && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                <X size={24} color={colors.error[500]} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {allowSkip && !isAnswered && (
          <Button 
            variant="outline" 
            size="md" 
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <SkipForward size={20} color={colors.neutral[600]} />
            <TranslationText size="base" color={colors.neutral[600]}>
              Bỏ qua
            </TranslationText>
          </Button>
        )}
        
        {isAnswered && currentQuestionIndex < totalQuestions - 1 && (
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

      {/* Feedback Section */}
      {isAnswered && (
        <Card variant="default" style={styles.feedbackCard}>
          <TranslationText 
            size="lg" 
            weight="medium"
            color={selectedAnswer === currentQuestion.correctAnswer ? colors.accent[600] : colors.error[600]}
            style={styles.feedbackText}
          >
            {selectedAnswer === currentQuestion.correctAnswer 
              ? '🎉 Chính xác! Bạn đã trả lời đúng!'
              : `❌ Chưa đúng! Đáp án đúng là: ${currentQuestion.correctAnswer}`
            }
          </TranslationText>
          
          {currentQuestion.explanation && (
            <TranslationText size="base" color={colors.neutral[600]} style={styles.explanation}>
              {currentQuestion.explanation}
            </TranslationText>
          )}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  // Progress styles
  progressCard: {
    margin: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  progressInfo: {
    gap: getResponsiveSpacing('xs'),
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  progressBar: {
    marginTop: getResponsiveSpacing('sm'),
  },
  
  // Question styles
  questionCard: {
    margin: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  questionLabel: {
    color: colors.neutral[700],
    flex: 1,
  },
  questionContent: {
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  questionText: {
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Options styles
  optionsContainer: {
    margin: getResponsiveSpacing('md'),
    gap: getResponsiveSpacing('sm'),
  },
  optionButton: {
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: Layout.isMobile ? 12 : 16,
    padding: getResponsiveSpacing('md'),
  },
  selectedOption: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  correctOption: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  wrongOption: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  optionIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  
  // Action styles
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: getResponsiveSpacing('md'),
    gap: getResponsiveSpacing('md'),
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  
  // Feedback styles
  feedbackCard: {
    margin: getResponsiveSpacing('md'),
    marginTop: getResponsiveSpacing('sm'),
  },
  feedbackText: {
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  explanation: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Results styles
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  resultCard: {
    margin: getResponsiveSpacing('lg'),
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xl'),
  },
  resultTitle: {
    textAlign: 'center',
    marginTop: getResponsiveSpacing('md'),
    color: colors.neutral[800],
  },
  scoreSection: {
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
    marginBottom: getResponsiveSpacing('xl'),
  },
  scoreText: {
    textAlign: 'center',
  },
  scoreMessage: {
    textAlign: 'center',
  },
  resultProgress: {
    marginBottom: getResponsiveSpacing('xl'),
  },
  resultActions: {
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 120,
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
  compactQuestion: {
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  compactOptions: {
    gap: getResponsiveSpacing('xs'),
  },
  compactOption: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: Layout.isMobile ? 8 : 10,
    padding: getResponsiveSpacing('sm'),
  },
  compactSelectedOption: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  compactCorrectOption: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  compactWrongOption: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  
  // Loading styles
  loadingContainer: {
    padding: getResponsiveSpacing('xl'),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
}); 