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
    const enabled = saved ? JSON.parse(saved) : true;
    console.log('🎊 Diwali Theme Initialized:', enabled);
    return enabled;
  });

  const [themeIntensity, setThemeIntensity] = useState<'subtle' | 'moderate' | 'full'>(() => {
    const saved = localStorage.getItem('diwaliThemeIntensity');
    const intensity = (saved as 'subtle' | 'moderate' | 'full') || 'full';
    console.log('🎊 Diwali Intensity:', intensity);
    return intensity;
  });

  useEffect(() => {
    localStorage.setItem('diwaliTheme', JSON.stringify(isDiwaliTheme));
    
    console.log('🎊 Applying Diwali Theme:', isDiwaliTheme, 'Intensity:', themeIntensity);
    
    if (isDiwaliTheme) {
      document.documentElement.classList.add('diwali-theme');
      document.documentElement.setAttribute('data-diwali-intensity', themeIntensity);
      console.log('✅ Diwali theme class added to HTML');
    } else {
      document.documentElement.classList.remove('diwali-theme');
      document.documentElement.removeAttribute('data-diwali-intensity');
      console.log('❌ Diwali theme class removed from HTML');
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
