import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Import components and theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, device } from '../../../src/theme';
import { useTranslation } from '../../../src/localization';
import { Card } from '../../../src/components/ui/atoms/Card';
import { api } from '../../../src/services/api/client';

interface PracticeMode {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  completed: number;
  total: number;
}

export default function PracticeScreen() {
  const { t, learning } = useTranslation();
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [vocabularyCount, setVocabularyCount] = useState(0);
  const [lessonsCount, setLessonsCount] = useState(0);

  // Load practice data from API
  useEffect(() => {
    loadPracticeData();
  }, []);

  const loadPracticeData = async () => {
    try {
      setIsLoading(true);
      
      // Load vocabulary and lessons count from API
      const [vocabularyResponse, lessonsResponse] = await Promise.all([
        api.vocabulary.getAll(),
        api.lessons.getAll(),
      ]);

      if (vocabularyResponse.success && vocabularyResponse.data) {
        setVocabularyCount(vocabularyResponse.data.length);
      }

      if (lessonsResponse.success && lessonsResponse.data) {
        setLessonsCount(lessonsResponse.data.length);
      }
    } catch (error) {
      console.error('Error loading practice data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu luyện tập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Practice modes with dynamic data
  const practiceModes: PracticeMode[] = [
    {
      id: 'pronunciation',
      title: 'Luyện phát âm',
      description: 'Thực hành thanh điệu và phát âm chính xác',
      icon: 'mic',
      color: colors.primary[500],
      gradient: [colors.primary[400], colors.primary[600]],
      difficulty: 'medium',
      estimatedTime: 10,
      completed: 15,
      total: Math.max(20, vocabularyCount),
    },
    {
      id: 'vocabulary',
      title: 'Flashcards từ vựng',
      description: 'Ôn tập từ vựng với thẻ ghi nhớ',
      icon: 'library',
      color: colors.secondary[500],
      gradient: [colors.secondary[400], colors.secondary[600]],
      difficulty: 'easy',
      estimatedTime: 8,
      completed: 25,
      total: vocabularyCount,
    },
    {
      id: 'tones',
      title: 'Nhận biết thanh điệu',
      description: 'Luyện tập nghe và phân biệt 4 thanh điệu',
      icon: 'musical-notes',
      color: colors.accent[500],
      gradient: [colors.accent[400], colors.accent[600]],
      difficulty: 'hard',
      estimatedTime: 15,
      completed: 8,
      total: 15,
    },
    {
      id: 'writing',
      title: 'Viết chữ Hán',
      description: 'Luyện viết nét chữ và thứ tự nét',
      icon: 'brush',
      color: colors.warning[500],
      gradient: [colors.warning[400], colors.warning[600]],
      difficulty: 'medium',
      estimatedTime: 20,
      completed: 5,
      total: 12,
    },
    {
      id: 'listening',
      title: 'Nghe hiểu',
      description: 'Luyện nghe và hiểu nghĩa câu nói',
      icon: 'headset',
      color: colors.error[500],
      gradient: [colors.error[400], colors.error[600]],
      difficulty: 'hard',
      estimatedTime: 12,
      completed: 3,
      total: 10,
    },
    {
      id: 'reading',
      title: 'Đọc hiểu',
      description: 'Luyện đọc và hiểu đoạn văn tiếng Trung',
      icon: 'book-outline',
      color: colors.neutral[700],
      gradient: [colors.neutral[600], colors.neutral[800]],
      difficulty: 'hard',
      estimatedTime: 25,
      completed: 2,
      total: lessonsCount,
    },
  ];

  const difficulties = [
    { id: 'all', label: 'Tất cả', color: colors.neutral[500] },
    { id: 'easy', label: 'Dễ', color: colors.accent[500] },
    { id: 'medium', label: 'Trung bình', color: colors.warning[500] },
    { id: 'hard', label: 'Khó', color: colors.error[500] },
  ];

  const getFilteredModes = () => {
    if (selectedDifficulty === 'all') {
      return practiceModes;
    }
    return practiceModes.filter(mode => mode.difficulty === selectedDifficulty);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return colors.accent[500];
      case 'medium':
        return colors.warning[500];
      case 'hard':
        return colors.error[500];
      default:
        return colors.neutral[500];
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return '';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Luyện tập</Text>
      <Text style={styles.headerSubtitle}>Chọn chế độ luyện tập phù hợp</Text>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <Card style={styles.quickStatsCard}>
        <View style={styles.quickStatsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>142</Text>
            <Text style={styles.statLabel}>Bài hoàn thành</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>67%</Text>
            <Text style={styles.statLabel}>Độ chính xác</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Ngày liên tiếp</Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderDifficultyFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Độ khó:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterWrapper}>
          {difficulties.map((difficulty) => (
            <TouchableOpacity
              key={difficulty.id}
              style={[
                styles.filterButton,
                selectedDifficulty === difficulty.id && styles.filterButtonActive,
                selectedDifficulty === difficulty.id && { backgroundColor: difficulty.color }
              ]}
              onPress={() => setSelectedDifficulty(difficulty.id as any)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedDifficulty === difficulty.id && styles.filterButtonTextActive
              ]}>
                {difficulty.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderPracticeModeCard = (mode: PracticeMode) => {
    const progressPercentage = (mode.completed / mode.total) * 100;
    
    return (
      <TouchableOpacity
        key={mode.id}
        style={styles.modeCard}
        onPress={() => {
          switch (mode.id) {
            case 'vocabulary':
              router.push('/practice/vocabulary');
              break;
            case 'pronunciation':
              router.push('/practice/pronunciation');
              break;
            case 'tones':
              router.push('/practice/tones');
              break;
            case 'writing':
              router.push('/practice/writing');
              break;
            case 'listening':
              router.push('/practice/listening');
              break;
            case 'reading':
              router.push('/practice/reading');
              break;
            default:
              console.log(`Start practice mode: ${mode.id}`);
          }
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={mode.gradient as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modeGradient}
        >
          <View style={styles.modeContent}>
            {/* Header with icon and difficulty */}
            <View style={styles.modeHeader}>
              <View style={styles.modeIconContainer}>
                <Ionicons name={mode.icon as any} size={28} color={colors.neutral[50]} />
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(mode.difficulty) }]}>
                <Text style={styles.difficultyText}>{getDifficultyLabel(mode.difficulty)}</Text>
              </View>
            </View>

            {/* Title and description */}
            <Text style={styles.modeTitle}>{mode.title}</Text>
            <Text style={styles.modeDescription}>{mode.description}</Text>

            {/* Progress and time info */}
            <View style={styles.modeFooter}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {mode.completed}/{mode.total} bài
                </Text>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${progressPercentage}%` }
                    ]} 
                  />
                </View>
              </View>
              
              <View style={styles.timeInfo}>
                <Ionicons name="time-outline" size={14} color={colors.neutral[100]} />
                <Text style={styles.timeText}>{mode.estimatedTime} phút</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderDailyChallenge = () => (
    <View style={styles.challengeContainer}>
      <Text style={styles.sectionTitle}>Thử thách hàng ngày</Text>
      <Card style={styles.challengeCard}>
        <LinearGradient
          colors={[colors.primary[500], colors.secondary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.challengeGradient}
        >
          <View style={styles.challengeContent}>
            <Ionicons name="trophy" size={32} color={colors.neutral[50]} />
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>Hoàn thành 3 bài luyện tập</Text>
              <Text style={styles.challengeDescription}>Kiếm thêm 50 XP và huy hiệu đặc biệt</Text>
              <View style={styles.challengeProgress}>
                <Text style={styles.challengeProgressText}>2/3 hoàn thành</Text>
                <View style={styles.challengeProgressBar}>
                  <View style={[styles.challengeProgressFill, { width: '66%' }]} />
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Card>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải dữ liệu luyện tập...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderQuickStats()}
      {renderDifficultyFilter()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderDailyChallenge()}
        
        <View style={styles.modesContainer}>
          <Text style={styles.sectionTitle}>Chế độ luyện tập</Text>
          <View style={styles.modesGrid}>
            {getFilteredModes().map(renderPracticeModeCard)}
          </View>
        </View>
        
        {/* Bottom spacing for tab bar */}
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
  
  // Header
  header: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[50],
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  headerSubtitle: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },
  
  // Quick stats
  quickStatsContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  quickStatsCard: {
    padding: getResponsiveSpacing('lg'),
  },
  quickStatsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  statLabel: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral[200],
    marginHorizontal: getResponsiveSpacing('md'),
  },
  
  // Filter
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('sm'),
    gap: getResponsiveSpacing('md'),
  },
  filterTitle: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[700],
  },
  filterWrapper: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('sm'),
  },
  filterButton: {
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
  },
  filterButtonText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[600],
  },
  filterButtonTextActive: {
    color: colors.neutral[50],
  },
  
  // Modes
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: getResponsiveSpacing('sm'),
  },
  
  // Daily challenge
  challengeContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
  },
  challengeCard: {
    padding: 0,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: getResponsiveSpacing('lg'),
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[50],
    marginBottom: getResponsiveSpacing('xs'),
  },
  challengeDescription: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[100],
    marginBottom: getResponsiveSpacing('md'),
  },
  challengeProgress: {
    gap: getResponsiveSpacing('xs'),
  },
  challengeProgressText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[100],
  },
  challengeProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: colors.neutral[50],
    borderRadius: 2,
  },
  
  // Practice modes
  modesContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  modesGrid: {
    gap: getResponsiveSpacing('md'),
  },
  modeCard: {
    borderRadius: device.isMobile ? 16 : 20,
    overflow: 'hidden',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  modeGradient: {
    padding: getResponsiveSpacing('lg'),
  },
  modeContent: {
    gap: getResponsiveSpacing('sm'),
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '600',
    color: colors.neutral[50],
  },
  modeTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '700',
    color: colors.neutral[50],
  },
  modeDescription: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[100],
    lineHeight: 20,
  },
  modeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: getResponsiveSpacing('md'),
  },
  progressInfo: {
    flex: 1,
    gap: getResponsiveSpacing('xs'),
  },
  progressText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[100],
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.neutral[50],
    borderRadius: 2,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  timeText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[100],
  },
  
  // Bottom spacing
  bottomSpacing: {
    height: getResponsiveSpacing('xl'),
  },
  
  // Loading state
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
}); 