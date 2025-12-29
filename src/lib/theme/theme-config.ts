export type ThemeName = 'dark-neon' | 'light' | 'custom';

export interface ThemeColors {
    // Backgrounds
    bgGradient: string;
    bgSecondary: string;

    // Glass effect
    glassBackground: string;
    glassBackdrop: string;
    glassBorder: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;

    // Accents
    accentGradient: string;
    neonGreen: string;
    neonRed: string;
    neonBlue: string;
    neonPurple: string;
    neonCyan: string;

    // Chart colors
    chartBlue: string;
    chartPurple: string;
    chartCyan: string;
    chartGreen: string;
    chartOrange: string;
    chartPink: string;

    // Status
    success: string;
    warning: string;
    error: string;
    info: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
    'dark-neon': {
        // Backgrounds - Based on uploaded images
        bgGradient: 'from-slate-950 via-blue-950 to-purple-950',
        bgSecondary: 'from-blue-950/50 via-purple-950/50 to-slate-950/50',

        // Glass effect - Glassmorphism like in images
        glassBackground: 'bg-white/5',
        glassBackdrop: 'backdrop-blur-xl',
        glassBorder: 'border border-white/10',

        // Text
        textPrimary: 'text-white',
        textSecondary: 'text-gray-300',
        textTertiary: 'text-gray-400',

        // Accents
        accentGradient: 'from-blue-500 via-purple-500 to-cyan-500',
        neonGreen: '#4ade80',
        neonRed: '#f87171',
        neonBlue: '#60a5fa',
        neonPurple: '#a78bfa',
        neonCyan: '#22d3ee',

        // Chart colors - Vibrant like in images
        chartBlue: '#3b82f6',
        chartPurple: '#8b5cf6',
        chartCyan: '#06b6d4',
        chartGreen: '#10b981',
        chartOrange: '#f97316',
        chartPink: '#ec4899',

        // Status
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#22d3ee',
    },

    'light': {
        // Light mode variant
        bgGradient: 'from-gray-50 via-blue-50 to-purple-50',
        bgSecondary: 'from-white via-blue-50/30 to-purple-50/30',

        glassBackground: 'bg-white/80',
        glassBackdrop: 'backdrop-blur-md',
        glassBorder: 'border border-gray-200',

        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-700',
        textTertiary: 'text-gray-500',

        accentGradient: 'from-blue-600 via-purple-600 to-cyan-600',
        neonGreen: '#22c55e',
        neonRed: '#ef4444',
        neonBlue: '#3b82f6',
        neonPurple: '#8b5cf6',
        neonCyan: '#0ea5e9',

        chartBlue: '#2563eb',
        chartPurple: '#7c3aed',
        chartCyan: '#0891b2',
        chartGreen: '#059669',
        chartOrange: '#ea580c',
        chartPink: '#db2777',

        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#0ea5e9',
    },

    'custom': {
        // Will be overridden by user preferences
        bgGradient: 'from-slate-950 via-blue-950 to-purple-950',
        bgSecondary: 'from-blue-950/50 via-purple-950/50 to-slate-950/50',
        glassBackground: 'bg-white/5',
        glassBackdrop: 'backdrop-blur-xl',
        glassBorder: 'border border-white/10',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-300',
        textTertiary: 'text-gray-400',
        accentGradient: 'from-blue-500 via-purple-500 to-cyan-500',
        neonGreen: '#4ade80',
        neonRed: '#f87171',
        neonBlue: '#60a5fa',
        neonPurple: '#a78bfa',
        neonCyan: '#22d3ee',
        chartBlue: '#3b82f6',
        chartPurple: '#8b5cf6',
        chartCyan: '#06b6d4',
        chartGreen: '#10b981',
        chartOrange: '#f97316',
        chartPink: '#ec4899',
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#22d3ee',
    },
};

export function getTheme(themeName: ThemeName): ThemeColors {
    return themes[themeName];
}
