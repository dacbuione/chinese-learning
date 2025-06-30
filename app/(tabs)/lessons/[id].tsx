import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../src/theme';
import { useVocabularyTTS } from '../../../src/hooks/useTTS';
import { lessonsService, Lesson } from '../../../src/services/lessonsService';
import { useVocabulary } from '../../../src/hooks/useVocabulary';
import { VocabularyCard } from '../../../src/components/features/vocabulary';
import { VocabularyItemAPI } from '../../../src/services/api/vocabulary.api';
import { useSequentialLearning } from '../../../src/hooks/useSequentialLearning';
import { LessonExercise } from '../../../src/components/features/lessons/components/LessonExercise';
import { LessonProgress } from '../../../src/components/features/lessons/components/LessonProgress';
import { LessonGameification } from '../../../src/components/features/lessons/components/LessonGameification';

const { width } = Dimensions.get('window');

export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TTS hook for vocabulary pronunciation
  const { 
    speakVocabulary, 
    isPlaying: isTTSPlaying, 
    isLoading: isTTSLoading, 
    stop: stopTTS 
  } = useVocabularyTTS();

  // Use new vocabulary hook
  const { vocabularyItems, isLoading: vocabularyLoading, error: vocabularyError, refetch } = useVocabulary(id || '');
  const { updateLessonProgress, completeExercise, nextLesson } = useSequentialLearning();

  // Fetch lesson data
  const fetchLessonData = async () => {
    if (!id) {
      setError('ID bài học không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await lessonsService.getLessonById(id);
      setLesson(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải bài học');
      Alert.alert('Lỗi', 'Không thể tải chi tiết bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonData();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Đang tải bài học...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Không tìm thấy bài học</Text>
          <Text style={styles.errorText}>{error || 'Bài học không tồn tại'}</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getToneColor = (tone: number) => {
    const toneColors = {
      1: colors.error[500],    // Thanh ngang - đỏ
      2: colors.warning[500],  // Thanh sắc - vàng
      3: colors.accent[500],   // Thanh huyền - xanh lá
      4: colors.primary[500],  // Thanh nặng - xanh dương
    };
    return toneColors[tone as keyof typeof toneColors] || colors.neutral[500];
  };

  const handleVocabAudio = async (item: VocabularyItemAPI) => {
    try {
      if (isTTSPlaying) {
        await stopTTS();
      } else {
        await speakVocabulary({
          simplified: item.hanzi,
          pinyin: item.pinyin,
          tone: item.tone,
        });
      }
    } catch (error) {
      console.error('Vocabulary TTS Error:', error);
      Alert.alert('Lỗi phát âm', 'Không thể phát âm từ vựng. Vui lòng thử lại.');
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Thông tin bài học</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Loại:</Text>
          <Text style={styles.infoValue}>
            {lesson.type === 'vocabulary' ? 'Từ vựng' :
             lesson.type === 'conversation' ? 'Hội thoại' :
             lesson.type === 'grammar' ? 'Ngữ pháp' :
             lesson.type === 'pronunciation' ? 'Phát âm' : 'Viết chữ'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Thời lượng:</Text>
          <Text style={styles.infoValue}>{lesson.duration} phút</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Điểm thưởng:</Text>
          <Text style={styles.infoValue}>{lesson.xpReward} XP</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trạng thái:</Text>
          <Text style={[styles.infoValue, { color: lesson.isActive ? colors.accent[500] : colors.neutral[500] }]}>
            {lesson.isActive ? 'Đã mở khóa' : 'Chưa mở khóa'}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Mục tiêu học tập</Text>
        {lesson.objectives && lesson.objectives.length > 0 ? (
          lesson.objectives.map((objective, index) => (
            <View key={index} style={styles.objectiveItem}>
              <Text style={styles.objectiveBullet}>•</Text>
              <Text style={styles.objectiveText}>{objective}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.comingSoonText}>
            Mục tiêu học tập đang được cập nhật...
          </Text>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Thẻ từ khóa</Text>
        {lesson.tags && lesson.tags.length > 0 ? (
          <View style={styles.tagsContainer}>
            {lesson.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.comingSoonText}>
            Thẻ từ khóa đang được cập nhật...
          </Text>
        )}
      </View>
    </ScrollView>
  );

  const renderVocabularyTab = () => {
    if (vocabularyLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Đang tải từ vựng...</Text>
        </View>
      );
    }

    if (vocabularyError) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Không thể tải từ vựng</Text>
          <Text style={styles.errorText}>{vocabularyError}</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => refetch()}
          >
            <Text style={styles.backButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.vocabularyHeader}>
          <Text style={styles.vocabularyTitle}>📚 Từ vựng bài học</Text>
          <Text style={styles.vocabularySubtitle}>{vocabularyItems.length} từ trong bài học này</Text>
        </View>

        <View style={styles.vocabularyGrid}>
          {vocabularyItems.map((item) => (
            <VocabularyCard
              key={item.id}
              hanzi={item.hanzi}
              pinyin={item.pinyin}
              english={item.english}
              vietnamese={item.vietnamese}
              tone={item.tone}
              onPress={() => handleVocabAudio(item)}
              style={styles.vocabularyCardItem}
            />
          ))}
        </View>

        <View style={styles.vocabularyFooter}>
          <Text style={styles.vocabularyTip}>💡 Nhấn vào thẻ từ để nghe phát âm</Text>
        </View>
      </ScrollView>
    );
  };

  const renderPracticeTab = () => {
    return (
      <ScrollView style={styles.practiceContainer} showsVerticalScrollIndicator={false}>
        {lesson ? (
          <>
            {/* Progress Tracking */}
            <LessonProgress
              lessonId={lesson.id}
              variant="compact"
              onProgressUpdate={(progress) => {
                console.log('Progress updated:', progress);
              }}
            />
            
            {/* Gamification Elements */}
            <LessonGameification
              lessonId={lesson.id}
              variant="compact"
              onXPGained={(xp, newLevel) => {
                console.log(`Gained ${xp} XP, new level: ${newLevel}`);
              }}
              onAchievementUnlocked={(achievement) => {
                Alert.alert('🏆 Thành tích mới!', achievement.titleVi);
              }}
            />
            
            {/* Main Exercise Content */}
            <LessonExercise
              lessonId={lesson.id}
              onComplete={async (score, total) => {
                const percentage = Math.round((score / total) * 100);
                try {
                  await updateLessonProgress(lesson.id, 100, percentage);
                  let message = `Bạn đã hoàn thành bài ${lesson.order}!`;
                  if (nextLesson && nextLesson.lesson.id !== lesson.id) {
                    message += `\nBài học tiếp theo (Bài ${nextLesson.lesson.order}: ${nextLesson.lesson.titleVi}) đã được mở khóa!`;
                  }
                  Alert.alert(
                    'Hoàn thành bài học! 🎉',
                    message,
                    [
                      { text: 'Quay lại danh sách', onPress: () => router.back() },
                      nextLesson && nextLesson.lesson.id !== lesson.id
                        ? { text: 'Bài tiếp theo', onPress: () => router.push(`/(tabs)/lessons/${nextLesson.lesson.id}`) }
                        : { text: 'OK' },
                    ]
                  );
                } catch (error) {
                  console.error('Error updating lesson progress:', error);
                  Alert.alert('Lỗi', 'Không thể cập nhật tiến độ. Vui lòng thử lại.');
                }
              }}
              onExerciseComplete={async (exerciseId, isCorrect) => {
                try {
                  await completeExercise(lesson.id, exerciseId, isCorrect ? 1 : 0);
                  console.log(`Exercise ${exerciseId}: ${isCorrect ? 'Correct ✅' : 'Incorrect ❌'}`);
                } catch (error) {
                  console.error('Error completing exercise:', error);
                }
              }}
              showProgress={true}
              allowReview={true}
            />
          </>
        ) : (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Đang tải bài tập...</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderProgressTab = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {lesson ? (
          <>
            {/* Detailed Progress */}
            <LessonProgress
              lessonId={lesson.id}
              variant="detailed"
              onProgressUpdate={(progress) => {
                console.log('Detailed progress:', progress);
              }}
            />
            
            {/* Detailed Gamification */}
            <LessonGameification
              lessonId={lesson.id}
              variant="detailed"
              onXPGained={(xp, newLevel) => {
                Alert.alert('🎉 Level Up!', `Bạn đã đạt level ${newLevel}!`);
              }}
              onAchievementUnlocked={(achievement) => {
                Alert.alert('🏆 Thành tích mới!', achievement.titleVi);
              }}
            />
          </>
        ) : (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText}>Đang tải thống kê...</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'vocabulary':
        return renderVocabularyTab();
      case 'practice':
        return renderPracticeTab();
      case 'progress':
        return renderProgressTab();
      default:
        return renderOverviewTab();
    }
  };

  const tabs = [
    { id: 'vocabulary', label: 'Từ vựng', icon: '📚' },
    { id: 'practice', label: 'Luyện tập', icon: '🎯' },
    { id: 'progress', label: 'Tiến độ', icon: '📊' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Header */}
      <View style={styles.compactHeader}>
        <TouchableOpacity 
          style={styles.compactBackButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.compactLevelBadge}>
            <Text style={styles.compactLevelText}>
              {lesson.difficulty === 'beginner' ? 'Cơ bản' :
               lesson.difficulty === 'elementary' ? 'Sơ cấp' :
               lesson.difficulty === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
            </Text>
          </View>
                     <Text style={styles.compactTitle} numberOfLines={1}>
             {lesson.titleVi || lesson.title}
           </Text>
        </View>
        
        <View style={styles.compactStats}>
          <Text style={styles.compactStatText}>{lesson.duration}p • {lesson.xpReward}XP</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },

  loadingText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('md'),
  },

  errorTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: 'bold',
    color: colors.error[500],
    marginBottom: getResponsiveSpacing('sm'),
  },

  errorText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },

  backButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: 8,
  },

  backButtonText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[50],
    fontWeight: '500',
  },

  lessonInfo: {
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },

  levelBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('xs'),
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: getResponsiveSpacing('sm'),
  },

  levelBadgeText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[50],
    fontWeight: '600',
  },

  lessonTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
  },

  lessonDescription: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    lineHeight: 24,
    marginBottom: getResponsiveSpacing('lg'),
  },

  lessonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: 'bold',
    color: colors.primary[500],
  },

  statLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('xs'),
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: getResponsiveSpacing('sm'),
  },

  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing('sm'),
    gap: getResponsiveSpacing('xs'),
  },

  activeTab: {
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    marginVertical: 4,
  },

  tabIcon: {
    fontSize: getResponsiveFontSize('base'),
  },

  tabLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontWeight: '500',
  },

  activeTabLabel: {
    color: colors.neutral[50],
  },

  contentContainer: {
    flex: 1,
  },

  tabContent: {
    flex: 1,
    padding: getResponsiveSpacing('lg'),
  },

  infoCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  infoTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getResponsiveSpacing('sm'),
  },

  infoLabel: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },

  infoValue: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
    fontWeight: '500',
  },

  objectiveItem: {
    flexDirection: 'row',
    marginBottom: getResponsiveSpacing('sm'),
  },

  objectiveBullet: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[500],
    marginRight: getResponsiveSpacing('sm'),
  },

  objectiveText: {
    flex: 1,
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    lineHeight: 22,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
  },

  tag: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('xs'),
    borderRadius: 12,
  },

  tagText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[700],
  },

  comingSoonText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },

  comingSoonSubtext: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
  },

  exerciseButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: getResponsiveSpacing('md'),
    paddingHorizontal: getResponsiveSpacing('lg'),
    borderRadius: 12,
    marginTop: getResponsiveSpacing('lg'),
  },

  exerciseButtonText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[50],
    textAlign: 'center',
    fontWeight: '600',
  },

  practiceContainer: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },

  // Compact Header Styles
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('sm'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    minHeight: 60,
  },

  compactBackButton: {
    width: 36,
    height: 36,
    backgroundColor: colors.primary[500],
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveSpacing('sm'),
  },

  backIcon: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[50],
    fontWeight: 'bold',
  },

  headerInfo: {
    flex: 1,
    marginRight: getResponsiveSpacing('sm'),
  },

  compactLevelBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: getResponsiveSpacing('xs'),
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },

  compactLevelText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.primary[600],
    fontWeight: '600',
  },

  compactTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: 'bold',
    color: colors.neutral[900],
  },

  compactStats: {
    alignItems: 'flex-end',
  },

  compactStatText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    fontWeight: '500',
  },

  // Vocabulary Tab Styles
  vocabularyHeader: {
    marginBottom: getResponsiveSpacing('lg'),
  },

  vocabularyTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },

  vocabularySubtitle: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },

  vocabularyGrid: {
    flexDirection: Layout.isTablet ? 'row' : 'column',
    flexWrap: Layout.isTablet ? 'wrap' : 'nowrap',
    gap: getResponsiveSpacing('md'),
  },

  vocabularyCardItem: {
    width: Layout.isTablet ? '48%' : '100%',
    marginBottom: getResponsiveSpacing('md'),
  },

  vocabularyFooter: {
    marginTop: getResponsiveSpacing('xl'),
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
  },

  vocabularyTip: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 