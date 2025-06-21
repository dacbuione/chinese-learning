import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../../theme';

export interface ProgressData {
  lessonId: string;
  userId: string;
  overallProgress: number; // 0-100
  vocabularyProgress: number;
  grammarProgress: number;
  pronunciationProgress: number;
  writingProgress: number;
  exercisesCompleted: number;
  totalExercises: number;
  timeSpent: number; // minutes
  accuracy: number; // percentage
  streak: number; // days
  lastStudied: Date | null;
  completedAt: Date | null;
  xpEarned: number;
  skillLevels: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  weakAreas: string[];
  strongAreas: string[];
  nextReviewDate: Date | null;
}

export interface LessonProgressProps {
  lessonId: string;
  userId?: string;
  showDetails?: boolean;
  onProgressUpdate?: (progress: ProgressData) => void;
  variant?: 'compact' | 'detailed' | 'circular';
  animated?: boolean;
}

export const LessonProgress: React.FC<LessonProgressProps> = ({
  lessonId,
  userId = 'current-user',
  showDetails = true,
  onProgressUpdate,
  variant = 'detailed',
  animated = true,
}) => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgressData();
  }, [lessonId, userId]);

  useEffect(() => {
    if (progress && animated) {
      animateProgress(progress.overallProgress);
    }
  }, [progress, animated]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockProgress: ProgressData = {
        lessonId,
        userId,
        overallProgress: 75,
        vocabularyProgress: 85,
        grammarProgress: 60,
        pronunciationProgress: 70,
        writingProgress: 80,
        exercisesCompleted: 12,
        totalExercises: 16,
        timeSpent: 45,
        accuracy: 88,
        streak: 5,
        lastStudied: new Date(),
        completedAt: null,
        xpEarned: 240,
        skillLevels: {
          listening: 3,
          speaking: 2,
          reading: 4,
          writing: 3,
        },
        weakAreas: ['Tones', 'Grammar patterns'],
        strongAreas: ['Vocabulary', 'Character recognition'],
        nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      setProgress(mockProgress);
      onProgressUpdate?.(mockProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateProgress = (targetProgress: number) => {
    Animated.timing(animatedProgress, {
      toValue: targetProgress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const renderCompactProgress = () => (
    <View style={styles.compactContainer}>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              {
                width: animatedProgress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {progress?.overallProgress}%
        </Text>
      </View>
      <View style={styles.compactStats}>
        <Text style={styles.compactStatText}>
          {progress?.exercisesCompleted}/{progress?.totalExercises} bài
        </Text>
        <Text style={styles.compactStatText}>
          {progress?.timeSpent}p
        </Text>
      </View>
    </View>
  );

  const renderCircularProgress = () => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * (progress?.overallProgress || 0)) / 100;

    return (
      <View style={styles.circularContainer}>
        <View style={styles.circularProgress}>
          {/* SVG circular progress would go here */}
          <View style={styles.circularProgressInner}>
            <Text style={styles.circularProgressText}>
              {progress?.overallProgress}%
            </Text>
          </View>
        </View>
        <Text style={styles.circularLabel}>Tiến độ</Text>
      </View>
    );
  };

  const renderDetailedProgress = () => (
    <View style={styles.detailedContainer}>
      {/* Overall Progress */}
      <View style={styles.overallSection}>
        <Text style={styles.sectionTitle}>📊 Tổng quan tiến độ</Text>
        <View style={styles.overallProgressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  {
                    width: animatedProgress.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progress?.overallProgress}%
            </Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress?.exercisesCompleted}</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress?.accuracy}%</Text>
              <Text style={styles.statLabel}>Độ chính xác</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress?.timeSpent}p</Text>
              <Text style={styles.statLabel}>Thời gian</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress?.streak}</Text>
              <Text style={styles.statLabel}>Chuỗi ngày</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Skill Breakdown */}
      <View style={styles.skillSection}>
        <Text style={styles.sectionTitle}>🎯 Chi tiết kỹ năng</Text>
        {[
          { key: 'vocabularyProgress', label: 'Từ vựng', icon: '📚', value: progress?.vocabularyProgress },
          { key: 'grammarProgress', label: 'Ngữ pháp', icon: '📝', value: progress?.grammarProgress },
          { key: 'pronunciationProgress', label: 'Phát âm', icon: '🗣️', value: progress?.pronunciationProgress },
          { key: 'writingProgress', label: 'Viết', icon: '✍️', value: progress?.writingProgress },
        ].map((skill) => (
          <View key={skill.key} style={styles.skillItem}>
            <View style={styles.skillHeader}>
              <Text style={styles.skillIcon}>{skill.icon}</Text>
              <Text style={styles.skillLabel}>{skill.label}</Text>
              <Text style={styles.skillValue}>{skill.value}%</Text>
            </View>
            <View style={styles.skillProgressBar}>
              <View 
                style={[
                  styles.skillProgressFill,
                  { width: `${skill.value || 0}%` }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* Achievements & Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>💡 Phân tích & Đề xuất</Text>
        
        {progress?.strongAreas && progress.strongAreas.length > 0 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>✅ Điểm mạnh</Text>
            <Text style={styles.insightText}>
              {progress.strongAreas.join(', ')}
            </Text>
          </View>
        )}

        {progress?.weakAreas && progress.weakAreas.length > 0 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>⚠️ Cần cải thiện</Text>
            <Text style={styles.insightText}>
              {progress.weakAreas.join(', ')}
            </Text>
          </View>
        )}

        {progress?.nextReviewDate && (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>📅 Ôn tập tiếp theo</Text>
            <Text style={styles.insightText}>
              {progress.nextReviewDate.toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải tiến độ...</Text>
      </View>
    );
  }

  if (!progress) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải tiến độ</Text>
      </View>
    );
  }

  switch (variant) {
    case 'compact':
      return renderCompactProgress();
    case 'circular':
      return renderCircularProgress();
    case 'detailed':
    default:
      return renderDetailedProgress();
  }
};

const styles = StyleSheet.create({
  // Compact variant
  compactContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('sm'),
  },

  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: getResponsiveSpacing('sm'),
  },

  compactStatText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },

  // Circular variant
  circularContainer: {
    alignItems: 'center',
    padding: getResponsiveSpacing('md'),
  },

  circularProgress: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },

  circularProgressInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },

  circularProgressText: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: 'bold',
    color: colors.primary[500],
  },

  circularLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },

  // Detailed variant
  detailedContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },

  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
  },

  overallSection: {
    marginBottom: getResponsiveSpacing('lg'),
  },

  overallProgressContainer: {
    gap: getResponsiveSpacing('md'),
  },

  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },

  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: colors.neutral[200],
    borderRadius: 6,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 6,
  },

  progressText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: 'bold',
    color: colors.primary[500],
    minWidth: 40,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: getResponsiveSpacing('md'),
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: 'bold',
    color: colors.primary[500],
  },

  statLabel: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('xs'),
  },

  // Skills section
  skillSection: {
    marginBottom: getResponsiveSpacing('lg'),
  },

  skillItem: {
    marginBottom: getResponsiveSpacing('md'),
  },

  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xs'),
  },

  skillIcon: {
    fontSize: getResponsiveFontSize('lg'),
    marginRight: getResponsiveSpacing('sm'),
  },

  skillLabel: {
    flex: 1,
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
  },

  skillValue: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: 'bold',
    color: colors.primary[500],
  },

  skillProgressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },

  skillProgressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },

  // Insights section
  insightsSection: {
    gap: getResponsiveSpacing('sm'),
  },

  insightCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    padding: getResponsiveSpacing('md'),
  },

  insightTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: 'bold',
    color: colors.neutral[800],
    marginBottom: getResponsiveSpacing('xs'),
  },

  insightText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    lineHeight: 20,
  },

  // Loading and error states
  loadingContainer: {
    padding: getResponsiveSpacing('lg'),
    alignItems: 'center',
  },

  loadingText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },

  errorContainer: {
    padding: getResponsiveSpacing('lg'),
    alignItems: 'center',
  },

  errorText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.error[500],
  },
}); 