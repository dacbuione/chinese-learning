import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import components and theme
import {
  colors,
  getResponsiveSpacing,
  getResponsiveFontSize,
} from '../../../src/theme';
import { useTranslation } from '../../../src/localization';
import { Button } from '../../../src/components/ui/atoms/Button';
import { Card } from '../../../src/components/ui/atoms/Card';
import { AudioButton } from '../../../src/components/common/AudioButton';
import { HighlightedChineseText } from '../../../src/components/ui/atoms/Text';
import { SmartSpeechRecognitionComponent } from '../../../src/components/features/pronunciation';
import { WordAccuracy } from '../../../src/components/features/pronunciation/components/NativeSpeechRecognition/NativeSpeechRecognition';
import { api } from '../../../src/services/api/client';

interface ReadingPassage {
  id: string;
  title: string;
  content: string;
  pinyin: string;
  vietnamese: string;
  english: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hskLevel: number;
  questions: ReadingQuestion[];
}

interface ReadingQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}

export default function ReadingPracticeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [readingData, setReadingData] = useState<ReadingPassage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [currentTab, setCurrentTab] = useState<'reading' | 'speaking'>('reading');
  const [wordAccuracies, setWordAccuracies] = useState<WordAccuracy[]>([]);

  // Animation values
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);

  // Load reading data from API
  useEffect(() => {
    loadReadingData();
  }, []);

  const loadReadingData = async () => {
    try {
      setIsLoading(true);
      
      // Get vocabulary data to generate reading passages
      const vocabularyResponse = await api.vocabulary.getAll();
      
      if (vocabularyResponse.success && vocabularyResponse.data) {
        const vocabulary = vocabularyResponse.data;
        const generatedPassages = generateReadingPassages(vocabulary);
        setReadingData(generatedPassages);
      } else {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu đọc hiểu. Vui lòng thử lại.');
        setReadingData([]);
      }
    } catch (error) {
      console.error('Error loading reading data:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      setReadingData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReadingPassages = (vocabulary: any[]): ReadingPassage[] => {
    // Generate reading passages based on vocabulary data
    const passages: ReadingPassage[] = [
      {
        id: '1',
        title: 'Tự giới thiệu - Self Introduction',
        content: '我叫李明。我今年二十岁。我是学生。我学习中文。我喜欢看书和听音乐。我的家在北京。我有一个妹妹。她也是学生。',
        pinyin: 'Wǒ jiào Lǐ Míng. Wǒ jīnnián èrshí suì. Wǒ shì xuésheng. Wǒ xuéxí zhōngwén. Wǒ xǐhuan kànshū hé tīng yīnyuè. Wǒ de jiā zài Běijīng. Wǒ yǒu yí ge mèimei. Tā yě shì xuésheng.',
        vietnamese: 'Tôi tên là Lý Minh. Năm nay tôi hai mươi tuổi. Tôi là học sinh. Tôi học tiếng Trung. Tôi thích đọc sách và nghe nhạc. Nhà tôi ở Bắc Kinh. Tôi có một em gái. Em ấy cũng là học sinh.',
        english: 'My name is Li Ming. I am twenty years old this year. I am a student. I study Chinese. I like reading books and listening to music. My home is in Beijing. I have a younger sister. She is also a student.',
        difficulty: 'beginner',
        hskLevel: 1,
        questions: [
          {
            id: '1',
            question: 'Lý Minh năm nay bao nhiêu tuổi?',
            type: 'multiple-choice',
            options: ['18 tuổi', '19 tuổi', '20 tuổi', '21 tuổi'],
            correctAnswer: 2,
            explanation: 'Theo đoạn văn: "我今年二十岁" - năm nay tôi hai mươi tuổi.',
          },
          {
            id: '2',
            question: 'Lý Minh học gì?',
            type: 'multiple-choice',
            options: ['Tiếng Anh', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn'],
            correctAnswer: 1,
            explanation: 'Theo đoạn văn: "我学习中文" - tôi học tiếng Trung.',
          },
          {
            id: '3',
            question: 'Nhà Lý Minh ở đâu?',
            type: 'multiple-choice',
            options: ['Thượng Hải', 'Bắc Kinh', 'Quảng Châu', 'Thâm Quyến'],
            correctAnswer: 1,
            explanation: 'Theo đoạn văn: "我的家在北京" - nhà tôi ở Bắc Kinh.',
          },
        ],
      },
    ];
    return passages;
  };

  // Check if data is loaded
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Đang tải bài đọc hiểu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (readingData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📚</Text>
          <Text style={styles.errorText}>Không có bài đọc hiểu</Text>
          <Text style={styles.errorSubtext}>Vui lòng thử lại sau</Text>
          <Button
            variant="primary"
            onPress={loadReadingData}
            style={styles.retryButton}
          >
            Thử lại
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Current state calculations
  const currentPassage = readingData[currentPassageIndex];
  const currentQuestion = currentPassage?.questions[currentQuestionIndex];
  const totalQuestions = readingData.reduce((sum: number, passage: ReadingPassage) => sum + passage.questions.length, 0);
  const answeredQuestions = readingData.slice(0, currentPassageIndex).reduce((sum, passage) => sum + passage.questions.length, 0) + currentQuestionIndex;
  const progress = totalQuestions > 0 ? ((answeredQuestions / totalQuestions) * 100).toFixed(0) : '0';

  useEffect(() => {
    // Reset animation when question changes
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentQuestionIndex, currentPassageIndex]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    setShowTranslation(false);
    
    if (currentQuestionIndex < currentPassage.questions.length - 1) {
      // Next question in same passage
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentPassageIndex < readingData.length - 1) {
      // Next passage
      setCurrentPassageIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      // Clear word highlighting when moving to new passage
      setWordAccuracies([]);
    } else {
      // Session complete
      setIsSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentPassageIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
    setShowTranslation(false);
    setIsSessionComplete(false);
    setWordAccuracies([]);
  };

  const handleWordAccuracy = (accuracies: WordAccuracy[]) => {
    setWordAccuracies(accuracies);
  };

  const handleWordPress = (word: string) => {
    console.log('Word pressed:', word);
  };

  const renderCompletionScreen = () => (
    <View style={styles.completionContainer}>
      <Card variant="elevated" style={styles.completionCard}>
        <View style={styles.completionHeader}>
          <Ionicons name="book" size={64} color={colors.primary[500]} />
          <Text style={styles.completionTitle}>Hoàn thành đọc hiểu!</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalQuestions}</Text>
            <Text style={styles.statLabel}>Câu hỏi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{((correctAnswers / totalQuestions) * 100).toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Độ chính xác</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Câu đúng</Text>
          </View>
        </View>
        
        <View style={styles.completionActions}>
          <Button
            variant="outline"
            size="lg"
            onPress={handleRestart}
            style={styles.actionButton}
          >
            Đọc lại
          </Button>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.back()}
            style={styles.actionButton}
          >
            Hoàn thành
          </Button>
        </View>
      </Card>
    </View>
  );

  if (isSessionComplete) {
    return (
      <SafeAreaView style={styles.container}>
        {renderCompletionScreen()}
      </SafeAreaView>
    );
  }

  if (!currentPassage || !currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi tải bài đọc</Text>
          <Button
            variant="primary"
            onPress={() => router.back()}
          >
            Quay lại
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Đọc hiểu</Text>
          <Text style={styles.headerSubtitle}>
            Bài {currentPassageIndex + 1}/{readingData.length} • Câu {currentQuestionIndex + 1}/{currentPassage.questions.length}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.translateButton}
          onPress={() => setShowTranslation(!showTranslation)}
        >
          <Ionicons 
            name={showTranslation ? "eye-off" : "eye"} 
            size={20} 
            color={colors.primary[500]} 
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progress}%` as any }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progress}% hoàn thành</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Reading Passage */}
        <Card variant="default" style={styles.passageCard}>
          <View style={styles.passageHeader}>
            <Text style={styles.passageTitle}>{currentPassage.title}</Text>
            <View style={styles.audioButtonContainer}>
              <AudioButton
                hanzi={currentPassage.content}
                pinyin=""
                tone={1}
                size="large"
              />
            </View>
          </View>
          
          {/* Chinese Text with Highlighting */}
          <View style={styles.textContainer}>
            <HighlightedChineseText
              text={currentPassage.content}
              wordAccuracies={wordAccuracies}
              style={styles.chineseText}
              onWordPress={handleWordPress}
            />
          </View>
          
          {/* Pinyin */}
          <View style={styles.pinyinContainer}>
            <Text style={styles.pinyinText}>{currentPassage.pinyin}</Text>
          </View>
          
          {/* Translation */}
          {showTranslation && (
            <Animated.View style={styles.translationContainer}>
              <Text style={styles.translationLabel}>Bản dịch:</Text>
              <Text style={styles.vietnameseText}>{currentPassage.vietnamese}</Text>
            </Animated.View>
          )}
        </Card>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'reading' && styles.activeTab]}
            onPress={() => setCurrentTab('reading')}
          >
            <Ionicons 
              name="book-outline" 
              size={20} 
              color={currentTab === 'reading' ? colors.primary[500] : colors.neutral[600]} 
            />
            <Text style={[
              styles.tabText,
              currentTab === 'reading' && styles.activeTabText
            ]}>
              Đọc hiểu
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, currentTab === 'speaking' && styles.activeTab]}
            onPress={() => setCurrentTab('speaking')}
          >
            <Ionicons 
              name="mic-outline" 
              size={20} 
              color={currentTab === 'speaking' ? colors.primary[500] : colors.neutral[600]} 
            />
            <Text style={[
              styles.tabText,
              currentTab === 'speaking' && styles.activeTabText
            ]}>
              Đọc to
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {currentTab === 'reading' ? (
          /* Question */
          <Card variant="elevated" style={styles.questionCard}>
          <Text style={styles.questionTitle}>
            Câu hỏi {currentQuestionIndex + 1}/{currentPassage.questions.length}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.selectedOption,
                  showResult && index === currentQuestion.correctAnswer && styles.correctOption,
                  showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && styles.incorrectOption,
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={showResult}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}</Text>
                  <Text style={[
                    styles.optionText,
                    selectedAnswer === index && styles.selectedOptionText,
                    showResult && index === currentQuestion.correctAnswer && styles.correctOptionText,
                  ]}>
                    {option}
                  </Text>
                </View>
                
                {showResult && index === currentQuestion.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accent[500]} />
                )}
                {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                  <Ionicons name="close-circle" size={24} color={colors.error[500]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Submit Button */}
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
          
          {/* Result */}
          {showResult && (
            <Animated.View style={styles.resultContainer}>
              <View style={[
                styles.resultHeader,
                selectedAnswer === currentQuestion.correctAnswer ? styles.correctResult : styles.incorrectResult
              ]}>
                <Ionicons 
                  name={selectedAnswer === currentQuestion.correctAnswer ? "checkmark-circle" : "close-circle"} 
                  size={32} 
                  color={selectedAnswer === currentQuestion.correctAnswer ? colors.accent[500] : colors.error[500]} 
                />
                <Text style={[
                  styles.resultTitle,
                  selectedAnswer === currentQuestion.correctAnswer ? styles.correctResultText : styles.incorrectResultText
                ]}>
                  {selectedAnswer === currentQuestion.correctAnswer ? 'Chính xác!' : 'Chưa đúng'}
                </Text>
              </View>
              
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              
              <Button
                variant="primary"
                size="lg"
                onPress={handleNextQuestion}
                style={styles.nextButton}
              >
                {currentQuestionIndex < currentPassage.questions.length - 1 || currentPassageIndex < readingData.length - 1 
                  ? 'Câu tiếp theo' 
                  : 'Hoàn thành'}
              </Button>
            </Animated.View>
          )}
        </Card>
        ) : (
          /* Speech Recognition Tab */
          <View style={styles.speechContainer}>
            <SmartSpeechRecognitionComponent
              expectedText={currentPassage.content}
              language="zh-CN"
              maxDuration={30000} // 30 seconds for reading
              onResult={(result) => {
                console.log('Pronunciation result:', result);
                // Handle pronunciation result here
              }}
              onError={(error) => {
                console.error('Speech recognition error:', error);
              }}
              onWordAccuracy={handleWordAccuracy}
              showExpectedText={false}
            />
          </View>
        )}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: getResponsiveSpacing('sm'),
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
  },
  headerSubtitle: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginTop: 2,
  },
  translateButton: {
    padding: getResponsiveSpacing('sm'),
  },
  progressContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('sm'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  progressBar: {
    flex: 1,
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
  progressText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  passageCard: {
    margin: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('lg'),
  },
  passageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  passageTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    flex: 1,
  },
  audioButtonContainer: {
    padding: getResponsiveSpacing('sm'),
    backgroundColor: colors.primary[100],
    borderRadius: 16,
  },
  textContainer: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  chineseText: {
    fontSize: getResponsiveFontSize('lg'),
    lineHeight: getResponsiveFontSize('lg') * 1.8,
    color: colors.neutral[900],
    textAlign: 'left',
  },
  pinyinContainer: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  pinyinText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
    fontStyle: 'italic',
    lineHeight: getResponsiveFontSize('sm') * 1.6,
  },
  translationContainer: {
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  translationLabel: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    fontWeight: '600',
    marginBottom: getResponsiveSpacing('xs'),
  },
  vietnameseText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[700],
    lineHeight: getResponsiveFontSize('sm') * 1.6,
  },
  questionCard: {
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('lg'),
  },
  questionTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.primary[600],
    marginBottom: getResponsiveSpacing('sm'),
  },
  questionText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('lg'),
    lineHeight: getResponsiveFontSize('lg') * 1.4,
  },
  optionsContainer: {
    gap: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('md'),
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  selectedOption: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  correctOption: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  incorrectOption: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  optionLabel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[200],
    color: colors.neutral[700],
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    flex: 1,
  },
  selectedOptionText: {
    color: colors.primary[700],
    fontWeight: '500',
  },
  correctOptionText: {
    color: colors.accent[700],
    fontWeight: '500',
  },
  submitButton: {
    alignSelf: 'stretch',
  },
  resultContainer: {
    marginTop: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('lg'),
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('md'),
  },
  correctResult: {
    // Additional styling for correct result if needed
  },
  incorrectResult: {
    // Additional styling for incorrect result if needed
  },
  resultTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
  },
  correctResultText: {
    color: colors.accent[600],
  },
  incorrectResultText: {
    color: colors.error[600],
  },
  explanationText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    lineHeight: getResponsiveFontSize('base') * 1.5,
    marginBottom: getResponsiveSpacing('lg'),
  },
  nextButton: {
    alignSelf: 'stretch',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  completionCard: {
    padding: getResponsiveSpacing('xl'),
    alignItems: 'center',
  },
  completionHeader: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xl'),
  },
  completionTitle: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginTop: getResponsiveSpacing('md'),
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('xl'),
    marginBottom: getResponsiveSpacing('xl'),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: getResponsiveFontSize('3xl'),
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  statLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('xs'),
  },
  completionActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('md'),
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: getResponsiveSpacing('xl'),
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing('sm'),
    paddingHorizontal: getResponsiveSpacing('md'),
    borderRadius: 6,
    gap: getResponsiveSpacing('xs'),
  },
  activeTab: {
    backgroundColor: colors.neutral[50],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[600],
  },
  activeTabText: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  speechContainer: {
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  loadingText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('md'),
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  errorIcon: {
    fontSize: getResponsiveFontSize('5xl'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  errorText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('md'),
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('xl'),
    lineHeight: 20,
  },
  retryButton: {
    marginTop: getResponsiveSpacing('md'),
  },
});
