// Main theme exports for Chinese Learning App
// Import for internal use
import { colors, colorUtils } from './colors';
import { typography } from './typography';
import { layout } from './layout';
import { 
  breakpoints,
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
} from './responsive';

export { colors, colorUtils, lightTheme, darkTheme } from './colors';
export { typography } from './typography';
export { layout } from './layout';
export { 
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
} from './responsive';

// Re-export commonly used utilities for convenience
export const {
  getResponsiveFontSize,
  getChineseFontSize,
  getChineseLineHeight,
} = responsiveTypography;

export const {
  getToneColor,
  getHSKColor,
  getDifficultyColor,
  getLearningStatusColor,
  addOpacity,
  getShadowColor,
} = colorUtils;

export const {
  getValue: getResponsiveValue,
  getStyle: getResponsiveStyle,
  getFlexDirection: getResponsiveFlexDirection,
  getFlexWrap: getResponsiveFlexWrap,
  getJustifyContent: getResponsiveJustifyContent,
} = responsive;

// Theme configuration object
export const theme = {
  colors,
  typography,
  layout,
  breakpoints,
  spacing,
  grid,
  button,
  navigation,
  modal,
  shadow,
  device,
  
  // Utility functions
  getResponsiveSpacing,
  getResponsiveFontSize: responsiveTypography.getResponsiveFontSize,
  getChineseFontSize: responsiveTypography.getChineseFontSize,
  getToneColor: colorUtils.getToneColor,
  getHSKColor: colorUtils.getHSKColor,
  getDifficultyColor: colorUtils.getDifficultyColor,
  getLearningStatusColor: colorUtils.getLearningStatusColor,
  getResponsiveValue: responsive.getValue,
  getResponsiveStyle: responsive.getStyle,
  
  // Device detection
  isMobile: device.isMobile,
  isTablet: device.isTablet,
  isDesktop: device.isDesktop,
  screenWidth: device.screenWidth,
  screenHeight: device.screenHeight,
};

// Export default theme
export default theme; 