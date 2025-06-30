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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email,
        password,
        fullName,
        level: 'beginner',
        preferredLanguage: 'vi',
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Đăng ký thất bại',
        error.message || 'Vui lòng thử lại sau'
      );
    } finally {
      setIsLoading(false);
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
          {/* Header */}
          <LinearGradient
            colors={[colors.secondary[500], colors.secondary[600]]}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.neutral[50]} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Text style={styles.chineseTitle}>学中文</Text>
              <Text style={styles.appTitle}>Đăng ký tài khoản</Text>
            </View>
          </LinearGradient>

          {/* Register Form */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Chào mừng bạn mới!</Text>
            <Text style={styles.subtitle}>Tạo tài khoản để bắt đầu học</Text>

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.neutral[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                placeholderTextColor={colors.neutral[400]}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

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
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.neutral[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={colors.neutral[400]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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

            {/* Register Button */}
            <Button
              variant="primary"
              size="lg"
              onPress={handleRegister}
              disabled={isLoading}
              style={styles.registerButton}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.neutral[50]} size="small" />
              ) : (
                'Đăng ký'
              )}
            </Button>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
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
    height: Layout.isMobile ? 220 : 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: getResponsiveSpacing('3xl'),
    left: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('sm'),
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  chineseTitle: {
    fontSize: getResponsiveFontSize('5xl'),
    color: colors.neutral[50],
    fontWeight: 'bold',
    marginBottom: getResponsiveSpacing('sm'),
  },
  appTitle: {
    fontSize: getResponsiveFontSize('xl'),
    color: colors.neutral[50],
    fontWeight: '600',
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
  registerButton: {
    marginTop: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('xl'),
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },
  loginLink: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    fontWeight: '600',
  },
}); 