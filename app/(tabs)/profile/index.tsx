import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import components and theme
import {
  colors,
  getResponsiveSpacing,
  getResponsiveFontSize,
  device,
  Layout,
} from '../../../src/theme';
import { useTranslation } from '../../../src/localization';
import { Button } from '../../../src/components/ui/atoms/Button';
import { Card } from '../../../src/components/ui/atoms/Card';
import { ProgressBar } from '../../../src/components/ui/molecules/ProgressBar';
import { useAuth } from '../../../src/contexts/AuthContext';
import { api } from '../../../src/services/api/client';
import { LoadingSpinner } from '../../../src/components/ui/atoms/LoadingSpinner';

interface UserStats {
  totalWords: number;
  studyDays: number;
  currentStreak: number;
  totalMinutes: number;
  hskLevel: number;
  accuracy: number;
  xpPoints: number;
  rank: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalWords: 0,
    studyDays: 0,
    currentStreak: 0,
    totalMinutes: 0,
    hskLevel: 0,
    accuracy: 0,
    xpPoints: 0,
    rank: 'Beginner',
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      if (user) {
        // Fetch user stats and achievements
        const [statsResponse, achievementsResponse] = await Promise.all([
          api.progress.getOverallStats(user.id),
          api.progress.getAchievements(user.id),
        ]);

        if (statsResponse.success && statsResponse.data) {
          const stats = statsResponse.data;
          setUserStats({
            totalWords: stats.wordsLearned || 0,
            studyDays: stats.completedLessons || 0,
            currentStreak: stats.currentStreak || 0,
            totalMinutes: stats.totalPracticeTime || 0,
            hskLevel: stats.level || 0,
            accuracy: stats.accuracy || 0,
            xpPoints: stats.totalXp || 0,
            rank: stats.rank || 'Beginner',
          });
        }

        if (achievementsResponse.success && achievementsResponse.data) {
          setAchievements(achievementsResponse.data.slice(0, 6)); // Show top 6
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const settingsItems = [
    { id: 'account', icon: 'person-outline', label: 'Tài khoản', route: '/settings/account' },
    { id: 'learning', icon: 'school-outline', label: 'Cài đặt học tập', route: '/settings/learning' },
    { id: 'notifications', icon: 'notifications-outline', label: 'Thông báo', route: '/settings/notifications' },
    { id: 'language', icon: 'language-outline', label: 'Ngôn ngữ', route: '/settings/language' },
    { id: 'help', icon: 'help-circle-outline', label: 'Trợ giúp', route: '/settings/help' },
    { id: 'about', icon: 'information-circle-outline', label: 'Về ứng dụng', route: '/settings/about' },
  ];

  const studyStats = [
    { label: 'Từ đã học', value: userStats.totalWords, icon: 'book-outline' },
    { label: 'Bài hoàn thành', value: userStats.studyDays, icon: 'checkmark-circle-outline' },
    { label: 'Thời gian học', value: `${userStats.totalMinutes / 60}h`, icon: 'time-outline' },
    { label: 'Độ chính xác', value: `${userStats.accuracy}%`, icon: 'stats-chart-outline' },
  ];

  // Mock achievements - in production, fetch from API
  const defaultAchievements = [
    { id: '1', title: 'Người mới bắt đầu', icon: 'star', color: colors.warning[500], earned: true },
    { id: '2', title: '7 ngày liên tiếp', icon: 'flame', color: colors.error[500], earned: true },
    { id: '3', title: 'Học 50 từ', icon: 'trophy', color: colors.secondary[500], earned: true },
    { id: '4', title: 'Hoàn thành HSK1', icon: 'medal', color: colors.primary[500], earned: false },
    { id: '5', title: 'Thạc sĩ phát âm', icon: 'mic', color: colors.accent[500], earned: false },
    { id: '6', title: 'Bậc thầy chữ Hán', icon: 'brush', color: colors.neutral[600], earned: false },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </View>
            <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
            <Text style={styles.userLevel}>HSK {userStats.hskLevel}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.xpPoints}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="flame" size={20} color={colors.warning[500]} />
                <Text style={styles.statValue}>{userStats.currentStreak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.totalWords}</Text>
                <Text style={styles.statLabel}>Từ</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Study Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê học tập</Text>
          <View style={styles.studyStatsGrid}>
            {studyStats.map((stat, index) => (
              <Card key={index} variant="default" style={styles.studyStatCard}>
                <Ionicons 
                  name={stat.icon as any} 
                  size={24} 
                  color={colors.primary[500]} 
                />
                <Text style={styles.studyStatValue}>{stat.value}</Text>
                <Text style={styles.studyStatLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thành tựu</Text>
          <View style={styles.achievementsGrid}>
            {(achievements.length > 0 ? achievements : defaultAchievements).map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  !achievement.earned && styles.achievementLocked,
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.earned ? achievement.color + '20' : colors.neutral[200] },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon}
                    size={24}
                    color={achievement.earned ? achievement.color : colors.neutral[400]}
                  />
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.settingsItem,
                index === settingsItems.length - 1 && styles.lastSettingsItem,
              ]}
              onPress={() => {
                // Navigate to settings page
                Alert.alert('Thông báo', `Tính năng ${item.label} đang được phát triển`);
              }}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={colors.neutral[600]}
                />
                <Text style={styles.settingsItemText}>{item.label}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.neutral[400]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.error[500]} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: getResponsiveSpacing('md'),
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },

  // Profile header
  header: {
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    borderRadius: device.isMobile ? 16 : 20,
    overflow: 'hidden',
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: getResponsiveSpacing('md'),
  },
  avatar: {
    width: device.isMobile ? 80 : 96,
    height: device.isMobile ? 80 : 96,
    borderRadius: device.isMobile ? 40 : 48,
  },
  avatarPlaceholder: {
    width: device.isMobile ? 80 : 96,
    height: device.isMobile ? 80 : 96,
    borderRadius: device.isMobile ? 40 : 48,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '700',
    color: colors.neutral[50],
  },
  userName: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '700',
    color: colors.neutral[50],
    marginBottom: getResponsiveSpacing('xs'),
  },
  userLevel: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[100],
    marginBottom: getResponsiveSpacing('xs'),
  },
  statsRow: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('xl'),
  },
  statItem: {
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
    height: '100%',
    backgroundColor: colors.neutral[300],
  },

  // Study statistics section
  section: {
    marginTop: getResponsiveSpacing('xl'),
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('lg'),
  },

  // Study statistics
  studyStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
  },
  studyStatCard: {
    flex: 1,
    minWidth: device.isMobile ? '47%' : '23%',
    padding: getResponsiveSpacing('lg'),
    alignItems: 'center',
  },
  studyStatValue: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginTop: getResponsiveSpacing('sm'),
  },
  studyStatLabel: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('xs'),
  },

  // Achievements
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
  },
  achievementItem: {
    width: device.isMobile ? '30%' : '15%',
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  achievementTitle: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    textAlign: 'center',
  },

  // Settings
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  lastSettingsItem: {
    borderBottomWidth: 0,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  settingsItemText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[800],
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveSpacing('sm'),
    marginTop: getResponsiveSpacing('2xl'),
    marginBottom: getResponsiveSpacing('lg'),
    marginHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: device.isMobile ? 12 : 16,
    borderWidth: 1,
    borderColor: colors.error[500],
  },
  logoutText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.error[500],
    fontWeight: '600',
  },

  bottomSpacing: {
    height: getResponsiveSpacing('3xl'),
  },
}); 