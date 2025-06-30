import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  colors,
  getResponsiveSpacing,
  getResponsiveFontSize,
  Layout,
} from '../../src/theme';
import { Button } from '../../src/components/ui/atoms/Button';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Đăng nhập thất bại',
        error.message || 'Vui lòng kiểm tra lại thông tin đăng nhập'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (type: 'student' | 'teacher') => {
    if (type === 'student') {
      setEmail('student@example.com');
      setPassword('password123');
    } else {
      setEmail('teacher@example.com');
      setPassword('password123');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Chinese pattern */}
          <LinearGradient
            colors={[colors.primary[500], colors.primary[600]]}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.chineseTitle}>学中文</Text>
              <Text style={styles.appTitle}>Học Tiếng Trung</Text>
            </View>
            <View style={styles.pattern}>
              {[...Array(3)].map((_, i) => (
                <View key={i} style={styles.patternRow}>
                  {[...Array(4)].map((_, j) => (
                    <Text key={j} style={styles.patternChar}>
                      {['福', '禄', '寿', '喜'][j]}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục học</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.neutral[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.neutral[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.neutral[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor={colors.neutral[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              variant="primary"
              size="lg"
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.neutral[50]} size="small" />
              ) : (
                'Đăng nhập'
              )}
            </Button>

            {/* Quick Login Options */}
            <View style={styles.quickLoginContainer}>
              <Text style={styles.quickLoginTitle}>Đăng nhập nhanh:</Text>
              <View style={styles.quickLoginButtons}>
                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={() => handleQuickLogin('student')}
                >
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color={colors.primary[600]}
                  />
                  <Text style={styles.quickLoginText}>Học viên</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickLoginButton}
                  onPress={() => handleQuickLogin('teacher')}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.secondary[600]}
                  />
                  <Text style={styles.quickLoginText}>Giáo viên</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: Layout.isMobile ? 280 : 320,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  chineseTitle: {
    fontSize: getResponsiveFontSize('6xl'),
    color: colors.neutral[50],
    fontWeight: 'bold',
    marginBottom: getResponsiveSpacing('sm'),
  },
  appTitle: {
    fontSize: getResponsiveFontSize('xl'),
    color: colors.neutral[50],
    fontWeight: '600',
  },
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: getResponsiveSpacing('lg'),
  },
  patternChar: {
    fontSize: getResponsiveFontSize('4xl'),
    color: colors.neutral[50],
  },
  formContainer: {
    flex: 1,
    padding: getResponsiveSpacing('xl'),
    backgroundColor: colors.neutral[50],
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: getResponsiveSpacing('2xl'),
  },
  welcomeText: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    marginBottom: getResponsiveSpacing('2xl'),
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: Layout.isMobile ? 12 : 16,
    marginBottom: getResponsiveSpacing('lg'),
    paddingHorizontal: getResponsiveSpacing('lg'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  inputIcon: {
    marginRight: getResponsiveSpacing('md'),
  },
  input: {
    flex: 1,
    height: Layout.isMobile ? 50 : 56,
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
  },
  eyeIcon: {
    padding: getResponsiveSpacing('sm'),
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: getResponsiveSpacing('xl'),
  },
  forgotPasswordText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: getResponsiveSpacing('xl'),
  },
  quickLoginContainer: {
    marginBottom: getResponsiveSpacing('2xl'),
  },
  quickLoginTitle: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  quickLoginButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: getResponsiveSpacing('lg'),
  },
  quickLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('sm'),
    paddingHorizontal: getResponsiveSpacing('lg'),
    borderRadius: Layout.isMobile ? 20 : 24,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  quickLoginText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[700],
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },
  registerLink: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    fontWeight: '600',
  },
});
