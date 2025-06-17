import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Internal imports
import { Button } from '../../atoms/Button';
import { SearchBar } from '../../molecules/SearchBar';
import type {
  HeaderProps,
  HeaderRef,
  HeaderState,
  HeaderStyles,
  Language,
  HeaderAction,
} from './Header.types';
import {
  colors,
  getResponsiveSpacing,
  getResponsiveFontSize,
  Layout,
  typography,
} from '@/theme';

// Constants
const HEADER_HEIGHT = {
  sm: 56,
  md: 64,
  lg: 72,
  xl: 80,
} as const;

const LANGUAGE_FLAGS = {
  vi: '🇻🇳',
  en: '🇺🇸',
  zh: '🇨🇳',
} as const;

const LANGUAGE_LABELS = {
  vi: 'Tiếng Việt',
  en: 'English',
  zh: '中文',
} as const;

/**
 * Modern Header Component for Chinese Learning App
 * 
 * Features:
 * - Language switcher with flags
 * - Search functionality
 * - Profile integration
 * - Multiple variants and sizes
 * - Smooth animations
 * - Responsive design
 * - Vietnamese-first approach
 */
export const Header = forwardRef<HeaderRef, HeaderProps>(({
  variant = 'default',
  size = 'md',
  title,
  subtitle,
  navigation,
  actions = [],
  languageSwitcher,
  search,
  profile,
  backgroundColor,
  textColor,
  showShadow = true,
  showBorder = false,
  sticky = false,
  transparent = false,
  blurBackground = false,
  animateOnScroll = false,
  hideOnScroll = false,
  containerStyle,
  contentStyle,
  titleStyle,
  onLayout,
  onScroll,
}, ref) => {
  // Hooks
  const insets = useSafeAreaInsets();
  
  // Component state
  const [state, setState] = useState<HeaderState>({
    isSearchActive: false,
    searchQuery: search?.value || '',
    isLanguageSwitcherOpen: false,
    isProfileMenuOpen: false,
    hasNotifications: actions.some(action => action.badge && action.badge > 0),
  });

  // Animation values
  const headerOpacity = useSharedValue(1);
  const headerTranslateY = useSharedValue(0);
  const searchScale = useSharedValue(search ? 1 : 0);
  const languageSwitcherScale = useSharedValue(0);
  const profileMenuScale = useSharedValue(0);

  // Memoized values
  const headerHeight = useMemo(() => {
    const baseHeight = HEADER_HEIGHT[size];
    return baseHeight + insets.top;
  }, [size, insets.top]);

  const themeColors = useMemo(() => {
    if (backgroundColor && textColor) {
      return {
        background: backgroundColor,
        text: textColor,
        accent: colors.primary[500],
        border: colors.neutral[200],
      };
    }

    switch (variant) {
      case 'transparent':
        return {
          background: 'transparent',
          text: colors.neutral[50],
          accent: colors.neutral[50],
          border: 'transparent',
        };
      case 'gradient':
        return {
          background: colors.primary[500],
          text: colors.neutral[50],
          accent: colors.secondary[500],
          border: colors.primary[600],
        };
      case 'lesson':
        return {
          background: colors.accent[50],
          text: colors.accent[900],
          accent: colors.accent[600],
          border: colors.accent[200],
        };
      default:
        return {
          background: colors.neutral[50],
          text: colors.neutral[900],
          accent: colors.primary[500],
          border: colors.neutral[200],
        };
    }
  }, [variant, backgroundColor, textColor]);

  // Ref methods
  useImperativeHandle(ref, () => ({
    openLanguageSwitcher: () => {
      setState(prev => ({ ...prev, isLanguageSwitcherOpen: true }));
      languageSwitcherScale.value = withSpring(1);
    },
    closeLanguageSwitcher: () => {
      setState(prev => ({ ...prev, isLanguageSwitcherOpen: false }));
      languageSwitcherScale.value = withSpring(0);
    },
    openProfileMenu: () => {
      setState(prev => ({ ...prev, isProfileMenuOpen: true }));
      profileMenuScale.value = withSpring(1);
    },
    closeProfileMenu: () => {
      setState(prev => ({ ...prev, isProfileMenuOpen: false }));
      profileMenuScale.value = withSpring(0);
    },
    focusSearch: () => {
      setState(prev => ({ ...prev, isSearchActive: true }));
      searchScale.value = withSpring(1);
    },
    blurSearch: () => {
      setState(prev => ({ ...prev, isSearchActive: false }));
      searchScale.value = withSpring(0);
    },
    setSearchQuery: (query: string) => {
      setState(prev => ({ ...prev, searchQuery: query }));
    },
    getState: () => state,
  }), [state]);

  // Event handlers
  const handleBackPress = useCallback(() => {
    navigation?.onBackPress?.();
  }, [navigation]);

  const handleMenuPress = useCallback(() => {
    navigation?.onMenuPress?.();
  }, [navigation]);

  const handleSearchFocus = useCallback(() => {
    setState(prev => ({ ...prev, isSearchActive: true }));
    searchScale.value = withSpring(1);
    search?.onFocus?.();
  }, [search]);

  const handleSearchBlur = useCallback(() => {
    setState(prev => ({ ...prev, isSearchActive: false }));
    searchScale.value = withSpring(0);
    search?.onBlur?.();
  }, [search]);

  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    search?.onSearch(query);
  }, [search]);

  const handleLanguagePress = useCallback(() => {
    setState(prev => ({ ...prev, isLanguageSwitcherOpen: !prev.isLanguageSwitcherOpen }));
    languageSwitcherScale.value = withSpring(state.isLanguageSwitcherOpen ? 0 : 1);
  }, [state.isLanguageSwitcherOpen]);

  const handleLanguageSelect = useCallback((language: Language) => {
    languageSwitcher?.onLanguageChange(language);
    setState(prev => ({ ...prev, isLanguageSwitcherOpen: false }));
    languageSwitcherScale.value = withSpring(0);
  }, [languageSwitcher]);

  const handleProfilePress = useCallback(() => {
    if (profile?.onProfilePress) {
      profile.onProfilePress();
    } else {
      setState(prev => ({ ...prev, isProfileMenuOpen: !prev.isProfileMenuOpen }));
      profileMenuScale.value = withSpring(state.isProfileMenuOpen ? 0 : 1);
    }
  }, [profile, state.isProfileMenuOpen]);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchScale.value }],
    opacity: searchScale.value,
  }));

  const languageSwitcherAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: languageSwitcherScale.value }],
    opacity: languageSwitcherScale.value,
  }));

  const profileMenuAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profileMenuScale.value }],
    opacity: profileMenuScale.value,
  }));

  // Styles
  const styles = useMemo((): HeaderStyles => StyleSheet.create({
    container: {
      height: headerHeight,
      backgroundColor: themeColors.background,
      paddingTop: insets.top,
      ...(showShadow && {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      }),
      ...(showBorder && {
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
      }),
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getResponsiveSpacing('lg'),
      gap: getResponsiveSpacing('md'),
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getResponsiveSpacing('sm'),
    },
    centerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getResponsiveSpacing('sm'),
    },
    title: {
      fontSize: getResponsiveFontSize('xl'),
      fontWeight: typography.weights.bold,
      color: themeColors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: getResponsiveFontSize('sm'),
      fontWeight: typography.weights.medium,
      color: themeColors.text,
      opacity: 0.7,
      textAlign: 'center',
      marginTop: 2,
    },
    navigationButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.neutral[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    navigationIcon: {
      fontSize: getResponsiveFontSize('lg'),
      color: themeColors.text,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.neutral[100],
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    actionIcon: {
      fontSize: getResponsiveFontSize('lg'),
      color: themeColors.text,
    },
    actionBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.error[500],
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionBadgeText: {
      fontSize: getResponsiveFontSize('xs'),
      fontWeight: typography.weights.bold,
      color: colors.neutral[50],
    },
    searchContainer: {
      position: 'absolute',
      top: insets.top + 8,
      left: getResponsiveSpacing('lg'),
      right: getResponsiveSpacing('lg'),
      zIndex: 10,
    },
    searchInput: {
      backgroundColor: colors.neutral[50],
      borderRadius: 12,
    },
    searchIcon: {
      fontSize: getResponsiveFontSize('lg'),
      color: themeColors.accent,
    },
    languageSwitcher: {
      position: 'absolute',
      top: headerHeight + 8,
      right: getResponsiveSpacing('lg'),
      backgroundColor: colors.neutral[50],
      borderRadius: 12,
      padding: getResponsiveSpacing('sm'),
      shadowColor: colors.neutral[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 20,
    },
    languageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: getResponsiveSpacing('sm'),
      paddingHorizontal: getResponsiveSpacing('md'),
      borderRadius: 8,
      gap: getResponsiveSpacing('sm'),
    },
    languageFlag: {
      fontSize: getResponsiveFontSize('lg'),
    },
    languageLabel: {
      fontSize: getResponsiveFontSize('base'),
      fontWeight: typography.weights.medium,
      color: colors.neutral[900],
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getResponsiveSpacing('sm'),
    },
    profileAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileInfo: {
      alignItems: 'flex-end',
    },
    profileName: {
      fontSize: getResponsiveFontSize('sm'),
      fontWeight: typography.weights.medium,
      color: themeColors.text,
    },
    profileLevel: {
      fontSize: getResponsiveFontSize('xs'),
      color: themeColors.accent,
      fontWeight: typography.weights.bold,
    },
    profileXP: {
      fontSize: getResponsiveFontSize('xs'),
      color: themeColors.text,
      opacity: 0.7,
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary[500],
    },
    transparentOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    shadow: {
      shadowColor: colors.neutral[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
  }), [headerHeight, insets.top, themeColors, showShadow, showBorder]);

  // Render navigation section
  const renderLeftSection = () => (
    <View style={styles.leftSection}>
      {navigation?.showBack && (
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={handleBackPress}
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <Text style={styles.navigationIcon}>
            {navigation.backIcon || '←'}
          </Text>
        </TouchableOpacity>
      )}
      
      {navigation?.showMenu && (
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={handleMenuPress}
          accessibilityLabel="Menu"
          accessibilityRole="button"
        >
          <Text style={styles.navigationIcon}>
            {navigation.menuIcon || '☰'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render center section
  const renderCenterSection = () => {
    if (variant === 'search' && state.isSearchActive) {
      return null; // Search takes full width
    }

    return (
      <View style={styles.centerSection}>
        {title && (
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  // Render right section
  const renderRightSection = () => (
    <View style={styles.rightSection}>
      {/* Profile */}
      {profile && (
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={handleProfilePress}
          accessibilityLabel="Hồ sơ người dùng"
          accessibilityRole="button"
        >
          <View style={styles.profileAvatar}>
            <Text style={{ color: colors.neutral[50], fontSize: getResponsiveFontSize('sm') }}>
              {profile.name?.charAt(0) || '👤'}
            </Text>
          </View>
          {!Layout.isMobile && (
            <View style={styles.profileInfo}>
              {profile.name && (
                <Text style={styles.profileName}>{profile.name}</Text>
              )}
              {profile.showLevel && profile.level && (
                <Text style={styles.profileLevel}>HSK {profile.level}</Text>
              )}
              {profile.showXP && profile.xp && (
                <Text style={styles.profileXP}>{profile.xp} XP</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Language Switcher */}
      {languageSwitcher && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLanguagePress}
          accessibilityLabel="Chuyển đổi ngôn ngữ"
          accessibilityRole="button"
        >
          <Text style={styles.languageFlag}>
            {LANGUAGE_FLAGS[languageSwitcher.currentLanguage]}
          </Text>
        </TouchableOpacity>
      )}

      {/* Action buttons */}
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.actionButton}
          onPress={action.onPress}
          disabled={action.disabled}
          accessibilityLabel={action.label}
          accessibilityRole="button"
        >
          <Text style={[styles.actionIcon, action.disabled && { opacity: 0.5 }]}>
            {action.icon}
          </Text>
          {action.badge && action.badge > 0 && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>
                {action.badge > 99 ? '99+' : action.badge.toString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render search overlay
  const renderSearchOverlay = () => {
    if (variant !== 'search' || !search) return null;

    return (
      <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
        <SearchBar
          placeholder={search.placeholder || 'Tìm kiếm...'}
          value={state.searchQuery}
          onSearch={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          // suggestions={search.suggestions}
        />
      </Animated.View>
    );
  };

  // Render language switcher dropdown
  const renderLanguageSwitcher = () => {
    if (!languageSwitcher || !state.isLanguageSwitcherOpen) return null;

    return (
      <Animated.View style={[styles.languageSwitcher, languageSwitcherAnimatedStyle]}>
        {languageSwitcher.availableLanguages.map((language) => (
          <TouchableOpacity
            key={language}
            style={[
              styles.languageButton,
              language === languageSwitcher.currentLanguage && {
                backgroundColor: colors.primary[100],
              },
            ]}
            onPress={() => handleLanguageSelect(language)}
          >
            {languageSwitcher.showFlags !== false && (
              <Text style={styles.languageFlag}>
                {LANGUAGE_FLAGS[language]}
              </Text>
            )}
            {languageSwitcher.showLabels !== false && (
              <Text style={styles.languageLabel}>
                {LANGUAGE_LABELS[language]}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          containerStyle,
          headerAnimatedStyle,
        ]}
        onLayout={onLayout}
      >
        {/* Background overlays */}
        {variant === 'gradient' && <View style={styles.gradientOverlay} />}
        {variant === 'transparent' && <View style={styles.transparentOverlay} />}

        {/* Main content */}
        <View style={[styles.content, contentStyle]}>
          {renderLeftSection()}
          {renderCenterSection()}
          {renderRightSection()}
        </View>

        {/* Search overlay */}
        {renderSearchOverlay()}
      </Animated.View>

      {/* Dropdowns */}
      {renderLanguageSwitcher()}
    </>
  );
});

Header.displayName = 'Header';

export default Header; 