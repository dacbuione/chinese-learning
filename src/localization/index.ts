// 🌍 Localization System Exports
// Export i18n configuration
export { default as i18n } from './i18n.config';
export type { SupportedLanguage } from './i18n.config';
export { 
  SUPPORTED_LANGUAGES, 
  translationFeatures, 
  languageUtils,
  detectDeviceLanguage 
} from './i18n.config';

// Export providers
export { I18nProvider, useI18nContext } from './providers/I18nProvider';

// Export hooks
export { 
  useTranslation,
  useTypedTranslation,
  useLanguageSelection,
  useChineseTextFormatting,
  useLearningFeedback,
  default as useTranslationHook
} from './hooks/useTranslation';
export type { TFunction } from './hooks/useTranslation';

// Export translations (for type checking)
export { default as viTranslations } from './translations/vi';
export { default as enTranslations } from './translations/en';
export { default as zhTranslations } from './translations/zh'; 