import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import components and theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, device } from '../../../src/theme';
import { useTranslation } from '../../../src/localization';
import { Card } from '../../../src/components/ui/atoms/Card';
import { Loading } from '../../../src/components/ui/atoms/Loading';
import { api } from '../../../src/services/api/client';

interface WeeklyData {
  day: string;
  dayShort: string;
  value: number;
  completed: boolean;
}

interface SkillProgress {
  skill: string;
  icon: string;
  level: number;
  progress: number;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedDate?: string;
}

interface OverallStats {
  wordsLearned: number;
  wordsThisWeek: number;
  lessonsCompleted: number;
  lessonsThisWeek: number;
  accuracy: number;
  accuracyImprovement: number;
}

export default function ProgressScreen() {
  const { t, learning } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  // API data states
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [skillsProgress, setSkillsProgress] = useState<SkillProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress data from API
  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      
      // For now, use a mock user ID (in real app, get from auth context)
      const userId = 'user-1';
      
      // Load all progress data in parallel
      const [weeklyResponse, skillsResponse, achievementsResponse, statsResponse] = await Promise.all([
        api.progress.getWeeklyProgress(userId),
        api.progress.getSkillsProgress(userId),
        api.progress.getAchievements(userId),
        api.progress.getOverallStats(userId),
      ]);

      if (weeklyResponse.success && weeklyResponse.data) {
        setWeeklyData(weeklyResponse.data);
      }

      if (skillsResponse.success && skillsResponse.data) {
        setSkillsProgress(skillsResponse.data);
      }

      if (achievementsResponse.success && achievementsResponse.data) {
        setAchievements(achievementsResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setOverallStats(statsResponse.data);
      }

    } catch (error) {
      console.error('Error loading progress data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu tiến độ. Vui lòng thử lại.');
      
      // Set empty fallback data
      setWeeklyData([]);
      setSkillsProgress([]);
      setAchievements([]);
      setOverallStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const periods = [
    { id: 'week', label: 'Tuần' },
    { id: 'month', label: 'Tháng' },
    { id: 'year', label: 'Năm' },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Tiến độ</Text>
      <Text style={styles.headerSubtitle}>Theo dõi quá trình học tập của bạn</Text>
    </View>
  );

  const renderOverallStats = () => (
    <View style={styles.statsContainer}>
      <Card style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{overallStats?.wordsLearned || 0}</Text>
            <Text style={styles.statLabel}>Từ đã học</Text>
            <Text style={styles.statChange}>+{overallStats?.wordsThisWeek || 0} tuần này</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{overallStats?.lessonsCompleted || 0}</Text>
            <Text style={styles.statLabel}>Bài hoàn thành</Text>
            <Text style={styles.statChange}>+{overallStats?.lessonsThisWeek || 0} tuần này</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(overallStats?.accuracy || 0)}%</Text>
            <Text style={styles.statLabel}>Độ chính xác</Text>
            <Text style={styles.statChange}>+{overallStats?.accuracyImprovement || 0}% cải thiện</Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodContainer}>
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodButton,
              selectedPeriod === period.id && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(period.id as any)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period.id && styles.periodButtonTextActive
            ]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderActivityChart = () => {
    const maxValue = Math.max(...weeklyData.map(d => d.value));
    
    return (
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Hoạt động tuần này</Text>
          <Text style={styles.chartSubtitle}>Thời gian học (phút)</Text>
        </View>
        
        <View style={styles.chartContainer}>
          {weeklyData.map((data, index) => {
            const barHeight = (data.value / maxValue) * 100;
            
            return (
              <View key={index} style={styles.chartBarContainer}>
                <View style={styles.chartBarWrapper}>
                  <View style={[styles.chartBarBg, { height: 80 }]}>
                    {data.value > 0 && (
                      <LinearGradient
                        colors={data.completed 
                          ? [colors.primary[400], colors.primary[600]]
                          : [colors.neutral[300], colors.neutral[400]]
                        }
                        style={[
                          styles.chartBar,
                          { height: `${barHeight}%` }
                        ]}
                      />
                    )}
                  </View>
                  {data.value > 0 && (
                    <Text style={styles.chartBarValue}>{data.value}</Text>
                  )}
                </View>
                <Text style={styles.chartBarLabel}>{data.dayShort}</Text>
              </View>
            );
          })}
        </View>
        
        <View style={styles.chartFooter}>
          <Text style={styles.chartFooterText}>
            Tổng: 165 phút • Trung bình: 27 phút/ngày
          </Text>
        </View>
      </Card>
    );
  };

  const renderSkillsProgress = () => (
    <View style={styles.skillsContainer}>
      <Text style={styles.sectionTitle}>Kỹ năng</Text>
      
      <View style={styles.skillsGrid}>
        {skillsProgress.map((skill, index) => (
          <Card key={index} style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <View style={[styles.skillIcon, { backgroundColor: skill.color }]}>
                <Ionicons name={skill.icon as any} size={20} color={colors.neutral[50]} />
              </View>
              <View style={styles.skillLevel}>
                <Text style={styles.skillLevelText}>Cấp {skill.level}</Text>
              </View>
            </View>
            
            <Text style={styles.skillName}>{skill.skill}</Text>
            
            <View style={styles.skillProgressContainer}>
              <View style={styles.skillProgressBg}>
                <View 
                  style={[
                    styles.skillProgressFill,
                    { 
                      width: `${skill.progress}%`,
                      backgroundColor: skill.color
                    }
                  ]} 
                />
              </View>
              <Text style={styles.skillProgressText}>{skill.progress}%</Text>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsContainer}>
      <Text style={styles.sectionTitle}>Thành tích</Text>
      
      <View style={styles.achievementsGrid}>
        {achievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            style={StyleSheet.flatten([
              styles.achievementCard,
              !achievement.unlocked && { opacity: 0.6 }
            ])}
          >
            <View style={styles.achievementContent}>
              <View style={[
                styles.achievementIcon,
                { backgroundColor: achievement.unlocked ? achievement.color : colors.neutral[300] }
              ]}>
                <Ionicons 
                  name={achievement.icon as any} 
                  size={24} 
                  color={colors.neutral[50]} 
                />
              </View>
              
              <View style={styles.achievementInfo}>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.achievementTitleLocked
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.unlocked && styles.achievementDescriptionLocked
                ]}>
                  {achievement.description}
                </Text>
                {achievement.unlocked && achievement.unlockedDate && (
                  <Text style={styles.achievementDate}>
                    Mở khóa {achievement.unlockedDate}
                  </Text>
                )}
              </View>
              
              {achievement.unlocked && (
                <Ionicons name="checkmark-circle" size={20} color={achievement.color} />
              )}
            </View>
          </Card>
        ))}
      </View>
    </View>
  );

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Đang tải dữ liệu tiến độ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no data
  if (!weeklyData.length && !skillsProgress.length && !achievements.length) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color={colors.neutral[400]} />
          <Text style={styles.emptyTitle}>Chưa có dữ liệu tiến độ</Text>
          <Text style={styles.emptySubtitle}>
            Bắt đầu học để xem tiến độ của bạn ở đây
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProgressData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderOverallStats()}
      {renderPeriodSelector()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderActivityChart()}
        {renderSkillsProgress()}
        {renderAchievements()}
        
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
  
  // Overall stats
  statsContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  statsCard: {
    padding: getResponsiveSpacing('lg'),
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  statLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('xs'),
  },
  statChange: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.accent[600],
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.neutral[200],
    marginHorizontal: getResponsiveSpacing('md'),
  },
  
  // Period selector
  periodContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.neutral[50],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[600],
  },
  periodButtonTextActive: {
    color: colors.neutral[900],
    fontWeight: '600',
  },
  
  // Chart
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: getResponsiveSpacing('sm'),
  },
  chartCard: {
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('lg'),
  },
  chartHeader: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  chartTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  chartSubtitle: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: getResponsiveSpacing('lg'),
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  chartBarWrapper: {
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  chartBarBg: {
    width: 24,
    backgroundColor: colors.neutral[100],
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
  },
  chartBarValue: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  chartBarLabel: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[500],
    textAlign: 'center',
  },
  chartFooter: {
    alignItems: 'center',
  },
  chartFooterText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  
  // Skills
  skillsContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
  },
  skillCard: {
    width: device.isMobile ? '47%' : '22%',
    padding: getResponsiveSpacing('md'),
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  skillIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillLevel: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillLevelText: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '600',
    color: colors.neutral[700],
  },
  skillName: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
  },
  skillProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  skillProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  skillProgressText: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '600',
    color: colors.neutral[600],
  },
  
  // Achievements
  achievementsContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  achievementsGrid: {
    gap: getResponsiveSpacing('md'),
  },
  achievementCard: {
    padding: getResponsiveSpacing('md'),
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  achievementTitleLocked: {
    color: colors.neutral[500],
  },
  achievementDescription: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    lineHeight: 18,
  },
  achievementDescriptionLocked: {
    color: colors.neutral[400],
  },
  achievementDate: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.accent[600],
    marginTop: getResponsiveSpacing('xs'),
    fontWeight: '500',
  },
  
  // Bottom spacing
  bottomSpacing: {
    height: getResponsiveSpacing('xl'),
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  loadingText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('md'),
    textAlign: 'center',
  },

  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  emptyTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[700],
    marginTop: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('sm'),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('xl'),
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: getResponsiveSpacing('xl'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[50],
  },
});