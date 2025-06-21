import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLessonTTS } from '../../../src/hooks/useTTS';

// Import components and theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../src/theme';
import { useTranslation } from '../../../src/localization';
import { Card } from '../../../src/components/ui/atoms/Card';
import { Button } from '../../../src/components/ui/atoms/Button';
import { api } from '../../../src/services/api/client';

// Listening data interface
interface ListeningExercise {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  transcript: string;
  vietnamese: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hskLevel: number;
  questions: ListeningQuestion[];
  duration: number; // in seconds
}

interface ListeningQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  timeStart?: number; // time in audio when question is relevant
  timeEnd?: number;
}

export default function ListeningPracticeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [listeningData, setListeningData] = useState<ListeningExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Animation values
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);
  const audioWaveAnim = new Animated.Value(0);

  // TTS Hook
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    speakLessonContent,
    stop: stopTTS,
  } = useLessonTTS();

  // Load listening data from API
  useEffect(() => {
    loadListeningData();
  }, []);

  const loadListeningData = async () => {
    try {
      setIsLoading(true);
      
      // Get vocabulary data to generate listening exercises
      const vocabularyResponse = await api.vocabulary.getAll();
      
      if (vocabularyResponse.success && vocabularyResponse.data) {
        const vocabulary = vocabularyResponse.data;
        const generatedExercises = generateListeningExercises(vocabulary);
        setListeningData(generatedExercises);
      } else {
        console.error('Failed to load vocabulary:', vocabularyResponse.error);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu từ vựng. Vui lòng thử lại.');
        setListeningData([]);
      }
    } catch (error) {
      console.error('Error loading listening data:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      setListeningData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateListeningExercises = (vocabulary: any[]): ListeningExercise[] => {
    // Generate listening exercises based on vocabulary data
    const exercises: ListeningExercise[] = [
      {
        id: '1',
        title: 'Chào hỏi cơ bản - Basic Greetings',
        description: 'Luyện nghe các câu chào hỏi thường dùng trong tiếng Trung',
        audioUrl: 'generated_audio_1',
        transcript: '你好！我叫李明。很高兴认识你。你叫什么名字？',
        vietnamese: 'Xin chào! Tôi tên là Lý Minh. Rất vui được gặp bạn. Bạn tên gì?',
        difficulty: 'beginner',
        hskLevel: 1,
        duration: 8,
        questions: [
          {
            id: '1-1',
            question: 'Người nói tên gì?',
            type: 'multiple-choice',
            options: ['Lý Minh', 'Vương Hoa', 'Trương San', 'Lý Tư'],
            correctAnswer: 0,
            explanation: 'Trong audio có câu "我叫李明" nghĩa là "Tôi tên là Lý Minh".',
            timeStart: 1,
            timeEnd: 3,
          },
          {
            id: '1-2',
            question: 'Người nói hỏi gì ở cuối?',
            type: 'multiple-choice',
            options: ['Bạn bao nhiêu tuổi?', 'Bạn tên gì?', 'Bạn ở đâu?', 'Bạn học gì?'],
            correctAnswer: 1,
            explanation: '"你叫什么名字？" nghĩa là "Bạn tên gì?".',
            timeStart: 5,
            timeEnd: 8,
          },
        ],
      },
      {
        id: '2',
        title: 'Số đếm - Numbers',
        description: 'Luyện nghe các số từ 1-10 trong tiếng Trung',
        audioUrl: 'generated_audio_2',
        transcript: '一、二、三、四、五、六、七、八、九、十。现在我们数到十。',
        vietnamese: 'Một, hai, ba, bốn, năm, sáu, bảy, tám, chín, mười. Bây giờ chúng ta đếm đến mười.',
        difficulty: 'beginner',
        hskLevel: 1,
        duration: 10,
        questions: [
          {
            id: '2-1',
            question: 'Số nào được nói đầu tiên?',
            type: 'multiple-choice',
            options: ['Không', 'Một', 'Hai', 'Ba'],
            correctAnswer: 1,
            explanation: '"一" (yī) nghĩa là "một" và được nói đầu tiên.',
            timeStart: 0,
            timeEnd: 2,
          },
          {
            id: '2-2',
            question: 'Audio đếm đến số mấy?',
            type: 'multiple-choice',
            options: ['Tám', 'Chín', 'Mười', 'Mười một'],
            correctAnswer: 2,
            explanation: '"十" (shí) nghĩa là "mười" và là số cuối cùng được đếm.',
            timeStart: 8,
            timeEnd: 10,
          },
        ],
      },
    ];

    // If we have vocabulary data, create more dynamic exercises
    if (vocabulary.length > 0) {
      // Group vocabulary by HSK level or difficulty
      const beginnerWords = vocabulary.filter(v => 
        v.difficulty === 'hsk1' || v.difficulty === 'hsk2'
      ).slice(0, 10);

      if (beginnerWords.length >= 3) {
        exercises.push({
          id: '3',
          title: 'Từ vựng cơ bản',
          description: 'Luyện nghe từ vựng tiếng Trung cơ bản',
          audioUrl: 'generated_vocabulary',
          transcript: beginnerWords.map(w => w.hanzi).join('，') + '。',
          vietnamese: beginnerWords.map(w => w.vietnameseTranslation).join(', ') + '.',
          difficulty: 'beginner',
          hskLevel: 1,
          duration: 15,
          questions: [
            {
              id: '3-1',
              question: `Từ "${beginnerWords[0]?.hanzi}" có nghĩa là gì?`,
              type: 'multiple-choice',
              options: [
                beginnerWords[0]?.vietnameseTranslation || '',
                beginnerWords[1]?.vietnameseTranslation || '',
                beginnerWords[2]?.vietnameseTranslation || '',
                'Không có đáp án nào đúng',
              ],
              correctAnswer: 0,
              explanation: `"${beginnerWords[0]?.hanzi}" nghĩa là "${beginnerWords[0]?.vietnameseTranslation}".`,
            },
            {
              id: '3-2',
              question: `Phiên âm của từ "${beginnerWords[1]?.hanzi}" là gì?`,
              type: 'multiple-choice',
              options: [
                beginnerWords[1]?.pinyin || '',
                beginnerWords[0]?.pinyin || '',
                beginnerWords[2]?.pinyin || '',
                'Không có đáp án nào đúng',
              ],
              correctAnswer: 0,
              explanation: `"${beginnerWords[1]?.hanzi}" có phiên âm là "${beginnerWords[1]?.pinyin}".`,
            },
          ],
        });
      }
    }

    return exercises;
  };

  const currentExercise = listeningData[currentExerciseIndex];
  const currentQuestion = currentExercise?.questions[currentQuestionIndex];
  const totalQuestions = listeningData.reduce((sum: number, exercise: ListeningExercise) => sum + exercise.questions.length, 0);
  const answeredQuestions = listeningData.slice(0, currentExerciseIndex).reduce((sum, exercise) => sum + exercise.questions.length, 0) + currentQuestionIndex;
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
  }, [currentQuestionIndex, currentExerciseIndex]);

  // Audio wave animation
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(audioWaveAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(audioWaveAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      audioWaveAnim.setValue(0);
    }
  }, [isPlaying]);

  // Mock audio timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentTime < currentExercise?.duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= currentExercise.duration) {
            setIsPlaying(false);
            return currentExercise.duration;
          }
          return newTime;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTime, currentExercise?.duration]);

  const handlePlayAudio = async () => {
    if (!currentExercise) return;
    
    try {
      if (currentTime >= currentExercise.duration) {
        setCurrentTime(0);
      }
      
      if (isTTSPlaying) {
        await stopTTS();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        await speakLessonContent({
          chinese: currentExercise.transcript,
          speed: playbackSpeed,
        });
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      Alert.alert('Lỗi phát âm', 'Không thể phát âm thanh. Vui lòng thử lại.');
      setIsPlaying(false);
    }
  };

  const handleSeekTo = (time: number) => {
    setCurrentTime(time);
  };

  const handleSpeedChange = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;
    
    setShowResult(true);
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!currentExercise) return;
    
    setShowResult(false);
    setSelectedAnswer(null);
    setShowTranscript(false);
    
    if (currentQuestionIndex < currentExercise.questions.length - 1) {
      // Next question in same exercise
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentExerciseIndex < listeningData.length - 1) {
      // Next exercise
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setCurrentTime(0);
    } else {
      // Session complete
      setIsSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentExerciseIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers(0);
    setShowTranscript(false);
    setIsSessionComplete(false);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary[500]} />
      <Text style={styles.loadingText}>Đang tải bài luyện nghe...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="headset-outline" size={64} color={colors.neutral[400]} />
      <Text style={styles.emptyTitle}>Không có bài luyện nghe</Text>
      <Text style={styles.emptyDescription}>
        Không thể tải dữ liệu luyện nghe. Vui lòng thử lại.
      </Text>
      <Button
        variant="outline"
        size="md"
        onPress={loadListeningData}
        style={styles.retryButton}
      >
        Thử lại
      </Button>
    </View>
  );

  const renderCompletionScreen = () => (
    <View style={styles.completionContainer}>
      <Card variant="elevated" style={styles.completionCard}>
        <View style={styles.completionHeader}>
          <Ionicons name="headset" size={64} color={colors.primary[500]} />
          <Text style={styles.completionTitle}>Hoàn thành luyện nghe!</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalQuestions}</Text>
            <Text style={styles.statLabel}>Câu hỏi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(0) : 0}%</Text>
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
            Luyện lại
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  if (listeningData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  if (isSessionComplete) {
    return (
      <SafeAreaView style={styles.container}>
        {renderCompletionScreen()}
      </SafeAreaView>
    );
  }

  if (!currentExercise || !currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        {renderEmptyState()}
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
          <Text style={styles.headerTitle}>Luyện nghe</Text>
          <Text style={styles.headerSubtitle}>
            Bài {currentExerciseIndex + 1}/{listeningData.length} • Câu {currentQuestionIndex + 1}/{currentExercise.questions.length}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.transcriptButton}
          onPress={() => setShowTranscript(!showTranscript)}
        >
          <Ionicons 
            name={showTranscript ? "eye-off" : "eye"} 
            size={24} 
            color={colors.neutral[600]} 
          />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Audio Player */}
        <Card variant="elevated" style={styles.audioCard}>
          <Text style={styles.exerciseTitle}>{currentExercise.title}</Text>
          <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>
          
          {/* Audio Controls */}
          <View style={styles.audioControls}>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlayAudio}
              disabled={isTTSLoading}
            >
              {isTTSLoading ? (
                <ActivityIndicator size="small" color={colors.neutral[50]} />
              ) : (
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={24} 
                  color={colors.neutral[50]} 
                />
              )}
            </TouchableOpacity>
            
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(currentExercise.duration)}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.speedButton}
              onPress={handleSpeedChange}
            >
              <Text style={styles.speedText}>{playbackSpeed}x</Text>
            </TouchableOpacity>
          </View>
          
          {/* Audio Wave Animation */}
          {isPlaying && (
            <View style={styles.waveContainer}>
              <Animated.View 
                style={[
                  styles.wave,
                  { 
                    opacity: audioWaveAnim,
                    transform: [{ scaleY: audioWaveAnim }]
                  }
                ]} 
              />
            </View>
          )}
          
          {/* Transcript */}
          {showTranscript && (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>Bản ghi âm:</Text>
              <Text style={styles.transcriptChinese}>{currentExercise.transcript}</Text>
              <Text style={styles.transcriptVietnamese}>{currentExercise.vietnamese}</Text>
            </View>
          )}
        </Card>

        {/* Question */}
        <Card variant="elevated" style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
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
                  <Text style={[
                    styles.optionText,
                    selectedAnswer === index && styles.selectedOptionText,
                    showResult && index === currentQuestion.correctAnswer && styles.correctOptionText,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {showResult && (
            <View style={styles.resultContainer}>
              <View style={[
                styles.resultBadge,
                selectedAnswer === currentQuestion.correctAnswer ? styles.correctBadge : styles.incorrectBadge
              ]}>
                <Ionicons 
                  name={selectedAnswer === currentQuestion.correctAnswer ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={colors.neutral[50]} 
                />
                <Text style={styles.resultText}>
                  {selectedAnswer === currentQuestion.correctAnswer ? 'Chính xác!' : 'Sai rồi!'}
                </Text>
              </View>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {!showResult ? (
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            style={styles.actionButton}
          >
            Xác nhận
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onPress={handleNextQuestion}
            style={styles.actionButton}
          >
            {currentQuestionIndex < currentExercise.questions.length - 1 
              ? 'Câu tiếp theo'
              : currentExerciseIndex < listeningData.length - 1
              ? 'Bài tiếp theo'
              : 'Hoàn thành'
            }
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  loadingText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
    paddingHorizontal: getResponsiveSpacing('xl'),
  },
  emptyTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[700],
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: getResponsiveSpacing('md'),
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: getResponsiveSpacing('xs'),
  },
  transcriptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
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
  },
  progressText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.primary[600],
    minWidth: 40,
  },
  content: {
    flex: 1,
  },
  audioCard: {
    margin: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('lg'),
  },
  exerciseTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  exerciseDescription: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginBottom: getResponsiveSpacing('lg'),
    lineHeight: 20,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('md'),
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  timeText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontFamily: 'monospace',
  },
  speedButton: {
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: Layout.isMobile ? 16 : 20,
    backgroundColor: colors.neutral[100],
  },
  speedText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[700],
  },
  waveContainer: {
    height: 40,
    justifyContent: 'center',
    marginVertical: getResponsiveSpacing('md'),
  },
  wave: {
    height: 4,
    backgroundColor: colors.primary[300],
    borderRadius: 2,
  },
  transcriptContainer: {
    marginTop: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[100],
    borderRadius: Layout.isMobile ? 12 : 16,
  },
  transcriptLabel: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('sm'),
  },
  transcriptChinese: {
    fontSize: getResponsiveFontSize('lg'),
    fontFamily: 'System',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
    lineHeight: 28,
  },
  transcriptVietnamese: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    fontStyle: 'italic',
    lineHeight: 24,
  },
  questionCard: {
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('lg'),
  },
  questionText: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '500',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('lg'),
    lineHeight: 28,
  },
  optionsContainer: {
    gap: getResponsiveSpacing('md'),
  },
  optionButton: {
    padding: getResponsiveSpacing('md'),
    borderRadius: Layout.isMobile ? 12 : 16,
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
  optionText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    textAlign: 'center',
  },
  selectedOptionText: {
    color: colors.primary[700],
    fontWeight: '500',
  },
  correctOptionText: {
    color: colors.accent[700],
    fontWeight: '500',
  },
  resultContainer: {
    marginTop: getResponsiveSpacing('lg'),
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: Layout.isMobile ? 20 : 24,
    marginBottom: getResponsiveSpacing('md'),
  },
  correctBadge: {
    backgroundColor: colors.accent[500],
  },
  incorrectBadge: {
    backgroundColor: colors.error[500],
  },
  resultText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '500',
    color: colors.neutral[50],
  },
  explanationText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionContainer: {
    padding: getResponsiveSpacing('lg'),
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  actionButton: {
    width: '100%',
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
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: getResponsiveSpacing('xl'),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: 'bold',
    color: colors.primary[500],
  },
  statLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('xs'),
  },
  completionActions: {
    flexDirection: Layout.isMobile ? 'column' : 'row',
    gap: getResponsiveSpacing('md'),
    width: '100%',
  },
}); 