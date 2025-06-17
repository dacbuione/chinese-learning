const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path aliases for Metro bundler
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@/components': path.resolve(__dirname, 'src/components'),
  '@/features': path.resolve(__dirname, 'src/components/features'),
  '@/ui': path.resolve(__dirname, 'src/components/ui'),
  '@/common': path.resolve(__dirname, 'src/components/common'),
  '@/theme': path.resolve(__dirname, 'src/theme'),
  '@/services': path.resolve(__dirname, 'src/services'),
  '@/hooks': path.resolve(__dirname, 'src/hooks'),
  '@/store': path.resolve(__dirname, 'src/store'),
  '@/utils': path.resolve(__dirname, 'src/utils'),
  '@/localization': path.resolve(__dirname, 'src/localization'),
  '@/types': path.resolve(__dirname, 'src/types'),
};

// Ensure resolver platforms include web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config; 