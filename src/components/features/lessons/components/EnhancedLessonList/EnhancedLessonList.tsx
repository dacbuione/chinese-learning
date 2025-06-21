import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../../theme';
import { useSequentialLearning, LessonStatus, LearningPathItem } from '../../../../../hooks/useSequentialLearning';
import { LoadingSpinner } from '../../../../ui/atoms/LoadingSpinner';

const { width } = Dimensions.get('window');

// Lesson Type Colors for Visual Distinction
const LESSON_TYPE_COLORS = {
  vocabulary: colors.primary[500],    // Chinese red
  grammar: colors.secondary[500],     // Gold
  pronunciation: colors.accent[500],  // Green
  writing: colors.tones.tone4,        // Blue
  conversation: colors.tones.tone3,   // Green variant
} as const;

// Status Colors
const STATUS_COLORS = {
  [LessonStatus.LOCKED]: colors.neutral[400],
  [LessonStatus.AVAILABLE]: colors.accent[500],
  [LessonStatus.IN_PROGRESS]: colors.secondary[500], 
  [LessonStatus.COMPLETED]: colors.primary[500],
  [LessonStatus.MASTERED]: colors.tones.tone1,
} as const;

const STATUS_ICONS = {
  [LessonStatus.LOCKED]: '🔒',
  [LessonStatus.AVAILABLE]: '▶️',
  [LessonStatus.IN_PROGRESS]: '⏸️',
  [LessonStatus.COMPLETED]: '✅',
  [LessonStatus.MASTERED]: '⭐',
} as const;

interface EnhancedLessonListProps {
  showLockedLessons?: boolean;
  onLessonPress?: (lesson: LearningPathItem) => void;
}

export const EnhancedLessonList: React.FC<EnhancedLessonListProps> = ({
  showLockedLessons = true,
  onLessonPress,
}) => {
  const router = useRouter();
  const {
    learningPath,
    availableLessons,
    nextLesson,
    progressStats,
    isLoading,
    error,
    canAccessLesson,
    getLessonStatus,
    getUnlockMessage,
    getProgressPercentage,
    refreshLearningPath,
  } = useSequentialLearning();

  const [refreshing, setRefreshing] = useState(false);

  // Handle lesson press
  const handleLessonPress = (item: LearningPathItem) => {
    // Check if lesson can be accessed
    if (!canAccessLesson(item.lesson.id)) {
      const unlockMessage = getUnlockMessage(item.lesson.id);
      Alert.alert(
        'Bài học chưa mở khóa',
        unlockMessage || 'Bạn cần hoàn thành các bài học trước đó.',
        [{ text: 'Hiểu rồi', style: 'default' }]
      );
      return;
    }

    if (onLessonPress) {
      onLessonPress(item);
    } else {
      router.push(`/(tabs)/lessons/${item.lesson.id}`);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLearningPath();
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Get lessons to display
  const lessonsToShow = showLockedLessons ? learningPath : availableLessons;

  // Render lesson card
  const renderLessonCard = ({ item }: { item: LearningPathItem }) => {
    const { lesson, status, progress, score } = item;
    const isLocked = status === LessonStatus.LOCKED;
    const canAccess = canAccessLesson(lesson.id);
    
    const typeColor = LESSON_TYPE_COLORS[lesson.type as keyof typeof LESSON_TYPE_COLORS] || colors.neutral[500];
    const statusColor = STATUS_COLORS[status];
    const statusIcon = STATUS_ICONS[status];

    return (
      <TouchableOpacity
        style={[
          styles.lessonCard,
          isLocked && styles.lockedCard,
          !canAccess && styles.disabledCard
        ]}
        onPress={() => handleLessonPress(item)}
        activeOpacity={canAccess ? 0.8 : 1}
        disabled={!canAccess && isLocked}
      >
        {/* Status indicator */}
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
          <Text style={styles.statusIcon}>{statusIcon}</Text>
        </View>

        {/* Header with type and order */}
        <View style={styles.lessonHeader}>
          <View style={[styles.typeIndicator, { backgroundColor: typeColor }]}>
            <Text style={styles.typeText}>
              {lesson.type === 'vocabulary' ? '词汇' : 
               lesson.type === 'grammar' ? '语法' :
               lesson.type === 'pronunciation' ? '发音' :
               lesson.type === 'writing' ? '写字' : '对话'}
            </Text>
          </View>
          <Text style={[styles.orderText, isLocked && styles.lockedText]}>
            Bài {lesson.order}
          </Text>
        </View>

        {/* Lesson content */}
        <Text style={[styles.lessonTitle, isLocked && styles.lockedText]}>
          {lesson.titleVi}
        </Text>
        <Text style={[styles.lessonTitleChinese, isLocked && styles.lockedText]}>
          {lesson.title}
        </Text>
        <Text style={[styles.lessonDescription, isLocked && styles.lockedText]} numberOfLines={2}>
          {lesson.descriptionVi}
        </Text>

        {/* Footer with stats */}
        <View style={styles.lessonFooter}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, isLocked && styles.lockedText]}>Thời gian</Text>
            <Text style={[styles.statValue, isLocked && styles.lockedText]}>
              {lesson.duration} phút
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, isLocked && styles.lockedText]}>Điểm XP</Text>
            <Text style={[styles.statValue, isLocked && styles.lockedText]}>
              {lesson.xpReward} XP
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyTitle}>Chưa có bài học nào</Text>
      <Text style={styles.emptyDescription}>
        Các bài học sẽ được tải sớm. Hãy thử làm mới lại.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Đang tải bài học...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={lessonsToShow}
      renderItem={renderLessonCard}
      keyExtractor={(item) => item.lesson.id}
      contentContainerStyle={styles.container}
      ListEmptyComponent={renderEmptyState}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: getResponsiveSpacing('md'),
    paddingBottom: getResponsiveSpacing('xl'),
  },

  // Lesson Cards
  lessonCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: Layout.isMobile ? 12 : 16,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    width: Layout.isTablet ? '48%' : '100%',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },

  lockedCard: {
    backgroundColor: colors.neutral[100],
    opacity: 0.7,
  },

  disabledCard: {
    backgroundColor: colors.neutral[100],
  },

  statusIndicator: {
    position: 'absolute',
    top: getResponsiveSpacing('sm'),
    right: getResponsiveSpacing('sm'),
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusIcon: {
    fontSize: 16,
  },

  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },

  typeIndicator: {
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('xs'),
    borderRadius: 12,
  },

  typeText: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '600',
    color: colors.neutral[50],
  },

  orderText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[600],
  },

  lessonTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },

  lessonTitleChinese: {
    fontSize: getResponsiveFontSize('xl'),
    fontFamily: 'System',
    color: colors.primary[600],
    marginBottom: getResponsiveSpacing('sm'),
    textAlign: 'center',
  },

  lessonDescription: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[700],
    lineHeight: getResponsiveFontSize('sm') * 1.4,
    marginBottom: getResponsiveSpacing('md'),
  },

  lockedText: {
    color: colors.neutral[500],
  },

  // Footer
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statItem: {
    alignItems: 'center',
  },

  statLabel: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
  },

  statValue: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[800],
  },

  // States
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
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },

  errorIcon: {
    fontSize: 64,
    marginBottom: getResponsiveSpacing('md'),
  },

  errorTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.error[600],
    marginBottom: getResponsiveSpacing('sm'),
  },

  errorMessage: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },

  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 8,
  },

  retryButtonText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[50],
  },

  emptyContainer: {
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: getResponsiveSpacing('md'),
  },

  emptyTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('sm'),
  },

  emptyDescription: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
  },
}); 