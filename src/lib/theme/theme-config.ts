export type ThemeName = 'neon-purple' | 'ocean-blue' | 'sunset-orange' | 'forest-green' | 'light' | 'custom';
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
    'neon-purple': {
        bgGradient: 'from-slate-950 via-purple-950 to-slate-900',
        bgSecondary: 'from-purple-950/40 via-purple-900/20 to-slate-950/40',
        glassBackground: 'bg-indigo-950/20', // Plus teinté violet
        glassBackdrop: 'backdrop-blur-xl',
        glassBorder: 'border border-indigo-500/20', // Bordure violette subtile

        textPrimary: 'text-white',
        textSecondary: 'text-purple-200/70',
        textTertiary: 'text-purple-300/40',

        accentGradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
        neonGreen: '#4ade80',
        neonRed: '#f472b6', // Pinkish red
        neonBlue: '#8b5cf6', // Violet
        neonPurple: '#d946ef', // Fuchsia
        neonCyan: '#e879f9', // Light purple

        chartBlue: '#8b5cf6',
        chartPurple: '#d946ef',
        chartCyan: '#c026d3',
        chartGreen: '#4ade80',
        chartOrange: '#f472b6',
        chartPink: '#db2777',

        success: '#4ade80',
        warning: '#facc15',
        error: '#f87171',
        info: '#c084fc',
    },

    'ocean-blue': {
        bgGradient: 'from-slate-950 via-blue-950 to-slate-900',
        bgSecondary: 'from-blue-950/40 via-cyan-900/20 to-slate-950/40',
        glassBackground: 'bg-cyan-950/20',
        glassBackdrop: 'backdrop-blur-xl',
        glassBorder: 'border border-cyan-500/20',

        textPrimary: 'text-white',
        textSecondary: 'text-cyan-100/70',
        textTertiary: 'text-cyan-200/40',

        accentGradient: 'from-cyan-500 via-blue-500 to-indigo-500',
        neonGreen: '#2dd4bf', // Teal
        neonRed: '#f87171',
        neonBlue: '#3b82f6',
        neonPurple: '#6366f1',
        neonCyan: '#06b6d4',

        chartBlue: '#3b82f6',
        chartPurple: '#6366f1',
        chartCyan: '#06b6d4',
        chartGreen: '#2dd4bf',
        chartOrange: '#f59e0b',
        chartPink: '#ec4899',

        success: '#2dd4bf',
        warning: '#facc15',
        error: '#f87171',
        info: '#60a5fa',
    },

    'sunset-orange': {
        bgGradient: 'from-slate-950 via-orange-950/50 to-red-950/30',
        bgSecondary: 'from-orange-950/30 via-red-950/20 to-slate-950/40',
        glassBackground: 'bg-orange-950/10',
        glassBackdrop: 'backdrop-blur-xl',
        glassBorder: 'border border-orange-500/20',

        textPrimary: 'text-white',
        textSecondary: 'text-orange-100/70',
        textTertiary: 'text-orange-200/40',

        accentGradient: 'from-orange-500 via-red-500 to-pink-500',
        neonGreen: '#84cc16', // Lime
        neonRed: '#ef4444',
        neonBlue: '#3b82f6',
        neonPurple: '#c026d3',
        neonCyan: '#f97316',

        chartBlue: '#3b82f6',
        chartPurple: '#c026d3',
        chartCyan: '#06b6d4',
        chartGreen: '#84cc16',
        chartOrange: '#f97316',
        chartPink: '#db2777',

        success: '#84cc16',
        warning: '#fbbf24',
        error: '#ef4444',
        info: '#f97316',
    },

    'forest-green': {
        bgGradient: 'from-slate-950 via-emerald-950 to-slate-900',
        bgSecondary: 'from-emerald-950/40 via-green-900/20 to-slate-950/40',
        glassBackground: 'bg-emerald-950/20',
        glassBackdrop: 'backdrop-blur-xl',
        glassBorder: 'border border-emerald-500/20',

        textPrimary: 'text-white',
        textSecondary: 'text-emerald-100/70',
        textTertiary: 'text-emerald-200/40',

        accentGradient: 'from-emerald-500 via-green-500 to-teal-500',
        neonGreen: '#10b981',
        neonRed: '#f87171',
        neonBlue: '#3b82f6',
        neonPurple: '#8b5cf6',
        neonCyan: '#14b8a6',

        chartBlue: '#3b82f6',
        chartPurple: '#8b5cf6',
        chartCyan: '#14b8a6',
        chartGreen: '#10b981',
        chartOrange: '#f59e0b',
        chartPink: '#ec4899',

        success: '#10b981',
        warning: '#facc15',
        error: '#f87171',
        info: '#14b8a6',
    },

    'light': {
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
        // Will be overridden
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
