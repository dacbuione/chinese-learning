// 🎨 Modern Color System for Chinese Learning App
// Inspired by Chinese culture with contemporary design

export const colors = {
  // 🔴 Primary Colors (Chinese Red Heritage)
  primary: {
    50: '#FEF2F2',   // Lightest red, almost white
    100: '#FEE2E2',  // Very light red
    200: '#FECACA',  // Light red
    300: '#FCA5A5',  // Soft red
    400: '#F87171',  // Medium red
    500: '#DC2626',  // Main Chinese red (brand color)
    600: '#B91C1C',  // Darker red
    700: '#991B1B',  // Deep red
    800: '#7F1D1D',  // Very dark red
    900: '#450A0A',  // Deepest red
  },

  // 🟡 Secondary Colors (Chinese Gold/Yellow)
  secondary: {
    50: '#FFFBEB',   // Cream white
    100: '#FEF3C7',  // Light cream
    200: '#FDE68A',  // Soft yellow
    300: '#FCD34D',  // Light gold
    400: '#FBBF24',  // Medium gold
    500: '#F59E0B',  // Main Chinese gold
    600: '#D97706',  // Darker gold
    700: '#B45309',  // Deep gold
    800: '#92400E',  // Bronze
    900: '#78350F',  // Dark bronze
  },

  // 🟢 Accent Colors (Success/Growth)
  accent: {
    50: '#F0FDF4',   // Mint white
    100: '#DCFCE7',  // Light mint
    200: '#BBF7D0',  // Soft green
    300: '#86EFAC',  // Light green
    400: '#4ADE80',  // Medium green
    500: '#10B981',  // Main success green
    600: '#059669',  // Darker green
    700: '#047857',  // Deep green
    800: '#065F46',  // Forest green
    900: '#064E3B',  // Dark forest
  },

  // 🟢 Success Colors (Alias for accent)
  success: {
    50: '#F0FDF4',   // Mint white
    100: '#DCFCE7',  // Light mint
    200: '#BBF7D0',  // Soft green
    300: '#86EFAC',  // Light green
    400: '#4ADE80',  // Medium green
    500: '#10B981',  // Main success green
    600: '#059669',  // Darker green
    700: '#047857',  // Deep green
    800: '#065F46',  // Forest green
    900: '#064E3B',  // Dark forest
  },

  // 🔵 Info Colors (Learning/Trust)
  info: {
    50: '#EFF6FF',   // Sky white
    100: '#DBEAFE',  // Light sky
    200: '#BFDBFE',  // Soft blue
    300: '#93C5FD',  // Light blue
    400: '#60A5FA',  // Medium blue
    500: '#3B82F6',  // Main blue
    600: '#2563EB',  // Darker blue
    700: '#1D4ED8',  // Deep blue
    800: '#1E40AF',  // Navy blue
    900: '#1E3A8A',  // Dark navy
  },

  // 🟠 Warning Colors
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Main warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // 🔴 Error Colors
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // ⚫ Neutral Colors (Modern Grays)
  neutral: {
    50: '#FAFAFA',   // Almost white
    100: '#F4F4F5',  // Very light gray
    200: '#E4E4E7',  // Light gray
    300: '#D4D4D8',  // Soft gray
    400: '#A1A1AA',  // Medium gray
    500: '#71717A',  // Main gray
    600: '#52525B',  // Dark gray
    700: '#3F3F46',  // Darker gray
    800: '#27272A',  // Very dark gray
    900: '#18181B',  // Almost black
  },

  // 🎵 Tone Colors (Chinese Tone System)
  tones: {
    tone1: '#DC2626',  // First tone - high level (red)
    tone2: '#F59E0B',  // Second tone - rising (gold)
    tone3: '#10B981',  // Third tone - falling-rising (green)
    tone4: '#3B82F6',  // Fourth tone - falling (blue)
    neutral: '#71717A', // Neutral tone (gray)
  },

  // 🌈 Gradient Colors
  gradients: {
    primary: ['#DC2626', '#F59E0B'],      // Red to Gold
    secondary: ['#F59E0B', '#FCD34D'],    // Gold to Light Gold
    accent: ['#10B981', '#4ADE80'],       // Green gradient
    info: ['#3B82F6', '#60A5FA'],         // Blue gradient
    sunset: ['#DC2626', '#F59E0B', '#FCD34D'], // Chinese sunset
    ocean: ['#3B82F6', '#10B981'],        // Ocean waves
    forest: ['#065F46', '#10B981'],       // Forest depth
  },

  // 🎨 Semantic Colors
  semantic: {
    background: '#FAFAFA',      // Main background
    surface: '#FFFFFF',         // Card/surface background
    border: '#E4E4E7',          // Default border
    text: '#18181B',            // Primary text
    textSecondary: '#71717A',   // Secondary text
    textMuted: '#A1A1AA',       // Muted text
    placeholder: '#D4D4D8',     // Placeholder text
    disabled: '#F4F4F5',        // Disabled background
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
    shadow: 'rgba(0, 0, 0, 0.1)',  // Shadow color
  },

  // 🌙 Dark Theme Support
  dark: {
    background: '#0C0C0D',      // Dark background
    surface: '#18181B',         // Dark surface
    border: '#27272A',          // Dark border
    text: '#FAFAFA',            // Dark text
    textSecondary: '#A1A1AA',   // Dark secondary text
    textMuted: '#71717A',       // Dark muted text
  },

  // 🎯 HSK Level Colors (Chinese Proficiency)
  hsk: {
    hsk1: '#10B981',  // Beginner - Green
    hsk2: '#3B82F6',  // Elementary - Blue  
    hsk3: '#F59E0B',  // Intermediate - Gold
    hsk4: '#DC2626',  // Upper Intermediate - Red
    hsk5: '#7C3AED',  // Advanced - Purple
    hsk6: '#1F2937',  // Master - Dark Gray
  },

  // 🎪 Chinese Cultural Colors
  cultural: {
    imperial: '#8B5CF6',      // Imperial purple
    jade: '#10B981',          // Jade green
    bamboo: '#22C55E',        // Bamboo green
    lotus: '#F472B6',         // Lotus pink
    phoenix: '#DC2626',       // Phoenix red
    dragon: '#F59E0B',        // Dragon gold
    ink: '#1F2937',           // Chinese ink
    paper: '#FEF7ED',         // Traditional paper
  },

  // 🎨 Special Effects
  effects: {
    glass: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    blur: 'rgba(255, 255, 255, 0.8)',
    shimmer: 'rgba(255, 255, 255, 0.3)',
    glow: 'rgba(220, 38, 38, 0.3)',      // Red glow
    goldGlow: 'rgba(245, 158, 11, 0.3)',  // Gold glow
  },

  // 🎯 Status Colors
  status: {
    online: '#10B981',        // Online status
    offline: '#71717A',       // Offline status
    away: '#F59E0B',          // Away status
    busy: '#DC2626',          // Busy status
  },

  // ✨ Magic Colors (For special effects)
  magic: {
    sparkle: '#FCD34D',       // Sparkle effect
    rainbow: ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
    achievement: '#F59E0B',    // Achievement color
    streak: '#DC2626',         // Streak color
    perfect: '#10B981',        // Perfect score
  },
};

// 🎨 Color Utilities
export const colorUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number) => {
    return `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
  },
  
  // Get tone color by number
  getToneColor: (tone: number) => {
    const toneMap: Record<number, string> = {
      1: colors.tones.tone1,
      2: colors.tones.tone2,
      3: colors.tones.tone3,
      4: colors.tones.tone4,
      0: colors.tones.neutral,
    };
    return toneMap[tone] || colors.tones.neutral;
  },
  
  // Get HSK level color
  getHSKColor: (level: number) => {
    const hskMap: Record<number, string> = {
      1: colors.hsk.hsk1,
      2: colors.hsk.hsk2,
      3: colors.hsk.hsk3,
      4: colors.hsk.hsk4,
      5: colors.hsk.hsk5,
      6: colors.hsk.hsk6,
    };
    return hskMap[level] || colors.neutral[500];
  },
  
  // Get difficulty color
  getDifficultyColor: (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    const difficultyMap = {
      beginner: colors.accent[500],
      intermediate: colors.warning[500],
      advanced: colors.error[500],
    };
    return difficultyMap[difficulty];
  },

  // Get learning status color
  getLearningStatusColor: (status: 'new' | 'learning' | 'reviewing' | 'mastered') => {
    const statusMap = {
      new: colors.neutral[400],
      learning: colors.info[500],
      reviewing: colors.warning[500],
      mastered: colors.success[500],
    };
    return statusMap[status];
  },

  // Add opacity to color (alias for withOpacity)
  addOpacity: (color: string, opacity: number) => {
    return `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
  },

  // Get shadow color
  getShadowColor: (opacity: number = 0.1) => {
    return `rgba(0, 0, 0, ${opacity})`;
  },
};

// 🌈 Export for easy access
export const {
  primary,
  secondary,
  accent,
  info,
  warning,
  error,
  neutral,
  tones,
  gradients,
  semantic,
  dark,
  hsk,
  cultural,
  effects,
  status,
  magic,
} = colors;

// Theme configurations
export const lightTheme = {
  ...colors,
  semantic: {
    ...colors.semantic,
    background: colors.semantic.background,
    surface: colors.semantic.surface,
    text: colors.semantic.text,
  },
};

export const darkTheme = {
  ...colors,
  semantic: {
    ...colors.semantic,
    background: colors.dark.background,
    surface: colors.dark.surface,
    text: colors.dark.text,
  },
};

export default colors;