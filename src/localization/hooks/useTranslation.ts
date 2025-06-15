import { useTranslation as useI18nTranslation, UseTranslationOptions } from 'react-i18next';
import { useMemo } from 'react';

import { 
  translationFeatures, 
  languageUtils, 
  SupportedLanguage,
  SUPPORTED_LANGUAGES 
} from '../i18n.config';
import type { vi } from '../translations/vi';

// 🎯 Type for translation keys (derived from Vietnamese translations)
type TranslationKeys = typeof vi;
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TFunction = (key: NestedKeyOf<TranslationKeys>, options?: any) => string;

// 🌟 Enhanced useTranslation hook for Chinese Learning App
export const useTranslation = (
  namespace?: string,
  options?: UseTranslationOptions<string>
) => {
  const { t: i18nT, i18n, ready } = useI18nTranslation(namespace, options);
  
  // 🎨 Enhanced translation function with type safety
  const t: TFunction = useMemo(() => {
    return (key: NestedKeyOf<TranslationKeys>, options?: any) => {
      try {
        const result = i18nT(key as string, options);
        return typeof result === 'string' ? result : key as string;
      } catch (error) {
        console.warn(`Translation error for key: ${key}`, error);
        return key as string;
      }
    };
  }, [i18nT]);
  
  // 🚀 Chinese Learning App specific utilities
  const utilities = useMemo(() => ({
    // 🎯 HSK Level formatting
    formatHSKLevel: (level: number) => translationFeatures.formatHSKLevel(level),
    
    // 🎵 Tone formatting
    formatTone: (tone: number) => translationFeatures.formatTone(tone),
    
    // ✍️ Stroke count formatting
    formatStrokeCount: (count: number) => translationFeatures.formatStrokeCount(count),
    
    // 📊 Accuracy formatting
    formatAccuracy: (percentage: number) => translationFeatures.formatAccuracy(percentage),
    
    // 🔥 Streak formatting
    formatStreak: (days: number) => translationFeatures.formatStreak(days),
    
    // 📚 Lesson progress formatting
    formatLessonProgress: (current: number, total: number) => 
      translationFeatures.formatLessonProgress(current, total),
    
    // 🎉 Celebration messages
    getCelebrationMessage: (score: number) => translationFeatures.getCelebrationMessage(score),
    
    // 💪 Motivational messages
    getMotivationalMessage: () => translationFeatures.getMotivationalMessage(),
    
    // 📖 Lesson type formatting
    formatLessonType: (type: string) => translationFeatures.formatLessonType(type),
    
    // ⚠️ Error messages with fallback
    getErrorMessage: (errorCode: string, fallback?: string) => 
      translationFeatures.getErrorMessage(errorCode, fallback),
    
    // 🌍 Language utilities
    getCurrentLanguage: () => languageUtils.getCurrentLanguage(),
    getLanguageName: (language: SupportedLanguage) => languageUtils.getLanguageName(language),
    changeLanguage: (language: SupportedLanguage) => languageUtils.changeLanguage(language),
    isRTL: () => languageUtils.isRTL(),
    getDirection: () => languageUtils.getDirection(),
    getFontFamily: () => languageUtils.getFontFamily(),
    
    // 🎨 Text formatting for Chinese
    formatChineseText: (text: string, showPinyin: boolean = false) =>
      languageUtils.formatChineseText(text, showPinyin),
  }), []);
  
  return {
    // Core translation function
    t,
    
    // Language utilities
    ...utilities,
    
    // Original i18next utilities
    i18n,
    ready,
    
    // Current language info
    language: i18n.language as SupportedLanguage,
    languages: SUPPORTED_LANGUAGES,
    
    // Quick access to common translations
    common: {
      loading: t('common.loading'),
      save: t('common.save'),
      cancel: t('common.cancel'),
      continue: t('common.continue'),
      retry: t('common.retry'),
      start: t('common.start'),
      finish: t('common.finish'),
      next: t('common.next'),
      previous: t('common.previous'),
      skip: t('common.skip'),
      done: t('common.done'),
      ok: t('common.ok'),
      yes: t('common.yes'),
      no: t('common.no'),
      close: t('common.close'),
    },
    
    // Quick access to learning translations
    learning: {
      vocabulary: t('lessons.vocabulary'),
      grammar: t('lessons.grammar'),
      pronunciation: t('lessons.pronunciation'),
      writing: t('lessons.writing'),
      listening: t('lessons.listening'),
      reading: t('lessons.reading'),
      conversation: t('lessons.conversation'),
      culture: t('lessons.culture'),
    },
    
    // Quick access to Chinese specific translations
    chinese: {
      simplified: t('chinese.simplified'),
      traditional: t('chinese.traditional'),
      pinyin: t('chinese.pinyin'),
      character: t('chinese.character'),
      characters: t('chinese.characters'),
      tones: t('chinese.tones'),
      strokes: t('chinese.strokes'),
      strokeOrder: t('chinese.strokeOrder'),
      radical: t('chinese.radical'),
      radicals: t('chinese.radicals'),
    },
    
    // Quick access to audio translations
    audio: {
      play: t('audio.play'),
      pause: t('audio.pause'),
      stop: t('audio.stop'),
      replay: t('audio.replay'),
      record: t('audio.record'),
      stopRecording: t('audio.stopRecording'),
      slow: t('audio.slow'),
      normal: t('audio.normal'),
      fast: t('audio.fast'),
    },
    
    // Quick access to practice translations
    practice: {
      correct: t('practice.correct'),
      incorrect: t('practice.incorrect'),
      tryAgain: t('practice.tryAgain'),
      showAnswer: t('practice.showAnswer'),
      nextQuestion: t('practice.nextQuestion'),
      excellent: t('practice.excellent'),
      veryGood: t('practice.veryGood'),
      good: t('practice.good'),
      keepPracticing: t('practice.keepPracticing'),
    },
    
    // Quick access to celebration translations
    celebrations: {
      congratulations: t('celebrations.congratulations'),
      wellDone: t('celebrations.wellDone'),
      excellent: t('celebrations.excellent'),
      amazing: t('celebrations.amazing'),
      fantastic: t('celebrations.fantastic'),
      awesome: t('celebrations.awesome'),
      keepGoing: t('celebrations.keepGoing'),
      almostThere: t('celebrations.almostThere'),
      youCanDoIt: t('celebrations.youCanDoIt'),
    },
  };
};

// 🎯 Type-safe translation hook with specific key paths
export const useTypedTranslation = <T extends NestedKeyOf<TranslationKeys>>(
  keyPath: T,
  options?: any
) => {
  const { t } = useTranslation();
  
  return useMemo(() => {
    return t(keyPath, options);
  }, [t, keyPath, options]);
};

// 🌍 Language selection hook
export const useLanguageSelection = () => {
  const { changeLanguage, getCurrentLanguage, getLanguageName } = useTranslation();
  
  const availableLanguages = useMemo(() => {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
      code: code as SupportedLanguage,
      name,
      isSelected: getCurrentLanguage() === code,
    }));
  }, [getCurrentLanguage]);
  
  const selectLanguage = async (language: SupportedLanguage) => {
    try {
      const success = await changeLanguage(language);
      return success;
    } catch (error) {
      console.error('Error changing language:', error);
      return false;
    }
  };
  
  return {
    availableLanguages,
    currentLanguage: getCurrentLanguage(),
    currentLanguageName: getLanguageName(getCurrentLanguage()),
    selectLanguage,
  };
};

// 🎨 Chinese text formatting hook
export const useChineseTextFormatting = () => {
  const { formatChineseText, getFontFamily, getDirection } = useTranslation();
  
  return {
    formatText: formatChineseText,
    fontFamily: getFontFamily(),
    direction: getDirection(),
    
    // Helper for character display
    getCharacterStyle: (size: 'small' | 'medium' | 'large' | 'display' = 'medium') => {
      const sizes = {
        small: 24,
        medium: 48,
        large: 64,
        display: 96,
      };
      
      return {
        fontFamily: getFontFamily(),
        fontSize: sizes[size],
        textAlign: 'center' as const,
        direction: getDirection(),
      };
    },
    
    // Helper for pinyin display
    getPinyinStyle: () => ({
      fontFamily: getFontFamily(),
      fontSize: 18,
      fontStyle: 'italic' as const,
      textAlign: 'center' as const,
    }),
  };
};

// 🎮 Learning feedback hook
export const useLearningFeedback = () => {
  const { 
    getCelebrationMessage, 
    getMotivationalMessage, 
    getErrorMessage,
    practice,
    celebrations,
  } = useTranslation();
  
  return {
    // Score-based feedback
    getScoreFeedback: (score: number) => ({
      message: getCelebrationMessage(score),
      isPositive: score >= 70,
      isExcellent: score >= 90,
    }),
    
    // Random motivational message
    getRandomMotivation: () => getMotivationalMessage(),
    
    // Error feedback
    getErrorFeedback: (errorCode: string, fallback?: string) => 
      getErrorMessage(errorCode, fallback),
    
    // Quick feedback messages
    feedback: {
      correct: practice.correct,
      incorrect: practice.incorrect,
      excellent: practice.excellent,
      tryAgain: practice.tryAgain,
      keepGoing: celebrations.keepGoing,
      wellDone: celebrations.wellDone,
    },
  };
};

export default useTranslation; 