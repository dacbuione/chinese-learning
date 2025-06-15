import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations
import vi from './translations/vi';
import en from './translations/en';
import zh from './translations/zh';

// 🌍 Supported languages configuration
export const SUPPORTED_LANGUAGES = {
  vi: 'Tiếng Việt',
  en: 'English',
  zh: '中文 (简体)',
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// 🎯 Language resources
const resources = {
  vi: { translation: vi },
  en: { translation: en },
  zh: { translation: zh },
};

// 🔍 Get device language and map to supported language
const getDeviceLanguage = (): SupportedLanguage => {
  const deviceLocale = Localization.locale;
  
  // Extract language code (e.g., 'en-US' -> 'en')
  const languageCode = deviceLocale.split('-')[0];
  
  // Map common language codes
  const languageMap: Record<string, SupportedLanguage> = {
    'vi': 'vi',
    'en': 'en',
    'zh': 'zh',
    'zh-Hans': 'zh',  // Simplified Chinese
    'zh-Hant': 'zh',  // Traditional Chinese (fallback to simplified)
    'cmn': 'zh',      // Mandarin
  };
  
  return languageMap[languageCode] || languageMap[deviceLocale] || 'vi'; // Default to Vietnamese
};

// 🚀 Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    // Resources
    resources,
    
    // Default language
    lng: getDeviceLanguage(),
    fallbackLng: 'vi', // Vietnamese as fallback
    
    // Debugging (disable in production)
    debug: __DEV__,
    
    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already does escaping
      format: (value, format) => {
        // Custom formatting for Chinese Learning App
        if (format === 'percentage') {
          return `${Math.round(value)}%`;
        }
        if (format === 'currency') {
          return new Intl.NumberFormat(i18n.language, {
            style: 'currency',
            currency: 'VND',
          }).format(value);
        }
        return value;
      },
    },
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // React specific options
    react: {
      useSuspense: false, // Important for React Native
      bindI18n: 'languageChanged',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: false,
      transKeepBasicHtmlNodesFor: [],
    },
    
    // Detection options
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Cache user language
      caches: ['localStorage'],
      
      // Exclude certain detection methods
      excludeCacheFor: ['cimode'],
    },
    
    // Namespace and key separation
    defaultNS: 'translation',
    keySeparator: '.',
    nsSeparator: ':',
    
    // Backend options (for future remote translations)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Additional options for Chinese Learning App
    saveMissing: __DEV__, // Save missing keys in development
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (__DEV__) {
        console.warn(`🌍 Missing translation key: ${key} for language: ${lng}`);
      }
    },
    
    // Post-processing
    postProcess: ['interval', 'plural'],
    
    // Clean code configuration
    cleanCode: true,
    
    // Return empty string for missing keys
    returnEmptyString: false,
    returnNull: false,
    returnObjects: false,
    
    // Join arrays
    joinArrays: '\n',
    
    // Override warning for missing interpolation handler
    ignoreJSONStructure: true,
  });

// 🎨 Enhanced translation features for Chinese Learning App
export const translationFeatures = {
  // Format HSK level with proper styling
  formatHSKLevel: (level: number, language: string = i18n.language) => {
    const hskKey = `hsk.hsk${level}` as const;
    return i18n.t(hskKey);
  },
  
  // Format tone with color information
  formatTone: (tone: number, language: string = i18n.language) => {
    const toneKey = `chinese.tone${tone}` as const;
    return i18n.t(toneKey);
  },
  
  // Format stroke count
  formatStrokeCount: (count: number, language: string = i18n.language) => {
    return i18n.t('chinese.strokeCount', { count });
  },
  
  // Format accuracy percentage
  formatAccuracy: (percentage: number, language: string = i18n.language) => {
    return i18n.t('lessons.accuracy', { percent: Math.round(percentage) });
  },
  
  // Format learning streak
  formatStreak: (days: number, language: string = i18n.language) => {
    return i18n.t('home.streak', { count: days });
  },
  
  // Format lesson progress
  formatLessonProgress: (current: number, total: number, language: string = i18n.language) => {
    return i18n.t('home.dailyGoalProgress', { current, target: total });
  },
  
  // Get celebration message based on score
  getCelebrationMessage: (score: number): string => {
    if (score >= 95) return i18n.t('celebrations.excellent');
    if (score >= 85) return i18n.t('celebrations.veryGood');
    if (score >= 75) return i18n.t('celebrations.good');
    if (score >= 60) return i18n.t('practice.needsWork');
    return i18n.t('practice.keepPracticing');
  },
  
  // Get motivational message
  getMotivationalMessage: (): string => {
    const messages = [
      'celebrations.keepGoing',
      'celebrations.youCanDoIt',
      'celebrations.stayStrong',
      'celebrations.almostThere',
    ];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return i18n.t(messages[randomIndex]);
  },
  
  // Format lesson type with icon
  formatLessonType: (type: string): string => {
    const lessonKey = `lessons.${type}` as const;
    return i18n.t(lessonKey);
  },
  
  // Get error message with fallback
  getErrorMessage: (errorCode: string, fallback?: string): string => {
    const errorKey = `errors.${errorCode}`;
    const translated = i18n.t(errorKey);
    
    // If translation key not found, return fallback or generic message
    if (translated === errorKey) {
      return fallback || i18n.t('errors.somethingWentWrong');
    }
    
    return translated;
  },
};

// 🌐 Language switching utilities
export const languageUtils = {
  // Change language with persistence
  changeLanguage: async (language: SupportedLanguage) => {
    try {
      await i18n.changeLanguage(language);
      // Persist language choice (would integrate with AsyncStorage)
      // await AsyncStorage.setItem('userLanguage', language);
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  },
  
  // Get current language
  getCurrentLanguage: (): SupportedLanguage => {
    return i18n.language as SupportedLanguage;
  },
  
  // Get language name
  getLanguageName: (language: SupportedLanguage): string => {
    return SUPPORTED_LANGUAGES[language];
  },
  
  // Check if language is RTL (for future Arabic support)
  isRTL: (language?: SupportedLanguage): boolean => {
    const lng = language || languageUtils.getCurrentLanguage();
    return ['ar', 'he', 'fa'].includes(lng); // None currently supported
  },
  
  // Get language direction
  getDirection: (language?: SupportedLanguage): 'ltr' | 'rtl' => {
    return languageUtils.isRTL(language) ? 'rtl' : 'ltr';
  },
  
  // Format text for Chinese display
  formatChineseText: (text: string, showPinyin: boolean = false): string => {
    // This would integrate with a Chinese text processing library
    // For now, return the text as-is
    return text;
  },
  
  // Get appropriate font family for language
  getFontFamily: (language?: SupportedLanguage): string => {
    const lng = language || languageUtils.getCurrentLanguage();
    const fontMap: Record<SupportedLanguage, string> = {
      zh: 'System', // Would use Chinese-optimized font
      vi: 'System', // Would use Vietnamese-optimized font
      en: 'System', // Default system font
    };
    return fontMap[lng];
  },
};

// 🎯 Export language detector for device language
export const detectDeviceLanguage = getDeviceLanguage;

// 🚀 Export configured i18n instance
export default i18n; 