import React, { createContext, useContext, useState, useCallback } from 'react';
import { visualConfig, VisualConfig } from '../config/visual-config';

interface ThemeContextType {
  config: VisualConfig;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  effectIntensity: 'low' | 'medium' | 'high';
  setEffectIntensity: (intensity: 'low' | 'medium' | 'high') => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  cursorTrailEnabled: boolean;
  setCursorTrailEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [effectIntensity, setEffectIntensity] = useState<'low' | 'medium' | 'high'>('high');
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [cursorTrailEnabled, setCursorTrailEnabled] = useState(visualConfig.cursorTrail.enabled);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
    // Save to localStorage
    typeof window !== 'undefined' && localStorage.setItem('darkMode', JSON.stringify(!isDarkMode));
  }, [isDarkMode]);

  const updateEffectIntensity = useCallback((intensity: 'low' | 'medium' | 'high') => {
    setEffectIntensity(intensity);
    typeof window !== 'undefined' && localStorage.setItem('effectIntensity', intensity);
  }, []);

  const updateAnimationSpeed = useCallback((speed: 'slow' | 'normal' | 'fast') => {
    setAnimationSpeed(speed);
    typeof window !== 'undefined' && localStorage.setItem('animationSpeed', speed);
  }, []);

  const updateCursorTrail = useCallback((enabled: boolean) => {
    setCursorTrailEnabled(enabled);
    typeof window !== 'undefined' && localStorage.setItem('cursorTrailEnabled', JSON.stringify(enabled));
  }, []);

  // Load from localStorage on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedDarkMode = localStorage.getItem('darkMode');
    const savedIntensity = localStorage.getItem('effectIntensity');
    const savedSpeed = localStorage.getItem('animationSpeed');
    const savedCursorTrail = localStorage.getItem('cursorTrailEnabled');

    if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));
    if (savedIntensity) setEffectIntensity(savedIntensity as any);
    if (savedSpeed) setAnimationSpeed(savedSpeed as any);
    if (savedCursorTrail) setCursorTrailEnabled(JSON.parse(savedCursorTrail));
  }, []);

  // Apply theme to document
  React.useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  const value: ThemeContextType = {
    config: visualConfig,
    isDarkMode,
    toggleDarkMode,
    effectIntensity,
    setEffectIntensity: updateEffectIntensity,
    animationSpeed,
    setAnimationSpeed: updateAnimationSpeed,
    cursorTrailEnabled,
    setCursorTrailEnabled: updateCursorTrail,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { ThemeContext };
