import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DiwaliThemeContextType {
  isDiwaliTheme: boolean;
  toggleDiwaliTheme: (enabled: boolean) => void;
  themeIntensity: 'subtle' | 'moderate' | 'full';
  setThemeIntensity: (intensity: 'subtle' | 'moderate' | 'full') => void;
}

const DiwaliThemeContext = createContext<DiwaliThemeContextType | undefined>(undefined);

export const useDiwaliTheme = () => {
  const context = useContext(DiwaliThemeContext);
  if (!context) {
    throw new Error('useDiwaliTheme must be used within DiwaliThemeProvider');
  }
  return context;
};

interface DiwaliThemeProviderProps {
  children: ReactNode;
}

export const DiwaliThemeProvider: React.FC<DiwaliThemeProviderProps> = ({ children }) => {
  const [isDiwaliTheme, setIsDiwaliTheme] = useState(() => {
    const saved = localStorage.getItem('diwaliTheme');
    return saved ? JSON.parse(saved) : false;
  });

  const [themeIntensity, setThemeIntensity] = useState<'subtle' | 'moderate' | 'full'>(() => {
    const saved = localStorage.getItem('diwaliThemeIntensity');
    return (saved as 'subtle' | 'moderate' | 'full') || 'moderate';
  });

  useEffect(() => {
    localStorage.setItem('diwaliTheme', JSON.stringify(isDiwaliTheme));
    
    if (isDiwaliTheme) {
      document.documentElement.classList.add('diwali-theme');
      document.documentElement.setAttribute('data-diwali-intensity', themeIntensity);
    } else {
      document.documentElement.classList.remove('diwali-theme');
      document.documentElement.removeAttribute('data-diwali-intensity');
    }
  }, [isDiwaliTheme, themeIntensity]);

  useEffect(() => {
    localStorage.setItem('diwaliThemeIntensity', themeIntensity);
  }, [themeIntensity]);

  const toggleDiwaliTheme = (enabled: boolean) => {
    setIsDiwaliTheme(enabled);
  };

  return (
    <DiwaliThemeContext.Provider
      value={{
        isDiwaliTheme,
        toggleDiwaliTheme,
        themeIntensity,
        setThemeIntensity,
      }}
    >
      {children}
    </DiwaliThemeContext.Provider>
  );
};
