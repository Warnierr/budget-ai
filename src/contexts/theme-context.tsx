'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeName, ThemeColors, getTheme } from '@/lib/theme/theme-config';

interface ThemeContextType {
    themeName: ThemeName;
    theme: ThemeColors;
    setTheme: (themeName: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeName, setThemeName] = useState<ThemeName>('dark-neon');
    const [theme, setThemeState] = useState<ThemeColors>(getTheme('dark-neon'));

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('budget-ai-theme') as ThemeName;
        if (savedTheme && ['dark-neon', 'light', 'custom'].includes(savedTheme)) {
            setThemeName(savedTheme);
            setThemeState(getTheme(savedTheme));
        }
    }, []);

    const setTheme = (newThemeName: ThemeName) => {
        setThemeName(newThemeName);
        setThemeState(getTheme(newThemeName));
        localStorage.setItem('budget-ai-theme', newThemeName);
    };

    return (
        <ThemeContext.Provider value={{ themeName, theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
