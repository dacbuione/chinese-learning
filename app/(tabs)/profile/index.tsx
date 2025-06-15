import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Import components and theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, device } from '../../../src/theme';
import { useTranslation } from '../../../src/localization';
import { Button } from '../../../src/components/ui/atoms/Button';
import { Card } from '../../../src/components/ui/atoms/Card';

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
  const { t } = useTranslation();
  const [user] = useState({
    name: 'Học viên',
    email: 'hocvien@example.com',
    avatar: null,
    joinDate: '2024-01-15',
    currentLevel: 'HSK 1',
  });

  const [userStats] = useState<UserStats>({
    totalWords: 245,
    studyDays: 45,
    currentStreak: 7,
    totalMinutes: 1250,
    hskLevel: 1,
    accuracy: 94,
    xpPoints: 1580,
    rank: 'Beginner Scholar',
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: 'footsteps-outline',
      isUnlocked: true,
      progress: 1,
      maxProgress: 1,
    },
    {
      id: '2',
      title: 'Word Master',
      description: 'Learn 100 words',
      icon: 'book-outline',
      isUnlocked: true,
      progress: 245,
      maxProgress: 100,
    },
    {
      id: '3',
      title: 'Streak Keeper',
      description: 'Study for 7 days in a row',
      icon: 'flame-outline',
      isUnlocked: true,
      progress: 7,
      maxProgress: 7,
    },
    {
      id: '4',
      title: 'Pronunciation Pro',
      description: 'Perfect pronunciation 50 times',
      icon: 'mic-outline',
      isUnlocked: false,
      progress: 23,
      maxProgress: 50,
    },
    {
      id: '5',
      title: 'Character Artist',
      description: 'Write 200 characters correctly',
      icon: 'brush-outline',
      isUnlocked: false,
      progress: 87,
      maxProgress: 200,
    },
    {
      id: '6',
      title: 'Time Master',
      description: 'Study for 100 hours total',
      icon: 'time-outline',
      isUnlocked: false,
      progress: 21,
      maxProgress: 100,
    },
  ]);

  const settingsOptions = [
    {
      id: 'language',
      title: 'Language / Ngôn ngữ',
      subtitle: 'Change app language',
      icon: 'language-outline',
      onPress: () => console.log('Change language'),
    },
    {
      id: 'notifications',
      title: 'Notifications / Thông báo',
      subtitle: 'Study reminders & updates',
      icon: 'notifications-outline',
      onPress: () => console.log('Notifications settings'),
    },
    {
      id: 'audio',
      title: 'Audio Settings / Cài đặt âm thanh',
      subtitle: 'Voice speed & quality',
      icon: 'volume-high-outline',
      onPress: () => console.log('Audio settings'),
    },
    {
      id: 'backup',
      title: 'Backup & Sync / Sao lưu',
      subtitle: 'Cloud backup settings',
      icon: 'cloud-outline',
      onPress: () => console.log('Backup settings'),
    },
    {
      id: 'help',
      title: 'Help & Support / Hỗ trợ',
      subtitle: 'Get help and contact us',
      icon: 'help-circle-outline',
      onPress: () => console.log('Help & support'),
    },
    {
      id: 'about',
      title: 'About / Về ứng dụng',
      subtitle: 'App version and info',
      icon: 'information-circle-outline',
      onPress: () => console.log('About app'),
    },
  ];

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <LinearGradient
        colors={[colors.primary[500], colors.primary[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileGradient}
      >
        <View style={styles.profileContent}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={colors.neutral[600]} />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={colors.neutral[50]} />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userLevel}>{user.currentLevel}</Text>
          <Text style={styles.userRank}>{userStats.rank}</Text>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{userStats.xpPoints}</Text>
              <Text style={styles.quickStatLabel}>XP</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{userStats.currentStreak}</Text>
              <Text style={styles.quickStatLabel}>Streak</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{userStats.totalWords}</Text>
              <Text style={styles.quickStatLabel}>Words</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderStatistics = () => (
    <Card style={styles.statsCard}>
      <Text style={styles.sectionTitle}>Thống kê học tập</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="library-outline" size={20} color={colors.primary[500]} />
          </View>
          <Text style={styles.statValue}>{userStats.totalWords}</Text>
          <Text style={styles.statLabel}>Từ đã học</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="calendar-outline" size={20} color={colors.secondary[500]} />
          </View>
          <Text style={styles.statValue}>{userStats.studyDays}</Text>
          <Text style={styles.statLabel}>Ngày học</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="time-outline" size={20} color={colors.accent[500]} />
          </View>
          <Text style={styles.statValue}>{Math.round(userStats.totalMinutes / 60)}h</Text>
          <Text style={styles.statLabel}>Thời gian</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.warning[500]} />
          </View>
          <Text style={styles.statValue}>{userStats.accuracy}%</Text>
          <Text style={styles.statLabel}>Độ chính xác</Text>
        </View>
      </View>
    </Card>
  );

  const renderAchievements = () => (
    <Card style={styles.achievementsCard}>
      <View style={styles.achievementsHeader}>
        <Text style={styles.sectionTitle}>Thành tích</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.achievementsWrapper}>
          {achievements.map((achievement) => (
            <TouchableOpacity 
              key={achievement.id} 
              style={[
                styles.achievementCard,
                achievement.isUnlocked && styles.achievementUnlocked
              ]}
            >
              <View style={[
                styles.achievementIcon,
                achievement.isUnlocked 
                  ? { backgroundColor: colors.primary[500] }
                  : { backgroundColor: colors.neutral[300] }
              ]}>
                <Ionicons 
                  name={achievement.icon as any} 
                  size={24} 
                  color={achievement.isUnlocked ? colors.neutral[50] : colors.neutral[500]} 
                />
              </View>
              <Text style={[
                styles.achievementTitle,
                !achievement.isUnlocked && styles.achievementTitleLocked
              ]}>
                {achievement.title}
              </Text>
              {!achievement.isUnlocked && (
                <View style={styles.achievementProgress}>
                  <View style={styles.achievementProgressBg}>
                    <View 
                      style={[
                        styles.achievementProgressFill,
                        { width: `${(achievement.progress / achievement.maxProgress) * 100}%` }
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
      </ScrollView>
    </Card>
  );

  const renderSettings = () => (
    <Card style={styles.settingsCard}>
      <Text style={styles.sectionTitle}>Cài đặt</Text>
      <View style={styles.settingsList}>
        {settingsOptions.map((option) => (
          <TouchableOpacity 
            key={option.id} 
            style={styles.settingItem}
            onPress={option.onPress}
          >
            <View style={styles.settingIcon}>
              <Ionicons name={option.icon as any} size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{option.title}</Text>
              <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.neutral[400]} />
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  const renderLogoutButton = () => (
    <Card style={styles.logoutCard}>
      <Button
        variant="outline"
        size="md"
        onPress={() => console.log('Logout')}
        style={styles.logoutButton}
      >
        Đăng xuất
      </Button>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderStatistics()}
        {renderAchievements()}
        {renderSettings()}
        {renderLogoutButton()}
        
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
  scrollContent: {
    paddingTop: getResponsiveSpacing('sm'),
  },

  // Profile header
  profileHeader: {
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    borderRadius: device.isMobile ? 16 : 20,
    overflow: 'hidden',
  },
  profileGradient: {
    paddingVertical: getResponsiveSpacing('2xl'),
    paddingHorizontal: getResponsiveSpacing('xl'),
  },
  profileContent: {
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
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[50],
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
  userRank: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[200],
    marginBottom: getResponsiveSpacing('lg'),
  },
  quickStats: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('xl'),
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '700',
    color: colors.neutral[50],
  },
  quickStatLabel: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[200],
    marginTop: getResponsiveSpacing('xs'),
  },

  // Statistics card
  statsCard: {
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('xl'),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('lg'),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('lg'),
  },
  statItem: {
    width: device.isMobile ? '47%' : '22%',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
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

  // Achievements card
  achievementsCard: {
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('xl'),
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  viewAllText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
    fontWeight: '600',
  },
  achievementsWrapper: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('md'),
    paddingRight: getResponsiveSpacing('lg'),
  },
  achievementCard: {
    width: device.isMobile ? 120 : 140,
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: getResponsiveSpacing('md'),
    alignItems: 'center',
  },
  achievementUnlocked: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  achievementTitle: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '600',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  achievementTitleLocked: {
    color: colors.neutral[600],
  },
  achievementProgress: {
    width: '100%',
    alignItems: 'center',
  },
  achievementProgressBg: {
    width: '100%',
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: getResponsiveSpacing('xs'),
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  achievementProgressText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
  },

  // Settings card
  settingsCard: {
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('xl'),
  },
  settingsList: {
    gap: getResponsiveSpacing('md'),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing('sm'),
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getResponsiveSpacing('md'),
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  settingSubtitle: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
  },

  // Logout card
  logoutCard: {
    marginHorizontal: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('lg'),
  },
  logoutButton: {
    borderColor: colors.error[500],
  },

  // Bottom spacing
  bottomSpacing: {
    height: getResponsiveSpacing('xl'),
  },
}); 