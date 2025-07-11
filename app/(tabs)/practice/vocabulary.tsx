import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import components and theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../src/theme';
import { useTranslation } from '../../../src/localization';
import { useVocabularyTTS } from '../../../src/hooks/useTTS';
import { Card } from '../../../src/components/ui/atoms/Card';
import { Button } from '../../../src/components/ui/atoms/Button';
import { ProgressBar } from '../../../src/components/ui/molecules/ProgressBar';
import { api } from '../../../src/services/api/client';

// Vocabulary data interface
interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  vietnameseTranslation: string;
  englishTranslation: string;
  tone: number;
  difficulty: 'hsk1' | 'hsk2' | 'hsk3' | 'hsk4' | 'hsk5' | 'hsk6';
  category?: string;
  audio?: string;
}

export default function VocabularyPracticeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [vocabularyData, setVocabularyData] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'khó nhớ' | 'bình thường' | 'dễ nhớ' | null>(null);

  // TTS Hook
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    speakVocabulary,
    stop: stopTTS,
  } = useVocabularyTTS();

  // Animation values
  const fadeAnim = new Animated.Value(1);
  const slideAnim = new Animated.Value(0);

  // Load vocabulary data from API
  useEffect(() => {
    loadVocabularyData();
  }, []);

  const loadVocabularyData = async () => {
    try {
      setIsLoading(true);
      const response = await api.vocabulary.getAll();
      
      if (response.success && response.data) {
        // Transform API data to match component interface
        const transformedData: VocabularyItem[] = response.data.map((item: any) => ({
          id: item.id,
          hanzi: item.hanzi,
          pinyin: item.pinyin,
          vietnameseTranslation: item.vietnameseTranslation,
          englishTranslation: item.englishTranslation,
          tone: item.tone,
          difficulty: item.difficulty,
          category: item.tags?.[0] || 'general',
          audio: item.audioUrl,
        }));
        
        setVocabularyData(transformedData);
      } else {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu từ vựng. Vui lòng thử lại.');
        // Fallback to empty array
        setVocabularyData([]);
      }
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      setVocabularyData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = vocabularyData[currentIndex];
  const totalCards = vocabularyData.length;
  const progress = totalCards > 0 ? ((sessionCount / totalCards) * 100).toFixed(0) : '0';
  const accuracy = sessionCount > 0 ? ((correctCount / sessionCount) * 100).toFixed(0) : '0';

  useEffect(() => {
    if (vocabularyData.length > 0) {
      // Reset animation when card changes
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
    }
  }, [currentIndex, vocabularyData]);

  const getToneColor = (tone: number) => {
    const toneColors = {
      1: colors.error[500],    // First tone - red
      2: colors.warning[500],  // Second tone - yellow/orange
      3: colors.accent[500],   // Third tone - green
      4: colors.primary[600],  // Fourth tone - blue
    };
    return toneColors[tone as keyof typeof toneColors] || colors.neutral[500];
  };

  const handlePlayAudio = async () => {
    if (!currentCard) return;
    
    try {
      if (isTTSPlaying) {
        await stopTTS();
      } else {
        await speakVocabulary({
          simplified: currentCard.hanzi,
          pinyin: currentCard.pinyin,
          tone: currentCard.tone,
        });
      }
    } catch (error) {
      console.error('Vocabulary audio error:', error);
      Alert.alert('Lỗi phát âm', 'Không thể phát âm từ vựng. Vui lòng thử lại.');
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleDifficultySelect = (difficulty: 'khó nhớ' | 'bình thường' | 'dễ nhớ') => {
    setSelectedDifficulty(difficulty);
    
    // Count as correct if not "khó nhớ"
    if (difficulty !== 'khó nhớ') {
      setCorrectCount(prev => prev + 1);
    }
    
    setSessionCount(prev => prev + 1);
    
    // Move to next card after a delay
    setTimeout(() => {
      moveToNextCard();
    }, 1000);
  };

  const moveToNextCard = () => {
    setShowAnswer(false);
    setSelectedDifficulty(null);
    
    if (currentIndex < totalCards - 1) {
      // Animate out current card
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex(prev => prev + 1);
      });
    } else {
      // Session complete
      setIsSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSessionCount(0);
    setCorrectCount(0);
    setIsSessionComplete(false);
    setShowAnswer(false);
    setSelectedDifficulty(null);
  };

  const renderCompletionScreen = () => (
    <View style={styles.completionContainer}>
      <Card variant="elevated" style={styles.completionCard}>
        <View style={styles.completionHeader}>
          <Ionicons name="trophy" size={64} color={colors.warning[500]} />
          <Text style={styles.completionTitle}>Hoàn thành phiên học!</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCards}</Text>
            <Text style={styles.statLabel}>Từ đã xem</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Độ chính xác</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{correctCount}</Text>
            <Text style={styles.statLabel}>Từ đúng</Text>
          </View>
        </View>
        
        <View style={styles.completionActions}>
          <Button
            variant="outline"
            size="lg"
            onPress={handleRestart}
            style={styles.actionButton}
          >
            Học lại
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

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải từ vựng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No data state
  if (!vocabularyData.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color={colors.neutral[400]} />
          <Text style={styles.emptyTitle}>Không có từ vựng</Text>
          <Text style={styles.emptySubtitle}>Hiện tại chưa có dữ liệu từ vựng.</Text>
          <Button
            variant="primary"
            onPress={loadVocabularyData}
            style={styles.retryButton}
          >
            Thử lại
          </Button>
        </View>
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
          <Text style={styles.headerTitle}>Luyện từ vựng</Text>
          <Text style={styles.headerSubtitle}>
            {currentIndex + 1}/{totalCards} • {progress}% hoàn thành
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.accuracyText}>{accuracy}% chính xác</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${(currentIndex / totalCards) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Vocabulary Card */}
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.animatedCard,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <Card variant="elevated" style={styles.vocabularyCard}>
            {/* Tone Indicator */}
            <View style={styles.toneContainer}>
              <View 
                style={[
                  styles.toneIndicator,
                  { backgroundColor: getToneColor(currentCard.tone) }
                ]}
              />
              <Text style={styles.toneText}>Thanh {currentCard.tone}</Text>
            </View>

            {/* Chinese Character */}
            <View style={styles.characterContainer}>
              <Text style={styles.hanziText}>{currentCard.hanzi}</Text>
              <Text style={styles.pinyinText}>{currentCard.pinyin}</Text>
            </View>

            {/* Audio Button */}
            <TouchableOpacity 
              style={[
                styles.audioButton,
                (isTTSLoading || isTTSPlaying) && styles.audioButtonActive
              ]} 
              onPress={handlePlayAudio}
              disabled={isTTSLoading}
            >
              <Ionicons 
                name={isTTSPlaying ? "pause" : "volume-high"} 
                size={32} 
                color={colors.primary[500]} 
              />
            </TouchableOpacity>

            {/* Show Answer Button */}
            {!showAnswer && (
              <Button
                variant="primary"
                size="lg"
                onPress={handleShowAnswer}
                style={styles.showAnswerButton}
              >
                Hiển thị nghĩa
              </Button>
            )}

            {/* Answer Section */}
            {showAnswer && (
              <Animated.View style={styles.answerContainer}>
                <View style={styles.translationsContainer}>
                  <Text style={styles.vietnameseText}>{currentCard.vietnameseTranslation}</Text>
                  <Text style={styles.englishText}>{currentCard.englishTranslation}</Text>
                </View>
                
                <Text style={styles.difficultyPrompt}>Bạn nhớ từ này như thế nào?</Text>
                
                <View style={styles.difficultyButtons}>
                  <TouchableOpacity
                    style={[
                      styles.difficultyButton,
                      styles.hardButton,
                      selectedDifficulty === 'khó nhớ' && styles.selectedButton,
                    ]}
                    onPress={() => handleDifficultySelect('khó nhớ')}
                    disabled={selectedDifficulty !== null}
                  >
                    <Text style={styles.difficultyButtonText}>Khó nhớ</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.difficultyButton,
                      styles.mediumButton,
                      selectedDifficulty === 'bình thường' && styles.selectedButton,
                    ]}
                    onPress={() => handleDifficultySelect('bình thường')}
                    disabled={selectedDifficulty !== null}
                  >
                    <Text style={styles.difficultyButtonText}>Bình thường</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.difficultyButton,
                      styles.easyButton,
                      selectedDifficulty === 'dễ nhớ' && styles.selectedButton,
                    ]}
                    onPress={() => handleDifficultySelect('dễ nhớ')}
                    disabled={selectedDifficulty !== null}
                  >
                    <Text style={styles.difficultyButtonText}>Dễ nhớ</Text>
                  </TouchableOpacity>
                </View>
                
                {selectedDifficulty && (
                  <Animated.View style={styles.feedbackContainer}>
                    <Ionicons 
                      name={selectedDifficulty === 'khó nhớ' ? 'refresh' : 'checkmark-circle'} 
                      size={24} 
                      color={selectedDifficulty === 'khó nhớ' ? colors.warning[500] : colors.accent[500]} 
                    />
                    <Text style={styles.feedbackText}>
                      {selectedDifficulty === 'khó nhớ' 
                        ? 'Sẽ xem lại sớm hơn' 
                        : 'Tuyệt vời! Tiếp tục học nhé'}
                    </Text>
                  </Animated.View>
                )}
              </Animated.View>
            )}
          </Card>
        </Animated.View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={colors.neutral[600]} />
          <Text style={styles.navButtonText}>Trước</Text>
        </TouchableOpacity>
        
        <View style={styles.cardCounter}>
          <Text style={styles.cardCounterText}>
            {currentIndex + 1} / {totalCards}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.navButton, currentIndex === totalCards - 1 && styles.navButtonDisabled]}
          onPress={() => setCurrentIndex(prev => Math.min(totalCards - 1, prev + 1))}
          disabled={currentIndex === totalCards - 1}
        >
          <Text style={styles.navButtonText}>Tiếp</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.neutral[600]} />
        </TouchableOpacity>
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
  headerRight: {
    alignItems: 'flex-end',
  },
  accuracyText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.accent[600],
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('sm'),
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
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  animatedCard: {
    flex: 1,
    justifyContent: 'center',
  },
  vocabularyCard: {
    padding: getResponsiveSpacing('xl'),
    alignItems: 'center',
    minHeight: 400,
    justifyContent: 'center',
  },
  toneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  toneIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: getResponsiveSpacing('sm'),
  },
  toneText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xl'),
  },
  hanziText: {
    fontSize: getResponsiveFontSize('7xl'),
    fontWeight: 'normal',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
    textAlign: 'center',
  },
  pinyinText: {
    fontSize: getResponsiveFontSize('xl'),
    color: colors.primary[600],
    fontStyle: 'italic',
    textAlign: 'center',
  },
  audioButton: {
    padding: getResponsiveSpacing('md'),
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    marginBottom: getResponsiveSpacing('xl'),
  },
  showAnswerButton: {
    minWidth: 200,
  },
  answerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  translationsContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xl'),
  },
  vietnameseText: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
    textAlign: 'center',
  },
  englishText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[600],
    textAlign: 'center',
  },
  difficultyPrompt: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('lg'),
    textAlign: 'center',
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  difficultyButton: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 80,
  },
  hardButton: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
  },
  mediumButton: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
  },
  easyButton: {
    backgroundColor: colors.accent[50],
    borderColor: colors.accent[200],
  },
  selectedButton: {
    borderWidth: 3,
    transform: [{ scale: 0.95 }],
  },
  difficultyButtonText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[700],
    textAlign: 'center',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[700],
    fontWeight: '500',
  },
  bottomNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  cardCounter: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('sm'),
    backgroundColor: colors.primary[50],
    borderRadius: 8,
  },
  cardCounterText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[700],
    fontWeight: '600',
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
  audioButtonActive: {
    backgroundColor: colors.primary[100],
  },
  
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  loadingText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[600],
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  emptyTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: 'bold',
    color: colors.neutral[700],
    marginTop: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('sm'),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  retryButton: {
    paddingHorizontal: getResponsiveSpacing('xl'),
  },
}); 