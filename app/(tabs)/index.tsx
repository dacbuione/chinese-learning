import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

// Import components and theme
import {
  colors,
  getResponsiveSpacing,
  getResponsiveFontSize,
  Layout,
} from '../../src/theme';
import { useTranslation } from '../../src/localization';
import { Card } from '../../src/components/ui/atoms/Card';
import { ProgressBar } from '../../src/components/ui/molecules/ProgressBar';
import { Button } from '../../src/components/ui/atoms/Button';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api/client';
import { LoadingSpinner } from '../../src/components/ui/atoms/LoadingSpinner';

export default function HomeScreen() {
  const router = useRouter();
  const { t, practice } = useTranslation();
  const { user } = useAuth();

  // State
  const [showSilentModeModal, setShowSilentModeModal] = useState(false);
  const [isCheckingSilentMode, setIsCheckingSilentMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userStats, setUserStats] = useState({
    dailyGoal: 5,
    completedLessons: 0,
    streak: 0,
    xp: 0,
    wordsLearned: 0,
    studyTimeToday: 0,
    accuracy: 0,
  });

  // Check silent mode on app launch
  useEffect(() => {
    checkSilentMode();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      if (user) {
        // Fetch user progress from API
        const [statsResponse, progressResponse] = await Promise.all([
          api.progress.getOverallStats(user.id),
          api.progress.getWeeklyProgress(user.id),
        ]);

        if (statsResponse.success && statsResponse.data) {
          const stats = statsResponse.data;
          setUserStats({
            dailyGoal: 5,
            completedLessons: stats.completedLessons || 0,
            streak: user.currentStreak || 0,
            xp: user.totalXp || 0,
            wordsLearned: stats.wordsLearned || 0,
            studyTimeToday: stats.studyTimeToday || 0,
            accuracy: stats.accuracy || 0,
          });
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

  const checkSilentMode = async () => {
    if (Platform.OS !== 'ios') {
      setIsCheckingSilentMode(false);
      return;
    }

    try {
      setIsCheckingSilentMode(true);

      // Configure audio for testing
      await Audio.setIsEnabledAsync(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: false, // Don't override silent mode for detection
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Test with a very short silent audio to detect silent mode
      let audioDetected = false;
      const testSound = await Audio.Sound.createAsync(
        {
          uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWXA==',
        },
        {
          shouldPlay: true,
          volume: 1.0,
          isLooping: false,
        }
      );

      // Listen for audio completion to detect if sound played
      testSound.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          audioDetected = true;
        }
      });

      // Wait for audio test to complete
      setTimeout(async () => {
        await testSound.sound.unloadAsync();

        if (!audioDetected) {
          // Silent mode is likely ON - show modal
          setShowSilentModeModal(true);
        }

        setIsCheckingSilentMode(false);
      }, 1000);
    } catch (error) {
      console.warn('🔇 Silent mode detection failed:', error);
      setIsCheckingSilentMode(false);
    }
  };

  const handleSilentModeCheck = async () => {
    try {
      // Test audio again to see if silent mode is turned off
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: false, // Test without override
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Test with audible beep
      const testSound = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        {
          shouldPlay: true,
          volume: 0.01,
        }
      );

      setTimeout(async () => {
        await testSound.sound.unloadAsync();
      }, 2000);
    } catch (error) {
      console.error('🔇 Audio test failed:', error);
      Alert.alert(
        '❌ Lỗi kiểm tra âm thanh',
        'Không thể kiểm tra âm thanh. Vui lòng đảm bảo:\n\n1. Tắt chế độ im lặng\n2. Bật âm lượng\n3. Khởi động lại ứng dụng'
      );
    }
  };

  const dailyProgress =
    (userStats.completedLessons / userStats.dailyGoal) * 100;

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Silent Mode Modal */}
      <Modal
        visible={showSilentModeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {}} // Prevent dismissal
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons
                name="volume-mute"
                size={64}
                color={colors.warning[500]}
              />
              <Text style={styles.modalTitle}>🔇 Chế độ im lặng đang bật</Text>
              <Text style={styles.modalSubtitle}>
                Để học tiếng Trung hiệu quả, bạn cần nghe rõ phát âm
              </Text>
            </View>

            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>
                Cách tắt chế độ im lặng:
              </Text>

              <View style={styles.instruction}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Gạt công tắc bên cạnh</Text>
                  <Text style={styles.stepDescription}>
                    Gạt công tắc bên trái iPhone về phía màn hình
                  </Text>
                </View>
              </View>

              <View style={styles.instruction}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    Kiểm tra không có màu cam
                  </Text>
                  <Text style={styles.stepDescription}>
                    Đảm bảo không thấy màu cam trong khe công tắc
                  </Text>
                </View>
              </View>

              <View style={styles.instruction}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Bật âm lượng</Text>
                  <Text style={styles.stepDescription}>
                    Bấm nút tăng âm lượng để đảm bảo nghe rõ
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Button
                variant="primary"
                size="lg"
                onPress={handleSilentModeCheck}
                style={styles.testButton}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.neutral[50]}
                />
                Tôi đã tắt chế độ im lặng
              </Button>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => {
                  Alert.alert(
                    '⚠️ Bỏ qua cảnh báo',
                    'Bạn có thể sẽ không nghe được âm thanh học tập. Bạn có chắc muốn tiếp tục?',
                    [
                      { text: 'Quay lại', style: 'cancel' },
                      {
                        text: 'Tiếp tục',
                        style: 'destructive',
                        onPress: () => setShowSilentModeModal(false),
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.skipButtonText}>Bỏ qua cảnh báo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

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
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeGreeting}>
              Xin chào, {user?.fullName || 'bạn'}! 👋
            </Text>
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
                  { backgroundColor: action.backgroundColor },
                ]}
                onPress={() => router.push(action.route as any)}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.color },
                  ]}
                >
                  <Ionicons
                    name={action.icon}
                    size={24}
                    color={colors.neutral[50]}
                  />
                </View>
                <Text
                  style={[styles.quickActionTitle, { color: action.color }]}
                >
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
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: getResponsiveSpacing('lg'),
  },
  loadingText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[600],
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  modalContent: {
    flex: 1,
    padding: getResponsiveSpacing('xl'),
    justifyContent: 'space-between',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xl'),
  },
  modalTitle: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: 'bold',
    color: colors.neutral[900],
    textAlign: 'center',
    marginTop: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  modalSubtitle: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionsContainer: {
    flex: 1,
    marginTop: getResponsiveSpacing('xl'),
  },
  instructionsTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('lg'),
  },
  instruction: {
    flexDirection: 'row',
    marginBottom: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('md'),
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: 'bold',
    color: colors.neutral[50],
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  stepDescription: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    lineHeight: 20,
  },
  modalButtons: {
    gap: getResponsiveSpacing('md'),
    marginTop: getResponsiveSpacing('xl'),
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  skipButton: {
    paddingVertical: getResponsiveSpacing('md'),
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[500],
    textDecorationLine: 'underline',
  },
});
