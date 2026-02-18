import { useState, useEffect } from 'react';
import { Language, translations, Translations } from './translations';

const LANGUAGE_KEY = 'poker-dealer-language';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return (saved === 'en' || saved === 'es' ? saved : 'en') as Language;
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const t: Translations = translations[language];

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
  };

  return { t, language, setLanguage, toggleLanguage };
};
