import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from '../translations';

// --- Контекст языка ---
// Обеспечивает хранение и смену языка интерфейса, а также функцию перевода
const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ru');
  
  // --- Загрузка языка из localStorage при инициализации ---
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Set Russian as the default language
      localStorage.setItem('language', 'ru');
    }
  }, []);
  
  // --- Функция смены языка ---
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };
  
  // --- Функция перевода по ключу ---
  const t = (key) => {
    if (!translations[language]) return translations.ru[key] || key;
    return translations[language][key] || translations.ru[key] || key;
  };
  
  const contextValue = {
    language,
    changeLanguage,
    t
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 