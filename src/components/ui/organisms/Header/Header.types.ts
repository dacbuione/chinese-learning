import type { ViewStyle, TextStyle } from 'react-native';

// 🎯 Header Component Types

/**
 * Header variants for different screens
 */
export type HeaderVariant = 
  | 'default'     // Standard header
  | 'minimal'     // Minimal header with just title
  | 'search'      // Header with search functionality
  | 'profile'     // Header with profile actions
  | 'lesson'      // Header for lesson screens
  | 'transparent' // Transparent overlay header
  | 'gradient';   // Gradient background header

/**
 * Header sizes
 */
export type HeaderSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Language options for switcher
 */
export type Language = 'vi' | 'en' | 'zh';

/**
 * Header action button configuration
 */
export interface HeaderAction {
  id: string;
  icon: string;
  label?: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

/**
 * Language switcher configuration
 */
export interface LanguageSwitcherConfig {
  currentLanguage: Language;
  availableLanguages: Language[];
  onLanguageChange: (language: Language) => void;
  showFlags?: boolean;
  showLabels?: boolean;
}

/**
 * Search configuration
 */
export interface HeaderSearchConfig {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  suggestions?: string[];
  autoFocus?: boolean;
}

/**
 * Profile configuration
 */
export interface HeaderProfileConfig {
  avatar?: string;
  name?: string;
  level?: number;
  xp?: number;
  onProfilePress: () => void;
  showLevel?: boolean;
  showXP?: boolean;
}

/**
 * Navigation configuration
 */
export interface HeaderNavigationConfig {
  showBack?: boolean;
  showMenu?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  backIcon?: string;
  menuIcon?: string;
}

/**
 * Header state
 */
export interface HeaderState {
  isSearchActive: boolean;
  searchQuery: string;
  isLanguageSwitcherOpen: boolean;
  isProfileMenuOpen: boolean;
  hasNotifications: boolean;
}

/**
 * Header styles interface
 */
export interface HeaderStyles {
  container: ViewStyle;
  content: ViewStyle;
  leftSection: ViewStyle;
  centerSection: ViewStyle;
  rightSection: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  navigationButton: ViewStyle;
  navigationIcon: TextStyle;
  actionButton: ViewStyle;
  actionIcon: TextStyle;
  actionBadge: ViewStyle;
  actionBadgeText: TextStyle;
  searchContainer: ViewStyle;
  searchInput: ViewStyle;
  searchIcon: TextStyle;
  languageSwitcher: ViewStyle;
  languageButton: ViewStyle;
  languageFlag: TextStyle;
  languageLabel: TextStyle;
  profileContainer: ViewStyle;
  profileAvatar: ViewStyle;
  profileInfo: ViewStyle;
  profileName: TextStyle;
  profileLevel: TextStyle;
  profileXP: TextStyle;
  gradientOverlay: ViewStyle;
  transparentOverlay: ViewStyle;
  shadow: ViewStyle;
}

/**
 * Main Header component props
 */
export interface HeaderProps {
  // Basic props
  variant?: HeaderVariant;
  size?: HeaderSize;
  title?: string;
  subtitle?: string;
  
  // Navigation props
  navigation?: HeaderNavigationConfig;
  
  // Actions props
  actions?: HeaderAction[];
  
  // Language switcher props
  languageSwitcher?: LanguageSwitcherConfig;
  
  // Search props
  search?: HeaderSearchConfig;
  
  // Profile props
  profile?: HeaderProfileConfig;
  
  // Styling props
  backgroundColor?: string;
  textColor?: string;
  showShadow?: boolean;
  showBorder?: boolean;
  
  // Layout props
  sticky?: boolean;
  transparent?: boolean;
  blurBackground?: boolean;
  
  // Animation props
  animateOnScroll?: boolean;
  hideOnScroll?: boolean;
  
  // Style props
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  
  // Callback props
  onLayout?: (event: any) => void;
  onScroll?: (scrollY: number) => void;
}

/**
 * Header component ref methods
 */
export interface HeaderRef {
  openLanguageSwitcher: () => void;
  closeLanguageSwitcher: () => void;
  openProfileMenu: () => void;
  closeProfileMenu: () => void;
  focusSearch: () => void;
  blurSearch: () => void;
  setSearchQuery: (query: string) => void;
  getState: () => HeaderState;
}

/**
 * Header hook return type
 */
export interface UseHeaderReturn {
  state: HeaderState;
  actions: {
    toggleLanguageSwitcher: () => void;
    toggleProfileMenu: () => void;
    setSearchActive: (active: boolean) => void;
    setSearchQuery: (query: string) => void;
    handleBackPress: () => void;
    handleMenuPress: () => void;
  };
  animations: {
    fadeIn: () => void;
    fadeOut: () => void;
    slideUp: () => void;
    slideDown: () => void;
  };
}

/**
 * Header preset configurations
 */
export interface HeaderPresets {
  home: Partial<HeaderProps>;
  lesson: Partial<HeaderProps>;
  profile: Partial<HeaderProps>;
  search: Partial<HeaderProps>;
  settings: Partial<HeaderProps>;
  minimal: Partial<HeaderProps>;
}

/**
 * Header accessibility props
 */
export interface HeaderA11yProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'header' | 'banner';
  titleAccessibilityLabel?: string;
  backButtonAccessibilityLabel?: string;
  menuButtonAccessibilityLabel?: string;
}

/**
 * Extended props with accessibility
 */
export interface HeaderPropsWithA11y extends HeaderProps, HeaderA11yProps {}

// All types are already exported inline above 