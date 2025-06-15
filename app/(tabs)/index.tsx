import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import components and theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../src/theme';
import { useTranslation } from '../../src/localization';
import { Card } from '../../src/components/ui/atoms/Card'; 
import { ProgressBar } from '../../src/components/ui/molecules/ProgressBar';
import { Button } from '../../src/components/ui/atoms/Button';

export default function HomeScreen() {
  const router = useRouter();
  const { t, practice } = useTranslation();

  // Mock user data - in real app this would come from Redux/API
  const userStats = {
    dailyGoal: 5,
    completedLessons: 3,
    streak: 7,
    xp: 1580,
    wordsLearned: 245,
    studyTimeToday: 25, // minutes
    accuracy: 87,
  };

  const dailyProgress = (userStats.completedLessons / userStats.dailyGoal) * 100;

  const quickActions = [
    {
      id: 'vocabulary',
      title: t('practice.vocabulary'),
      icon: 'book-outline' as const,
      color: colors.primary[500],
      backgroundColor: colors.primary[100],
      route: '/practice/vocabulary',
    },
    {
      id: 'pronunciation', 
      title: t('practice.pronunciation'),
      icon: 'mic-outline' as const,
      color: colors.secondary[600],
      backgroundColor: colors.secondary[100],
      route: '/practice/pronunciation',
    },
    {
      id: 'writing',
      title: t('practice.writing'),
      icon: 'create-outline' as const,
      color: colors.accent[500],
      backgroundColor: colors.accent[100],
      route: '/practice/writing',
    },
    {
      id: 'listening',
      title: t('practice.listening'),
      icon: 'headset-outline' as const,
      color: colors.tones.tone3,
      backgroundColor: colors.neutral[100],
      route: '/practice/listening',
    },
  ];

  const todayStats = [
    {
      id: 'words',
      label: 'Từ đã học',
      value: userStats.wordsLearned,
      unit: 'từ',
      icon: 'library-outline' as const,
      color: colors.primary[500],
    },
    {
      id: 'time',
      label: 'Phút học',
      value: userStats.studyTimeToday,
      unit: 'phút',
      icon: 'time-outline' as const,
      color: colors.secondary[500],
    },
    {
      id: 'accuracy',
      label: 'Độ chính xác',
      value: userStats.accuracy,
      unit: '%',
      icon: 'checkmark-circle-outline' as const,
      color: colors.accent[500],
    },
    {
      id: 'xp',
      label: 'Điểm kinh nghiệm',
      value: userStats.xp,
      unit: 'XP',
      icon: 'star-outline' as const,
      color: colors.warning[500],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeGreeting}>Xin chào! 👋</Text>
            <Text style={styles.welcomeTitle}>Sẵn sàng học tiếng Trung?</Text>
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={20} color={colors.warning[500]} />
              <Text style={styles.streakText}>
                {userStats.streak} ngày liên tiếp
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Goal Progress */}
        <Card variant="default" style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Mục tiêu hàng ngày</Text>
            <Text style={styles.progressSubtitle}>
              {userStats.completedLessons}/{userStats.dailyGoal} bài học
            </Text>
          </View>
          
          <ProgressBar
            variant="default"
            progress={dailyProgress / 100}
            height="md"
            showLabel={false}
            color={colors.primary[500]}
            backgroundColor={colors.neutral[200]}
            animated={true}
            style={styles.progressBar}
          />
          
          <Text style={styles.progressPercentage}>
            {Math.round(dailyProgress)}% hoàn thành
          </Text>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Luyện tập nhanh</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionCard,
                  { backgroundColor: action.backgroundColor }
                ]}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[
                  styles.quickActionIcon,
                  { backgroundColor: action.color }
                ]}>
                  <Ionicons 
                    name={action.icon} 
                    size={24} 
                    color={colors.neutral[50]} 
                  />
                </View>
                <Text style={[
                  styles.quickActionTitle,
                  { color: action.color }
                ]}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Thống kê hôm nay</Text>
          <View style={styles.statsGrid}>
            {todayStats.map((stat) => (
              <Card key={stat.id} variant="default" style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons 
                    name={stat.icon} 
                    size={24} 
                    color={stat.color} 
                  />
                </View>
                <Text style={styles.statValue}>
                  {stat.value} {stat.unit}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Continue Learning Button */}
        <View style={styles.continueContainer}>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push('/lessons')}
            style={styles.continueButton}
          >
            <Ionicons name="play" size={20} color={colors.neutral[50]} />
            Tiếp tục học
          </Button>
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
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
    marginHorizontal: getResponsiveSpacing('lg'),
    marginTop: getResponsiveSpacing('md'),
    borderRadius: Layout.isMobile ? 16 : 20,
    overflow: 'hidden',
  },
  welcomeContent: {
    padding: getResponsiveSpacing('xl'),
    backgroundColor: colors.primary[500],
  },
  welcomeGreeting: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[50],
    marginBottom: getResponsiveSpacing('xs'),
  },
  welcomeTitle: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: 'bold',
    color: colors.neutral[50],
    marginBottom: getResponsiveSpacing('md'),
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  streakText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.warning[100],
    fontWeight: '600',
  },
  progressCard: {
    margin: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('lg'),
  },
  progressHeader: {
    marginBottom: getResponsiveSpacing('md'),
  },
  progressTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  progressSubtitle: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  progressBar: {
    marginBottom: getResponsiveSpacing('md'),
  },
  progressPercentage: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
  },
  quickActionCard: {
    width: Layout.isTablet ? '48%' : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('lg'),
    borderRadius: Layout.isMobile ? 12 : 16,
    gap: getResponsiveSpacing('md'),
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
  },
  statCard: {
    width: Layout.isTablet ? '48%' : '100%',
    padding: getResponsiveSpacing('lg'),
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: getResponsiveSpacing('sm'),
  },
  statValue: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  statLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    textAlign: 'center',
  },
  continueContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  bottomSpacing: {
    height: getResponsiveSpacing('xl'),
  },
}); 