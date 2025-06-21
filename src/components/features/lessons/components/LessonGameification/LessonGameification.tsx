import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
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
  titleVi: string;
  description: string;
  descriptionVi: string;
  icon: string;
  condition: string;
  xpReward: number;
  badgeColor: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface LessonStats {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  totalXPToNextLevel: number;
  streak: number;
  maxStreak: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  accuracy: number;
  timeSpent: number; // minutes
  achievements: Achievement[];
  rank: string;
  leaderboardPosition?: number;
}

export interface LessonGameificationProps {
  lessonId: string;
  userId?: string;
  onXPGained?: (xp: number, newLevel?: number) => void;
  onAchievementUnlocked?: (achievement: Achievement) => void;
  variant?: 'compact' | 'detailed' | 'floating';
  showAnimations?: boolean;
}

export const LessonGameification: React.FC<LessonGameificationProps> = ({
  lessonId,
  userId = 'current-user',
  onXPGained,
  onAchievementUnlocked,
  variant = 'detailed',
  showAnimations = true,
}) => {
  const [stats, setStats] = useState<LessonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [recentXPGain, setRecentXPGain] = useState(0);

  // Animation values
  const [xpBarAnimation] = useState(new Animated.Value(0));
  const [achievementScale] = useState(new Animated.Value(0));
  const [xpFloatAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadGameStats();
  }, [lessonId, userId]);

  const loadGameStats = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockStats: LessonStats = {
        totalXP: 1250,
        currentLevel: 5,
        xpToNextLevel: 250,
        totalXPToNextLevel: 500,
        streak: 7,
        maxStreak: 12,
        lessonsCompleted: 8,
        exercisesCompleted: 45,
        accuracy: 87,
        timeSpent: 180,
        rank: 'Advanced Learner',
        leaderboardPosition: 23,
        achievements: [
    {
      id: '1',
            title: 'First Steps',
            titleVi: 'Những bước đầu',
            description: 'Complete your first lesson',
            descriptionVi: 'Hoàn thành bài học đầu tiên',
            icon: '🎯',
            condition: 'complete_lesson',
            xpReward: 50,
            badgeColor: '#10B981',
            unlocked: true,
            unlockedAt: new Date(),
    },
    {
      id: '2',
            title: 'Vocabulary Master',
            titleVi: 'Bậc thầy từ vựng',
            description: 'Learn 100 Chinese words',
            descriptionVi: 'Học 100 từ tiếng Trung',
      icon: '📚',
            condition: 'learn_words_100',
            xpReward: 200,
            badgeColor: '#3B82F6',
            unlocked: true,
            progress: 78,
            maxProgress: 100,
    },
    {
      id: '3',
      title: 'Streak Master',
            titleVi: 'Chuyên gia chuỗi ngày',
            description: 'Study for 10 consecutive days',
            descriptionVi: 'Học liên tục 10 ngày',
      icon: '🔥',
            condition: 'streak_10',
            xpReward: 300,
            badgeColor: '#F59E0B',
            unlocked: false,
            progress: 7,
            maxProgress: 10,
    },
    {
      id: '4',
            title: 'Perfect Score',
            titleVi: 'Điểm tuyệt đối',
            description: 'Get 100% accuracy in a lesson',
            descriptionVi: 'Đạt 100% độ chính xác trong bài học',
      icon: '⭐',
            condition: 'perfect_lesson',
            xpReward: 150,
            badgeColor: '#DC2626',
            unlocked: false,
          },
        ],
      };

      setStats(mockStats);
      
      // Animate XP bar
      if (showAnimations) {
        animateXPBar(mockStats.xpToNextLevel / mockStats.totalXPToNextLevel);
      }
    } catch (error) {
      console.error('Error loading game stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateXPBar = (progress: number) => {
    Animated.timing(xpBarAnimation, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  };

  const animateAchievement = (achievement: Achievement) => {
    setNewAchievements(prev => [...prev, achievement]);
    
    Animated.sequence([
      Animated.timing(achievementScale, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(achievementScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Remove achievement from new list after animation
      setTimeout(() => {
        setNewAchievements(prev => prev.filter(a => a.id !== achievement.id));
      }, 3000);
    });
  };

  const animateXPGain = (xp: number) => {
    setRecentXPGain(xp);
    setShowXPAnimation(true);
    
    Animated.sequence([
      Animated.timing(xpFloatAnimation, {
        toValue: -30,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(xpFloatAnimation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowXPAnimation(false);
    });
  };

  const getLevelColor = (level: number) => {
    if (level <= 2) return colors.neutral[500];
    if (level <= 5) return colors.secondary[500];
    if (level <= 10) return colors.primary[500];
    return colors.accent[500];
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Beginner': return '🌱';
      case 'Elementary': return '🌿';
      case 'Intermediate': return '🌳';
      case 'Advanced Learner': return '🎓';
      case 'Expert': return '👑';
      default: return '📚';
    }
  };

  const renderCompactView = () => (
    <View style={styles.compactContainer}>
      <View style={styles.compactHeader}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{stats?.currentLevel}</Text>
        </View>
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>{stats?.totalXP} XP</Text>
          <View style={styles.xpBarSmall}>
            <Animated.View 
              style={[
                styles.xpBarFill,
                {
                  width: xpBarAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
                }
              ]} 
            />
        </View>
      </View>
        <Text style={styles.streakText}>🔥 {stats?.streak}</Text>
      </View>
    </View>
  );

  const renderDetailedView = () => (
    <View style={styles.detailedContainer}>
      {/* Level & XP Section */}
      <View style={styles.levelSection}>
          <View style={styles.levelHeader}>
          <View style={[styles.levelBadgeLarge, { backgroundColor: getLevelColor(stats?.currentLevel || 1) }]}>
            <Text style={styles.levelTextLarge}>Lv.{stats?.currentLevel}</Text>
          </View>
          <View style={styles.rankInfo}>
            <Text style={styles.rankIcon}>{getRankIcon(stats?.rank || '')}</Text>
            <Text style={styles.rankText}>{stats?.rank}</Text>
            {stats?.leaderboardPosition && (
              <Text style={styles.rankPosition}>#{stats.leaderboardPosition}</Text>
            )}
            </View>
            </View>

        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>Experience Points</Text>
            <Text style={styles.xpProgress}>
              {stats?.xpToNextLevel}/{stats?.totalXPToNextLevel} XP to next level
            </Text>
          </View>
          
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarBackground}>
              <Animated.View 
                style={[
                  styles.xpBarFillLarge,
                  {
                    width: xpBarAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  }
                ]} 
              />
            </View>
          </View>
          </View>
          </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{stats?.streak}</Text>
          <Text style={styles.statLabel}>Chuỗi ngày</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📚</Text>
          <Text style={styles.statValue}>{stats?.lessonsCompleted}</Text>
          <Text style={styles.statLabel}>Bài học</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💯</Text>
          <Text style={styles.statValue}>{stats?.accuracy}%</Text>
          <Text style={styles.statLabel}>Độ chính xác</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={styles.statValue}>{Math.floor((stats?.timeSpent || 0) / 60)}h</Text>
          <Text style={styles.statLabel}>Thời gian</Text>
        </View>
      </View>

      {/* Achievements Section */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>🏆 Thành tích</Text>
        <View style={styles.achievementsGrid}>
          {stats?.achievements.map((achievement) => (
            <TouchableOpacity 
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementLocked
              ]}
              onPress={() => {
                Alert.alert(
                  achievement.titleVi,
                  achievement.descriptionVi + `\n\nPhần thưởng: ${achievement.xpReward} XP`
                );
              }}
            >
                             <Text style={!achievement.unlocked ? 
                 [styles.achievementIcon, styles.achievementIconLocked] : 
                 styles.achievementIcon
               }>
                 {achievement.unlocked ? achievement.icon : '🔒'}
               </Text>
               <Text style={!achievement.unlocked ? 
                 [styles.achievementTitle, styles.achievementTitleLocked] : 
                 styles.achievementTitle
               }>
                 {achievement.titleVi}
                </Text>
              
              {!achievement.unlocked && achievement.progress !== undefined && (
                  <View style={styles.achievementProgress}>
                  <View style={styles.achievementProgressBar}>
                      <View 
                        style={[
                          styles.achievementProgressFill,
                        { width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` }
                        ]} 
                      />
                    </View>
                  <Text style={styles.achievementProgressText}>
                    {achievement.progress}/{achievement.maxProgress}
                  </Text>
                  </View>
                )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* XP Animation Overlay */}
      {showXPAnimation && (
        <Animated.View 
          style={[
            styles.xpAnimationOverlay,
            {
              transform: [{ translateY: xpFloatAnimation }],
            }
          ]}
        >
          <Text style={styles.xpAnimationText}>+{recentXPGain} XP</Text>
        </Animated.View>
      )}
    </View>
  );

  const renderFloatingView = () => (
    <View style={styles.floatingContainer}>
      <Text style={styles.floatingXP}>{stats?.totalXP} XP</Text>
      <Text style={styles.floatingLevel}>Lv.{stats?.currentLevel}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  if (!stats) {
    return null;
  }

  // Render new achievement notifications
  const achievementNotifications = newAchievements.map((achievement) => (
    <Animated.View 
      key={achievement.id}
      style={[
        styles.achievementNotification,
        {
          transform: [{ scale: achievementScale }],
        }
      ]}
    >
      <Text style={styles.notificationIcon}>{achievement.icon}</Text>
      <Text style={styles.notificationTitle}>Thành tích mới!</Text>
      <Text style={styles.notificationText}>{achievement.titleVi}</Text>
    </Animated.View>
  ));

  switch (variant) {
    case 'compact':
      return (
        <View>
          {renderCompactView()}
          {achievementNotifications}
        </View>
      );
    case 'floating':
      return renderFloatingView();
    case 'detailed':
    default:
      return (
        <View>
          {renderDetailedView()}
          {achievementNotifications}
        </View>
      );
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

  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  levelBadge: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('xs'),
  },

  levelText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: 'bold',
    color: colors.neutral[50],
  },

  xpContainer: {
    flex: 1,
    marginHorizontal: getResponsiveSpacing('md'),
  },

  xpText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: 'bold',
    color: colors.neutral[700],
    textAlign: 'center',
  },

  xpBarSmall: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    marginTop: getResponsiveSpacing('xs'),
    overflow: 'hidden',
  },

  xpBarFill: {
    height: '100%',
    backgroundColor: colors.secondary[500],
    borderRadius: 3,
  },

  streakText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: 'bold',
    color: colors.neutral[700],
  },

  // Detailed variant
  detailedContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },

  levelSection: {
    marginBottom: getResponsiveSpacing('lg'),
  },

  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },

  levelBadgeLarge: {
    borderRadius: 20,
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    marginRight: getResponsiveSpacing('md'),
  },

  levelTextLarge: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: 'bold',
    color: colors.neutral[50],
  },

  rankInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rankIcon: {
    fontSize: getResponsiveFontSize('xl'),
    marginRight: getResponsiveSpacing('sm'),
  },

  rankText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[700],
  },

  rankPosition: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[500],
    marginLeft: getResponsiveSpacing('sm'),
  },

  xpSection: {
    gap: getResponsiveSpacing('sm'),
  },

  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  xpLabel: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[700],
  },

  xpProgress: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[500],
  },

  xpBarContainer: {
    gap: getResponsiveSpacing('xs'),
  },

  xpBarBackground: {
    height: 12,
    backgroundColor: colors.neutral[200],
    borderRadius: 6,
    overflow: 'hidden',
  },

  xpBarFillLarge: {
    height: '100%',
    backgroundColor: colors.secondary[500],
    borderRadius: 6,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
    marginBottom: getResponsiveSpacing('lg'),
  },

  statCard: {
    flex: 1,
    minWidth: Layout.isMobile ? '47%' : '22%',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: getResponsiveSpacing('md'),
    alignItems: 'center',
  },

  statIcon: {
    fontSize: getResponsiveFontSize('xl'),
    marginBottom: getResponsiveSpacing('xs'),
  },

  statValue: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: 'bold',
    color: colors.primary[500],
  },

  statLabel: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('xs'),
  },

  // Achievements
  achievementsSection: {
    gap: getResponsiveSpacing('md'),
  },

  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: 'bold',
    color: colors.neutral[900],
  },

  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
  },

  achievementCard: {
    flex: 1,
    minWidth: Layout.isMobile ? '47%' : '22%',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: getResponsiveSpacing('md'),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  achievementLocked: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },

  achievementIcon: {
    fontSize: getResponsiveFontSize('2xl'),
    marginBottom: getResponsiveSpacing('xs'),
  },

  achievementIconLocked: {
    opacity: 0.5,
  },

  achievementTitle: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[700],
    textAlign: 'center',
  },

  achievementTitleLocked: {
    color: colors.neutral[500],
  },

  achievementProgress: {
    width: '100%',
    marginTop: getResponsiveSpacing('xs'),
  },

  achievementProgressBar: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },

  achievementProgressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },

  achievementProgressText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: getResponsiveSpacing('xs'),
  },

  // Floating variant
  floatingContainer: {
    position: 'absolute',
    top: getResponsiveSpacing('md'),
    right: getResponsiveSpacing('md'),
    backgroundColor: colors.primary[500],
    borderRadius: 20,
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
    zIndex: 1000,
  },

  floatingXP: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: 'bold',
    color: colors.neutral[50],
  },

  floatingLevel: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: 'bold',
    color: colors.neutral[50],
  },

  // Animations
  xpAnimationOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -10 }],
    zIndex: 1000,
  },

  xpAnimationText: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: 'bold',
    color: colors.secondary[500],
    textShadowColor: colors.neutral[900],
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  achievementNotification: {
    position: 'absolute',
    top: getResponsiveSpacing('lg'),
    left: getResponsiveSpacing('md'),
    right: getResponsiveSpacing('md'),
    backgroundColor: colors.accent[500],
    borderRadius: 12,
    padding: getResponsiveSpacing('md'),
    alignItems: 'center',
    zIndex: 1000,
  },

  notificationIcon: {
    fontSize: getResponsiveFontSize('2xl'),
    marginBottom: getResponsiveSpacing('xs'),
  },

  notificationTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: 'bold',
    color: colors.neutral[50],
  },

  notificationText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[50],
    marginTop: getResponsiveSpacing('xs'),
  },

  // Loading state
  loadingContainer: {
    padding: getResponsiveSpacing('lg'),
    alignItems: 'center',
  },

  loadingText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },
}); 