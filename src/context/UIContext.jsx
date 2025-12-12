
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../constants/translations';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  
  // Language State
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'nl');

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null 
  });

  // Effect: Apply Theme to HTML
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effect: Persist Language
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Actions
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const switchLanguage = (lang) => setLanguage(lang);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Toast Logic
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Confirm Dialog Logic
  const confirm = (title, message) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  return (
    <UIContext.Provider value={{ 
      theme, 
      toggleTheme, 
      language, 
      switchLanguage, 
      t, 
      toasts, 
      showToast, 
      removeToast, 
      confirmDialog, 
      confirm 
    }}>
      {children}
    </UIContext.Provider>
  );
};
