import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n, { SupportedLanguage, detectDeviceLanguage } from '../i18n.config';

interface I18nContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('vi');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Detect device language or load saved preference
        const detectedLanguage = await detectDeviceLanguage();
        setCurrentLanguage(detectedLanguage);
        await i18n.changeLanguage(detectedLanguage);
      } catch (error) {
        console.warn('Failed to initialize language:', error);
        // Fallback to Vietnamese
        await i18n.changeLanguage('vi');
        setCurrentLanguage('vi');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const changeLanguage = async (language: SupportedLanguage) => {
    try {
      setIsLoading(true);
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      // Save preference to AsyncStorage if needed
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: I18nContextType = {
    currentLanguage,
    changeLanguage,
    isLoading,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18nContext = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  return context;
}; 