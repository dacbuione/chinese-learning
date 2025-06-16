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

// Listening data interface
interface ListeningExercise {
  id: string;
  title: string;
  description: string;
  audioUrl: string; // In real app, this would be actual audio files
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

// Mock listening data
const listeningData: ListeningExercise[] = [
  {
    id: '1',
    title: 'Chào hỏi cơ bản - Basic Greetings',
    description: 'Luyện nghe các câu chào hỏi thường dùng trong tiếng Trung',
    audioUrl: 'mock_audio_1', // Would be actual audio file
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
    title: 'Hỏi đường - Asking for Directions',
    description: 'Luyện nghe cuộc hội thoại hỏi đường đơn giản',
    audioUrl: 'mock_audio_2',
    transcript: '请问，去图书馆怎么走？直走，然后左转。图书馆就在右边。谢谢你！不客气。',
    vietnamese: 'Xin hỏi, đi thư viện thế nào? Đi thẳng, rồi rẽ trái. Thư viện ở bên phải. Cảm ơn bạn! Không có gì.',
    difficulty: 'intermediate',
    hskLevel: 2,
    duration: 12,
    questions: [
      {
        id: '2-1',
        question: 'Người ta hỏi đường đến đâu?',
        type: 'multiple-choice',
        options: ['Thư viện', 'Trường học', 'Bệnh viện', 'Siêu thị'],
        correctAnswer: 0,
        explanation: '"去图书馆怎么走" nghĩa là "đi thư viện thế nào".',
        timeStart: 0,
        timeEnd: 3,
      },
      {
        id: '2-2',
        question: 'Hướng dẫn đi như thế nào?',
        type: 'multiple-choice',
        options: ['Đi thẳng rồi rẽ phải', 'Đi thẳng rồi rẽ trái', 'Rẽ trái rồi đi thẳng', 'Rẽ phải rồi đi thẳng'],
        correctAnswer: 1,
        explanation: '"直走，然后左转" nghĩa là "đi thẳng, rồi rẽ trái".',
        timeStart: 4,
        timeEnd: 8,
      },
      {
        id: '2-3',
        question: 'Thư viện ở phía nào?',
        type: 'multiple-choice',
        options: ['Bên trái', 'Bên phải', 'Phía trước', 'Phía sau'],
        correctAnswer: 1,
        explanation: '"图书馆就在右边" nghĩa là "thư viện ở bên phải".',
        timeStart: 8,
        timeEnd: 10,
      },
    ],
  },
];

export default function ListeningPracticeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
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

  const currentExercise = listeningData[currentExerciseIndex];
  const currentQuestion = currentExercise.questions[currentQuestionIndex];
  const totalQuestions = listeningData.reduce((sum: number, exercise: ListeningExercise) => sum + exercise.questions.length, 0);
  const answeredQuestions = (currentExerciseIndex * currentExercise.questions.length) + currentQuestionIndex;
  const progress = ((answeredQuestions / totalQuestions) * 100).toFixed(0);

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
    if (isPlaying && currentTime < currentExercise.duration) {
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
  }, [isPlaying, currentTime, currentExercise.duration]);

  const handlePlayAudio = async () => {
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
    const currentSpeedIndex = speeds.indexOf(playbackSpeed);
    const nextSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextSpeedIndex]);
  };

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
    setShowTranscript(false);
    setCurrentTime(0);
    setIsPlaying(false);
    
    if (currentQuestionIndex < currentExercise.questions.length - 1) {
      // Next question in same exercise
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentExerciseIndex < listeningData.length - 1) {
      // Next exercise
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
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
    setPlaybackSpeed(1.0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
            Nghe lại
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
        {/* Audio Player */}
        <Card variant="elevated" style={styles.audioCard}>
          <View style={styles.audioHeader}>
            <View style={styles.audioInfo}>
              <Text style={styles.audioTitle}>{currentExercise.title}</Text>
              <Text style={styles.audioDescription}>{currentExercise.description}</Text>
              <View style={styles.audioBadge}>
                <Text style={styles.audioBadgeText}>HSK {currentExercise.hskLevel}</Text>
              </View>
            </View>
          </View>
          
          {/* Audio Waveform Visualization */}
          <View style={styles.waveformContainer}>
            {[...Array(20)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: audioWaveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, Math.random() * 40 + 10],
                    }),
                    opacity: audioWaveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              />
            ))}
          </View>
          
          {/* Audio Controls */}
          <View style={styles.audioControls}>
            <TouchableOpacity
              style={[
                styles.playButton,
                (isTTSLoading || isTTSPlaying) && styles.playButtonActive
              ]}
              onPress={handlePlayAudio}
              disabled={isTTSLoading}
            >
              {isTTSLoading ? (
                <ActivityIndicator size="small" color={colors.neutral[50]} />
              ) : (
                <Ionicons 
                  name={(isPlaying || isTTSPlaying) ? "pause" : "play"} 
                  size={32} 
                  color={colors.neutral[50]} 
                />
              )}
            </TouchableOpacity>
            
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(currentExercise.duration)}
              </Text>
              
              {/* Progress Slider */}
              <View style={styles.audioProgressContainer}>
                <View style={styles.audioProgressBar}>
                  <View 
                    style={[
                      styles.audioProgressFill,
                      { width: `${(currentTime / currentExercise.duration) * 100}%` as any }
                    ]}
                  />
                </View>
                
                {/* Question time markers */}
                {currentQuestion.timeStart && currentQuestion.timeEnd && (
                  <View style={styles.questionMarkers}>
                    <View 
                      style={[
                        styles.questionMarker,
                        { left: `${(currentQuestion.timeStart / currentExercise.duration) * 100}%` as any }
                      ]}
                    />
                    <View 
                      style={[
                        styles.questionMarker,
                        { left: `${(currentQuestion.timeEnd / currentExercise.duration) * 100}%` as any }
                      ]}
                    />
                  </View>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.speedButton}
              onPress={handleSpeedChange}
            >
              <Text style={styles.speedText}>{playbackSpeed}x</Text>
            </TouchableOpacity>
          </View>
          
          {/* Quick Seek Buttons */}
          <View style={styles.seekButtons}>
            <TouchableOpacity
              style={styles.seekButton}
              onPress={() => handleSeekTo(Math.max(0, currentTime - 5))}
            >
              <Ionicons name="play-back" size={16} color={colors.primary[600]} />
              <Text style={styles.seekButtonText}>-5s</Text>
            </TouchableOpacity>
            
            {currentQuestion.timeStart && (
              <TouchableOpacity
                style={styles.seekButton}
                onPress={() => handleSeekTo(currentQuestion.timeStart || 0)}
              >
                <Ionicons name="locate" size={16} color={colors.accent[600]} />
                <Text style={styles.seekButtonText}>Câu hỏi</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.seekButton}
              onPress={() => handleSeekTo(Math.min(currentExercise.duration, currentTime + 5))}
            >
              <Ionicons name="play-forward" size={16} color={colors.primary[600]} />
              <Text style={styles.seekButtonText}>+5s</Text>
            </TouchableOpacity>
          </View>
          
          {/* Transcript */}
          {showTranscript && (
            <Animated.View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>Bản ghi âm:</Text>
              <Text style={styles.chineseTranscript}>{currentExercise.transcript}</Text>
              <Text style={styles.vietnameseTranscript}>{currentExercise.vietnamese}</Text>
            </Animated.View>
          )}
        </Card>

        {/* Question */}
        <Card variant="elevated" style={styles.questionCard}>
          <Text style={styles.questionTitle}>
            Câu hỏi {currentQuestionIndex + 1}/{currentExercise.questions.length}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          {currentQuestion.timeStart && currentQuestion.timeEnd && (
            <View style={styles.questionTimeHint}>
              <Ionicons name="time" size={16} color={colors.warning[500]} />
              <Text style={styles.questionTimeText}>
                Nghe từ {formatTime(currentQuestion.timeStart)} đến {formatTime(currentQuestion.timeEnd)}
              </Text>
            </View>
          )}
          
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
                {currentQuestionIndex < currentExercise.questions.length - 1 || currentExerciseIndex < listeningData.length - 1 
                  ? 'Câu tiếp theo' 
                  : 'Hoàn thành'}
              </Button>
            </Animated.View>
          )}
        </Card>
        
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
  transcriptButton: {
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
  audioCard: {
    margin: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('lg'),
  },
  audioHeader: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  audioInfo: {
    gap: getResponsiveSpacing('sm'),
  },
  audioTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
  },
  audioDescription: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  audioBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary[100],
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('xs'),
    borderRadius: 16,
  },
  audioBadgeText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.primary[700],
    fontWeight: '600',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    marginBottom: getResponsiveSpacing('lg'),
    paddingHorizontal: getResponsiveSpacing('sm'),
  },
  waveformBar: {
    width: 3,
    backgroundColor: colors.primary[400],
    borderRadius: 2,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: colors.accent[500],
  },
  timeContainer: {
    flex: 1,
    gap: getResponsiveSpacing('sm'),
  },
  timeText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    textAlign: 'center',
  },
  audioProgressContainer: {
    position: 'relative',
  },
  audioProgressBar: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  audioProgressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  questionMarkers: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
  },
  questionMarker: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: colors.accent[500],
    borderRadius: 1,
  },
  speedButton: {
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  },
  speedText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[700],
    fontWeight: '600',
  },
  seekButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: getResponsiveSpacing('md'),
  },
  seekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  },
  seekButtonText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  transcriptContainer: {
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  transcriptLabel: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    fontWeight: '600',
    marginBottom: getResponsiveSpacing('sm'),
  },
  chineseTranscript: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
    lineHeight: getResponsiveFontSize('base') * 1.5,
  },
  vietnameseTranscript: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[700],
    lineHeight: getResponsiveFontSize('sm') * 1.5,
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
    marginBottom: getResponsiveSpacing('md'),
    lineHeight: getResponsiveFontSize('lg') * 1.4,
  },
  questionTimeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
    marginBottom: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('sm'),
    backgroundColor: colors.warning[50],
    borderRadius: 8,
  },
  questionTimeText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.warning[700],
    fontWeight: '500',
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
}); 