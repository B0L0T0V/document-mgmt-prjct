import React, { createContext, useState, useContext, useEffect } from 'react';
import translations from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ru');
  
  // Load language from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Set Russian as the default language
      localStorage.setItem('language', 'ru');
    }
  }, []);
  
  // Function to change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };
  
  // Translation function
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