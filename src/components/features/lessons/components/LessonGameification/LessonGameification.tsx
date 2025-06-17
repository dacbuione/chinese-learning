import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Components
import { Card } from '../../../../ui/atoms/Card/Card';
import { TranslationText } from '../../../../ui/atoms/Text';

// Theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../../theme';

export interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lessonsCompleted: number;
  achievements: Achievement[];
  dailyGoal: number;
  todayProgress: number;
  level: number;
  experiencePoints: number;
  nextLevelXP: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  target?: number;
}

export interface LessonGameificationProps {
  userProgress: UserProgress;
  onStreakMaintain?: () => void;
  onAchievementUnlock?: (achievement: Achievement) => void;
  showCompactView?: boolean;
}

export const LessonGameification: React.FC<LessonGameificationProps> = ({
  userProgress,
  onStreakMaintain,
  onAchievementUnlock,
  showCompactView = false,
}) => {
  const [streakAnimation] = useState(new Animated.Value(1));
  const [pointsAnimation] = useState(new Animated.Value(0));

  // Sample achievements data
  const sampleAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Người mới bắt đầu',
      description: 'Hoàn thành bài học đầu tiên',
      icon: '🌱',
      isUnlocked: true,
      unlockedDate: '2024-01-15',
    },
    {
      id: '2',
      title: 'Học giả nhỏ',
      description: 'Hoàn thành 10 bài học',
      icon: '📚',
      isUnlocked: userProgress.lessonsCompleted >= 10,
      progress: userProgress.lessonsCompleted,
      target: 10,
    },
    {
      id: '3',
      title: 'Streak Master',
      description: 'Duy trì streak 7 ngày',
      icon: '🔥',
      isUnlocked: userProgress.longestStreak >= 7,
      progress: userProgress.currentStreak,
      target: 7,
    },
    {
      id: '4',
      title: 'Điểm số cao',
      description: 'Đạt 1000 điểm',
      icon: '⭐',
      isUnlocked: userProgress.totalPoints >= 1000,
      progress: userProgress.totalPoints,
      target: 1000,
    },
    {
      id: '5',
      title: 'Nhà thám hiểm ngôn ngữ',
      description: 'Học 50 từ vựng mới',
      icon: '🗺️',
      isUnlocked: false,
      progress: 35,
      target: 50,
    },
  ];

  // Animate streak when it changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(streakAnimation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(streakAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [userProgress.currentStreak]);

  // Animate points when they increase
  useEffect(() => {
    Animated.timing(pointsAnimation, {
      toValue: userProgress.totalPoints,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [userProgress.totalPoints]);

  const getLevelInfo = () => {
    const level = Math.floor(userProgress.experiencePoints / 100) + 1;
    const currentLevelXP = userProgress.experiencePoints % 100;
    const nextLevelXP = 100;
    const progressPercentage = (currentLevelXP / nextLevelXP) * 100;
    
    return { level, currentLevelXP, nextLevelXP, progressPercentage };
  };

  const getDailyGoalProgress = () => {
    return Math.min((userProgress.todayProgress / userProgress.dailyGoal) * 100, 100);
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '💎';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    return '🌟';
  };

  const renderCompactView = () => (
    <View style={styles.compactContainer}>
      {/* Streak */}
      <TouchableOpacity style={styles.compactStreak}>
        <Animated.View style={[styles.streakIconContainer, { transform: [{ scale: streakAnimation }] }]}>
          <Text style={styles.streakIcon}>
            {getStreakIcon(userProgress.currentStreak)}
          </Text>
        </Animated.View>
        <Text style={styles.compactStreakText}>{userProgress.currentStreak}</Text>
      </TouchableOpacity>

      {/* Level */}
      <View style={styles.compactLevel}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{getLevelInfo().level}</Text>
        </View>
      </View>

      {/* Points */}
      <View style={styles.compactPoints}>
        <Ionicons name="star" size={16} color={colors.warning[500]} />
        <Text style={styles.compactPointsText}>{userProgress.totalPoints}</Text>
      </View>
    </View>
  );

  const renderFullView = () => (
    <ScrollView style={styles.fullContainer} showsVerticalScrollIndicator={false}>
      {/* User Level & XP */}
      <Card style={styles.levelCard}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={styles.levelGradient}
        >
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{getLevelInfo().level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <TranslationText size="lg" weight="semibold" color={colors.neutral[50]}>
                Cấp độ {getLevelInfo().level}
              </TranslationText>
              <TranslationText size="sm" color={colors.neutral[200]}>
                {getLevelInfo().currentLevelXP}/{getLevelInfo().nextLevelXP} XP
              </TranslationText>
            </View>
          </View>
          
          <View style={styles.xpProgressContainer}>
            <View style={styles.xpProgressBg}>
              <View 
                style={[
                  styles.xpProgressFill, 
                  { width: `${getLevelInfo().progressPercentage}%` }
                ]} 
              />
            </View>
          </View>
        </LinearGradient>
      </Card>

      {/* Daily Goal */}
      <Card style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalIconContainer}>
            <Ionicons name="calendar-outline" size={24} color={colors.accent[600]} />
          </View>
          <View style={styles.goalInfo}>
            <TranslationText size="base" weight="medium">
              Mục tiêu hàng ngày
            </TranslationText>
            <TranslationText size="sm" color={colors.neutral[600]}>
              {userProgress.todayProgress}/{userProgress.dailyGoal} bài học
            </TranslationText>
          </View>
        </View>
        
        <View style={styles.goalProgressContainer}>
          <View style={styles.goalProgressBg}>
            <View 
              style={[
                styles.goalProgressFill, 
                { width: `${getDailyGoalProgress()}%` }
              ]} 
            />
          </View>
          <Text style={styles.goalPercentage}>
            {Math.round(getDailyGoalProgress())}%
          </Text>
        </View>
      </Card>

      {/* Streak */}
      <Card style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Animated.View style={[styles.streakIconContainer, { transform: [{ scale: streakAnimation }] }]}>
            <Text style={styles.streakIcon}>
              {getStreakIcon(userProgress.currentStreak)}
            </Text>
          </Animated.View>
          <View style={styles.streakInfo}>
            <TranslationText size="lg" weight="semibold">
              {userProgress.currentStreak} ngày liên tiếp
            </TranslationText>
            <TranslationText size="sm" color={colors.neutral[600]}>
              Kỷ lục: {userProgress.longestStreak} ngày
            </TranslationText>
          </View>
        </View>
        
        <View style={styles.streakTips}>
          <TranslationText size="xs" color={colors.neutral[500]}>
            💡 Học ít nhất 1 bài mỗi ngày để duy trì streak!
          </TranslationText>
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{userProgress.totalPoints}</Text>
          <TranslationText size="sm" color={colors.neutral[600]}>
            Tổng điểm
          </TranslationText>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{userProgress.lessonsCompleted}</Text>
          <TranslationText size="sm" color={colors.neutral[600]}>
            Bài học
          </TranslationText>
        </Card>
      </View>

      {/* Achievements */}
      <Card style={styles.achievementsCard}>
        <TranslationText size="lg" weight="semibold" style={styles.achievementsTitle}>
          Thành tích 🏆
        </TranslationText>
        
        <View style={styles.achievementsList}>
          {sampleAchievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={[
                styles.achievementIcon,
                achievement.isUnlocked ? styles.unlockedIcon : styles.lockedIcon
              ]}>
                <Text style={styles.achievementEmoji}>
                  {achievement.isUnlocked ? achievement.icon : '🔒'}
                </Text>
              </View>
              
              <View style={styles.achievementContent}>
                <TranslationText 
                  size="base" 
                  weight="medium"
                  color={achievement.isUnlocked ? colors.neutral[900] : colors.neutral[500]}
                >
                  {achievement.title}
                </TranslationText>
                <TranslationText 
                  size="sm" 
                  color={achievement.isUnlocked ? colors.neutral[600] : colors.neutral[400]}
                >
                  {achievement.description}
                </TranslationText>
                
                {!achievement.isUnlocked && achievement.progress !== undefined && achievement.target && (
                  <View style={styles.achievementProgress}>
                    <View style={styles.achievementProgressBg}>
                      <View 
                        style={[
                          styles.achievementProgressFill,
                          { width: `${(achievement.progress / achievement.target) * 100}%` }
                        ]} 
                      />
                    </View>
                    <TranslationText size="xs" color={colors.neutral[500]}>
                      {achievement.progress}/{achievement.target}
                    </TranslationText>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );

  return showCompactView ? renderCompactView() : renderFullView();
};

const styles = StyleSheet.create({
  // Compact View
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  },
  compactStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  compactStreakText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[800],
  },
  compactLevel: {
    marginLeft: 'auto',
  },
  compactPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  compactPointsText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[700],
  },

  // Full View
  fullContainer: {
    flex: 1,
  },
  
  // Level Card
  levelCard: {
    padding: 0,
    marginBottom: getResponsiveSpacing('md'),
  },
  levelGradient: {
    padding: getResponsiveSpacing('lg'),
    borderRadius: 12,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveSpacing('md'),
  },
  levelText: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '700',
    color: colors.primary[600],
  },
  levelInfo: {
    flex: 1,
  },
  xpProgressContainer: {
    marginTop: getResponsiveSpacing('sm'),
  },
  xpProgressBg: {
    height: 8,
    backgroundColor: colors.primary[300],
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: colors.neutral[50],
    borderRadius: 4,
  },

  // Goal Card
  goalCard: {
    marginBottom: getResponsiveSpacing('md'),
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveSpacing('md'),
  },
  goalInfo: {
    flex: 1,
  },
  goalProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  goalProgressBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: colors.accent[500],
    borderRadius: 4,
  },
  goalPercentage: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[700],
    minWidth: 40,
    textAlign: 'right',
  },

  // Streak Card
  streakCard: {
    marginBottom: getResponsiveSpacing('md'),
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  streakIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.error[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveSpacing('md'),
  },
  streakIcon: {
    fontSize: 24,
  },
  streakInfo: {
    flex: 1,
  },
  streakTips: {
    backgroundColor: colors.neutral[100],
    padding: getResponsiveSpacing('sm'),
    borderRadius: 8,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('md'),
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: getResponsiveSpacing('lg'),
  },
  statValue: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '700',
    color: colors.primary[600],
    marginBottom: getResponsiveSpacing('xs'),
  },

  // Achievements
  achievementsCard: {
    marginBottom: getResponsiveSpacing('md'),
  },
  achievementsTitle: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  achievementsList: {
    gap: getResponsiveSpacing('md'),
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveSpacing('md'),
  },
  unlockedIcon: {
    backgroundColor: colors.accent[100],
  },
  lockedIcon: {
    backgroundColor: colors.neutral[200],
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementContent: {
    flex: 1,
  },
  achievementProgress: {
    marginTop: getResponsiveSpacing('sm'),
  },
  achievementProgressBg: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: getResponsiveSpacing('xs'),
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: colors.accent[500],
    borderRadius: 2,
  },
}); 