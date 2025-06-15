import { Dimensions, PixelRatio } from 'react-native';
import { typography } from './typography';
import { layout } from './layout';

// Device breakpoints for Chinese Learning App
export const breakpoints = {
  mobile: 0,        // 0px - 767px (iPhone, Android phones)
  tablet: 768,      // 768px - 1023px (iPad, Android tablets)
  desktop: 1024,    // 1024px+ (Desktop/laptop)
} as const;

// Standard device dimensions for testing
export const deviceTypes = {
  mobile: { width: 375, height: 812 },    // iPhone 13 Pro
  tablet: { width: 768, height: 1024 },   // iPad
  desktop: { width: 1200, height: 800 },  // Laptop
} as const;

// Get current screen dimensions
const screenData = Dimensions.get('window');
const screenWidth = screenData.width;
const screenHeight = screenData.height;

// Responsive layout utilities
export const Layout = {
  // Device type detection
  isMobile: screenWidth < breakpoints.tablet,
  isTablet: screenWidth >= breakpoints.tablet && screenWidth < breakpoints.desktop,
  isDesktop: screenWidth >= breakpoints.desktop,
  
  // Screen dimensions
  screenWidth,
  screenHeight,
  
  // Safe area calculations
  safeAreaTop: 44, // Default iOS safe area
  safeAreaBottom: 34, // Default iOS safe area
  
  // Content dimensions
  contentWidth: screenWidth - (layout.spacing.lg * 2),
  availableHeight: screenHeight - 100, // Minus tab bar and safe areas
  
  // Grid calculations for vocabulary cards
  getCardWidth: (columns: number = 1, gap: number = layout.spacing.md) => {
    const totalGap = gap * (columns - 1);
    const availableWidth = screenWidth - (layout.spacing.lg * 2) - totalGap;
    return availableWidth / columns;
  },
  
  // Dynamic columns based on screen size
  getOptimalColumns: () => {
    if (screenWidth >= breakpoints.desktop) return 3;
    if (screenWidth >= breakpoints.tablet) return 2;
    return 1;
  },
  
  // Responsive dimensions
  getResponsiveWidth: (mobileWidth: number, tabletWidth?: number, desktopWidth?: number) => {
    if (Layout.isDesktop && desktopWidth) return desktopWidth;
    if (Layout.isTablet && tabletWidth) return tabletWidth;
    return mobileWidth;
  },
  
  getResponsiveHeight: (mobileHeight: number, tabletHeight?: number, desktopHeight?: number) => {
    if (Layout.isDesktop && desktopHeight) return desktopHeight;
    if (Layout.isTablet && tabletHeight) return tabletHeight;
    return mobileHeight;
  },
};

// Enhanced spacing system with responsive multipliers
export const spacing = {
  xs: 4,     // Minimal spacing
  sm: 8,     // Small spacing
  md: 16,    // Medium spacing
  lg: 24,    // Large spacing
  xl: 32,    // Extra large spacing
  '2xl': 48, // Double extra large
  '3xl': 64, // Triple extra large
  '4xl': 80, // Quadruple extra large
  '5xl': 96, // Quintuple extra large
} as const;

// Responsive spacing function with device multipliers
export const getResponsiveSpacing = (size: keyof typeof spacing): number => {
  const base = spacing[size];
  
  // Scale spacing based on device type and pixel density
  const pixelRatio = PixelRatio.get();
  let multiplier = 1;
  
  if (Layout.isMobile) {
    multiplier = 1;
  } else if (Layout.isTablet) {
    multiplier = 1.2;
  } else {
    multiplier = 1.4;
  }
  
  // Adjust for high-density screens
  if (pixelRatio > 2) {
    multiplier *= 1.1;
  }
  
  return Math.round(base * multiplier);
};

// Chinese-specific font sizes
const chineseSizes = {
  practice: 80,    // For practice screens
  display: 64,     // For main display
  large: 48,       // For cards
  medium: 36,      // For lists
  small: 24,       // For compact views
} as const;

// Enhanced typography system for Chinese characters
export const responsiveTypography = {
  ...typography,
  chineseSizes,
  
  // Responsive font scaling
  getResponsiveFontSize: (size: keyof typeof typography.sizes): number => {
    const base = typography.sizes[size];
    
    // Scale fonts based on device and screen density
    let scaleFactor = 1;
    const pixelRatio = PixelRatio.get();
    
    if (Layout.isMobile) {
      scaleFactor = 1;
    } else if (Layout.isTablet) {
      scaleFactor = 1.1;
    } else {
      scaleFactor = 1.2;
    }
    
    // Ensure minimum readability on high-density screens
    if (pixelRatio > 2 && base < 16) {
      scaleFactor *= 1.1;
    }
    
    return Math.round(base * scaleFactor);
  },
  
  // Chinese character specific font sizing
  getChineseFontSize: (size: keyof typeof chineseSizes): number => {
    const base = chineseSizes[size];
    
    if (Layout.isMobile) return base * 0.9;
    if (Layout.isTablet) return base;
    return base * 1.1;
  },
  
  // Line height optimization for Chinese text
  getChineseLineHeight: (fontSize: number): number => {
    // Chinese characters need less line height than Latin text
    return fontSize * 1.2;
  },
};

// Responsive grid system for lesson layouts
export const grid = {
  // Container padding
  containerPadding: {
    mobile: getResponsiveSpacing('lg'),
    tablet: getResponsiveSpacing('xl'),
    desktop: getResponsiveSpacing('2xl'),
  },
  
  // Card dimensions for vocabulary practice
  vocabularyCard: {
    mobile: {
      width: '100%',
      minHeight: 150,
      aspectRatio: undefined,
    },
    tablet: {
      width: '48%',
      minHeight: 180,
      aspectRatio: 1.2,
    },
    desktop: {
      width: '32%',
      minHeight: 200,
      aspectRatio: 1.1,
    },
  },
  
  // Lesson card dimensions
  lessonCard: {
    mobile: {
      width: '100%',
      height: 120,
    },
    tablet: {
      width: '48%',
      height: 140,
    },
    desktop: {
      width: '32%',
      height: 160,
    },
  },
  
  // Gap between elements
  gap: {
    mobile: getResponsiveSpacing('md'),
    tablet: getResponsiveSpacing('lg'),
    desktop: getResponsiveSpacing('xl'),
  },
};

// Responsive button system
export const button = {
  // Minimum touch targets (accessibility)
  minTouchTarget: 44,
  
  // Button heights by device
  height: {
    mobile: 44,
    tablet: 48,
    desktop: 52,
  },
  
  // Button padding
  padding: {
    mobile: {
      horizontal: getResponsiveSpacing('lg'),
      vertical: getResponsiveSpacing('sm'),
    },
    tablet: {
      horizontal: getResponsiveSpacing('xl'),
      vertical: getResponsiveSpacing('md'),
    },
    desktop: {
      horizontal: getResponsiveSpacing('2xl'),
      vertical: getResponsiveSpacing('lg'),
    },
  },
  
  // Border radius scaling
  borderRadius: {
    mobile: 8,
    tablet: 12,
    desktop: 16,
  },
  
  // Get responsive button styles
  getButtonStyles: () => {
    const deviceType = Layout.isMobile ? 'mobile' : Layout.isTablet ? 'tablet' : 'desktop';
    
    return {
      minHeight: button.height[deviceType],
      paddingHorizontal: button.padding[deviceType].horizontal,
      paddingVertical: button.padding[deviceType].vertical,
      borderRadius: button.borderRadius[deviceType],
    };
  },
};

// Responsive navigation system
export const navigation = {
  // Tab bar configuration
  tabBar: {
    height: {
      mobile: 60,
      tablet: 70,
      desktop: 80,
    },
    iconSize: {
      mobile: 24,
      tablet: 28,
      desktop: 32,
    },
    fontSize: {
      mobile: responsiveTypography.getResponsiveFontSize('xs'),
      tablet: responsiveTypography.getResponsiveFontSize('sm'),
      desktop: responsiveTypography.getResponsiveFontSize('base'),
    },
  },
  
  // Header configuration
  header: {
    height: {
      mobile: 56,
      tablet: 64,
      desktop: 72,
    },
    titleFontSize: {
      mobile: responsiveTypography.getResponsiveFontSize('lg'),
      tablet: responsiveTypography.getResponsiveFontSize('xl'),
      desktop: responsiveTypography.getResponsiveFontSize('2xl'),
    },
  },
};

// Responsive modal/overlay system
export const modal = {
  // Modal sizing
  maxWidth: {
    mobile: '95%',
    tablet: '80%',
    desktop: '60%',
  },
  
  maxHeight: {
    mobile: '90%',
    tablet: '85%',
    desktop: '80%',
  },
  
  // Modal padding
  padding: {
    mobile: getResponsiveSpacing('lg'),
    tablet: getResponsiveSpacing('xl'),
    desktop: getResponsiveSpacing('2xl'),
  },
  
  // Border radius
  borderRadius: {
    mobile: 16,
    tablet: 20,
    desktop: 24,
  },
};

// Responsive shadow system
export const shadow = {
  small: {
    mobile: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    tablet: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    desktop: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
  },
  
  medium: {
    mobile: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    tablet: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    desktop: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  large: {
    mobile: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    tablet: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
    desktop: {
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 32,
      elevation: 16,
    },
  },
  
  // Get responsive shadow
  getResponsiveShadow: (size: 'small' | 'medium' | 'large') => {
    const deviceType = Layout.isMobile ? 'mobile' : Layout.isTablet ? 'tablet' : 'desktop';
    return shadow[size][deviceType];
  },
};

// Utility functions for responsive design
export const responsive = {
  // Get value based on device type
  getValue: <T>(mobile: T, tablet?: T, desktop?: T): T => {
    if (Layout.isDesktop && desktop !== undefined) return desktop;
    if (Layout.isTablet && tablet !== undefined) return tablet;
    return mobile;
  },
  
  // Get style object based on device
  getStyle: (mobileStyle: object, tabletStyle?: object, desktopStyle?: object) => {
    if (Layout.isDesktop && desktopStyle) return { ...mobileStyle, ...desktopStyle };
    if (Layout.isTablet && tabletStyle) return { ...mobileStyle, ...tabletStyle };
    return mobileStyle;
  },
  
  // Conditional flex direction
  getFlexDirection: (mobileDirection: 'row' | 'column' = 'column') => {
    return Layout.isTablet ? 'row' : mobileDirection;
  },
  
  // Responsive flex wrap
  getFlexWrap: () => {
    return Layout.isTablet ? 'wrap' : 'nowrap';
  },
  
  // Responsive justify content
  getJustifyContent: (
    mobile: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' = 'flex-start',
    tablet?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly',
    desktop?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  ) => {
    if (Layout.isDesktop && desktop) return desktop;
    if (Layout.isTablet && tablet) return tablet;
    return mobile;
  },
};

// Export device detection utilities
export const device = {
  ...Layout,
  isSmallMobile: screenWidth < 375,
  isLargeMobile: screenWidth >= 375 && screenWidth < breakpoints.tablet,
  isSmallTablet: screenWidth >= breakpoints.tablet && screenWidth < 900,
  isLargeTablet: screenWidth >= 900 && screenWidth < breakpoints.desktop,
  
  // Orientation detection
  isPortrait: screenHeight > screenWidth,
  isLandscape: screenWidth > screenHeight,
  
  // Aspect ratio
  aspectRatio: screenWidth / screenHeight,
  
  // Device capabilities
  hasNotch: screenHeight >= 812 && Layout.isMobile, // iPhone X and newer
  hasHomeIndicator: screenHeight >= 812 && Layout.isMobile,
  
  // Pixel density
  pixelRatio: PixelRatio.get(),
  isHighDensity: PixelRatio.get() > 2,
};

// Export all responsive utilities
export default {
  breakpoints,
  deviceTypes,
  Layout,
  spacing,
  getResponsiveSpacing,
  responsiveTypography,
  grid,
  button,
  navigation,
  modal,
  shadow,
  responsive,
  device,
}; 