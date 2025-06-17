module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/features': './src/components/features',
            '@/ui': './src/components/ui',
            '@/common': './src/components/common',
            '@/theme': './src/theme',
            '@/services': './src/services',
            '@/hooks': './src/hooks',
            '@/store': './src/store',
            '@/utils': './src/utils',
            '@/localization': './src/localization',
            '@/types': './src/types',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
}; 