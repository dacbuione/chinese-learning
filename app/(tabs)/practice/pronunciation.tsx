import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

// Components
import { TranslationText } from '../../../src/components/ui/atoms/Text';
import { Button } from '../../../src/components/ui/atoms/Button';
import { Card } from '../../../src/components/ui/atoms/Card';
import NativeSpeechButton from '../../../src/components/features/speech/NativeSpeechButton';

// Hooks
import { usePronunciationTTS } from '../../../src/hooks/useTTS';
import { SpeechResult } from '../../../src/hooks/useEnhancedNativeSpeech';

// Theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../src/theme';

// API
import { api } from '../../../src/services/api/client';
import { ArrowLeft, Mic } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PronunciationPracticeScreen() {
  const router = useRouter();

  // TTS Hook
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    error: ttsError,
    speakForPractice,
    stop: stopTTS,
  } = usePronunciationTTS();

  // Dynamic pronunciation exercises loaded from API
  const [pronunciationExercises, setPronunciationExercises] = useState<Array<{
    id: string;
    character: string;
    pinyin: string;
    vietnamese: string;
    english: string;
    audioUrl: string;
    difficulty: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load pronunciation exercises from API
  useEffect(() => {
    loadPronunciationExercises();
  }, []);

  const loadPronunciationExercises = async () => {
    try {
      setIsLoading(true);
      const response = await api.vocabulary.getForPronunciationPractice();
      
      if (response.success && response.data) {
        // Transform API data to match component interface
        const transformedExercises = response.data.map((item: any) => ({
          id: item.id,
          character: item.hanzi,
          pinyin: item.pinyin,
          vietnamese: item.vietnameseTranslation,
          english: item.englishTranslation,
          audioUrl: item.audioUrl || '',
          difficulty: getDifficultyLabel(item.difficulty),
        }));
        
        setPronunciationExercises(transformedExercises);
      } else {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu luyện phát âm. Vui lòng thử lại.');
        setPronunciationExercises([]);
      }
    } catch (error) {
      console.error('Error loading pronunciation exercises:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      setPronunciationExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'hsk1':
      case 'hsk2':
        return 'beginner';
      case 'hsk3':
      case 'hsk4':
        return 'intermediate';
      case 'hsk5':
      case 'hsk6':
        return 'advanced';
      default:
        return 'beginner';
    }
  };

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<Array<{ accuracy: number; transcript: string }>>([]);
  const [showResults, setShowResults] = useState(false);

  const currentExercise = pronunciationExercises[currentExerciseIndex];

  const handlePlayAudio = async () => {
    try {
      if (isTTSPlaying) {
        await stopTTS();
      } else {
        await speakForPractice(currentExercise.character, 0.8);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      Alert.alert('Lỗi phát âm', 'Không thể phát âm thanh. Vui lòng thử lại.');
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setIsRecording(false);
      Alert.alert('Ghi âm hoàn thành', 'Độ chính xác: 85%');
    }, 3000);
  };

  const handleSpeechResult = (result: SpeechResult & { accuracy: number }) => {
    console.log('🎯 Speech result received:', result);
    
    const newResult = {
      accuracy: result.accuracy,
      transcript: result.transcript
    };
    
    setResults(prev => [...prev, newResult]);

    // Show feedback based on accuracy
    if (result.accuracy >= 0.8) {
      Alert.alert(
        '🎉 Xuất sắc!',
        `Độ chính xác: ${(result.accuracy * 100).toFixed(1)}%\nBạn phát âm rất tốt!`,
        [
          { text: 'Tiếp tục', onPress: goToNextExercise }
        ]
      );
    } else if (result.accuracy >= 0.6) {
      Alert.alert(
        '👍 Tốt!',
        `Độ chính xác: ${(result.accuracy * 100).toFixed(1)}%\nCần cải thiện một chút.`,
        [
          { text: 'Thử lại', style: 'cancel' },
          { text: 'Tiếp tục', onPress: goToNextExercise }
        ]
      );
    } else {
      Alert.alert(
        '🔄 Cần luyện tập',
        `Độ chính xác: ${(result.accuracy * 100).toFixed(1)}%\nHãy nghe và lặp lại.`,
        [
          { text: 'Thử lại', style: 'default' },
          { text: 'Bỏ qua', onPress: goToNextExercise }
        ]
      );
    }
  };

  const handleSpeechError = (error: string) => {
    console.error('❌ Speech error:', error);
    Alert.alert('Lỗi nhận diện', error);
  };

  const nextExercise = () => {
    if (currentExerciseIndex < pronunciationExercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
    }
  };

  const goToNextExercise = () => {
    if (currentExerciseIndex < pronunciationExercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const restartExercises = () => {
    setCurrentExerciseIndex(0);
    setResults([]);
    setShowResults(false);
  };

  const calculateOverallAccuracy = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.accuracy, 0);
    return total / results.length;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return colors.accent[500];
      case 'intermediate':
        return colors.warning[500];
      case 'advanced':
        return colors.error[500];
      default:
        return colors.neutral[500];
    }
  };

  const getDifficultyDisplayLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung bình';
      case 'advanced':
        return 'Nâng cao';
      default:
        return '';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <TranslationText style={styles.loadingText}>Đang tải bài luyện tập...</TranslationText>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (pronunciationExercises.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="mic-outline" size={64} color={colors.neutral[400]} />
          <TranslationText style={styles.emptyTitle}>Không có bài luyện tập</TranslationText>
          <TranslationText style={styles.emptyDescription}>
            Không tìm thấy bài luyện phát âm nào. Vui lòng thử lại.
          </TranslationText>
          <Button
            variant="outline"
            size="md"
            onPress={loadPronunciationExercises}
            style={styles.retryButton}
          >
            Thử lại
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
                     <View style={styles.resultsHeader}>
             <TranslationText style={styles.title}>🎉 Kết Quả Luyện Tập</TranslationText>
            <TranslationText style={styles.subtitle}>
              Độ chính xác tổng thể: {(calculateOverallAccuracy() * 100).toFixed(1)}%
            </TranslationText>
          </View>

          <View style={styles.resultsContainer}>
            {results.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <TranslationText style={styles.resultExercise}>
                    Bài {index + 1}: {pronunciationExercises[index].character}
                  </TranslationText>
                  <TranslationText style={[
                    styles.resultAccuracy,
                    { color: result.accuracy >= 0.8 ? colors.accent[500] : 
                             result.accuracy >= 0.6 ? colors.secondary[500] : 
                             colors.error[500] }
                  ]}>
                    {(result.accuracy * 100).toFixed(1)}%
                  </TranslationText>
                </View>
                <TranslationText style={styles.resultTranscript}>
                  Bạn nói: "{result.transcript}"
                </TranslationText>
              </View>
            ))}
          </View>

                     <View style={styles.actionsContainer}>
             <TouchableOpacity style={styles.button} onPress={restartExercises}>
               <TranslationText style={styles.buttonText}>🔄 Luyện Tập Lại</TranslationText>
             </TouchableOpacity>
           </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Card variant="default" style={styles.exerciseCard}>
          {/* Difficulty Badge */}
          <View style={styles.difficultyContainer}>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor: getDifficultyColor(
                    currentExercise.difficulty
                  ),
                },
              ]}
            >
              <TranslationText size="xs" color={colors.neutral[50]}>
                {getDifficultyDisplayLabel(currentExercise.difficulty)}
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
          <TranslationText
            size="2xl"
            color={colors.primary[600]}
            style={styles.pinyin}
          >
            {currentExercise.pinyin}
          </TranslationText>

          {/* Translations */}
          <View style={styles.translationsContainer}>
            <TranslationText
              size="lg"
              weight="medium"
              color={colors.neutral[800]}
            >
              {currentExercise.vietnamese}
            </TranslationText>
            <TranslationText size="base" color={colors.neutral[600]}>
              {currentExercise.english}
            </TranslationText>
          </View>

          {/* Audio Controls */}
          <View style={styles.audioControls}>
            {/* Audio Button */}
            <TouchableOpacity
              style={[
                styles.audioButton,
                isTTSPlaying && styles.audioButtonActive,
              ]}
              onPress={handlePlayAudio}
              disabled={isTTSLoading}
            >
              <Ionicons
                name={isTTSPlaying ? "pause" : "volume-high"}
                size={32}
                color={isTTSPlaying ? colors.neutral[50] : colors.primary[500]}
              />
            </TouchableOpacity>

            {/* Record Button */}
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

        {/* Native Speech Button */}
        <NativeSpeechButton
          expectedText={currentExercise.character}
          onResult={handleSpeechResult}
          onError={handleSpeechError}
          language="zh-CN"
        />

        {/* Tips */}
        <Card variant="default" style={styles.tipsContainer}>
          <TranslationText
            size="sm"
            weight="medium"
            color={colors.primary[600]}
          >
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
                  backgroundColor:
                    index === currentExerciseIndex
                      ? colors.primary[500]
                      : colors.neutral[300],
                },
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
    borderWidth: 1,
    borderColor: colors.primary[500],
    height: 50,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  recordButton: {
    flexDirection: 'row',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    gap: getResponsiveSpacing('sm'),
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
  scrollContent: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingBottom: getResponsiveSpacing('xl'),
  },
  resultsHeader: {
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing('lg'),
  },
  title: {
    fontSize: getResponsiveFontSize('3xl'),
    fontWeight: '700',
    color: colors.primary[500],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  subtitle: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
  },
  resultsContainer: {
    marginBottom: getResponsiveSpacing('xl'),
  },
  resultItem: {
    backgroundColor: colors.neutral[100],
    padding: getResponsiveSpacing('lg'),
    borderRadius: Layout.isMobile ? 12 : 16,
    marginBottom: getResponsiveSpacing('md'),
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  resultExercise: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[900],
    flex: 1,
  },
  resultAccuracy: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '700',
  },
  resultTranscript: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
  actionsContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.primary[500],
    paddingVertical: getResponsiveSpacing('lg'),
    paddingHorizontal: getResponsiveSpacing('xl'),
    borderRadius: Layout.isMobile ? 25 : 30,
    minWidth: Layout.isMobile ? 200 : 250,
    alignItems: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: colors.neutral[50],
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
  },
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  emptyTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[700],
    marginTop: getResponsiveSpacing('lg'),
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[500],
    marginTop: getResponsiveSpacing('sm'),
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: getResponsiveSpacing('lg'),
  },
});
