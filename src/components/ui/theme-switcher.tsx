'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { ThemeName } from '@/lib/theme/theme-config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ThemeOption {
    name: ThemeName;
    label: string;
    gradient: string;
}

const themes: ThemeOption[] = [
    { name: 'neon-purple', label: 'Neon Pulse', gradient: 'from-purple-600 to-pink-500' },
    { name: 'ocean-blue', label: 'Ocean Deep', gradient: 'from-blue-600 to-cyan-500' },
    { name: 'sunset-orange', label: 'Sunset Glow', gradient: 'from-orange-600 to-red-500' },
    { name: 'forest-green', label: 'Forest Zen', gradient: 'from-emerald-600 to-green-500' },
    { name: 'light', label: 'Day Light', gradient: 'from-gray-200 to-white text-black border border-gray-300' },
];

export function ThemeSwitcher() {
    const { themeName, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative overflow-hidden group"
                title="Changer de thème"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Palette className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-56 z-50 rounded-xl overflow-hidden bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-xl"
                        >
                            <div className="p-2 space-y-1">
                                <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                    Thèmes & Ambiance
                                </div>
                                {themes.map((t) => (
                                    <button
                                        key={t.name}
                                        onClick={() => {
                                            setTheme(t.name);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200",
                                            themeName === t.name
                                                ? "bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                                : "hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full shadow-inner",
                                                t.name === 'light' ? 'bg-gradient-to-br from-gray-100 to-white border border-gray-300' : `bg-gradient-to-br ${t.gradient}`
                                            )} />
                                            <span className={cn(
                                                "text-sm font-medium",
                                                themeName === t.name ? "text-white" : "text-gray-400"
                                            )}>
                                                {t.label}
                                            </span>
                                        </div>
                                        {themeName === t.name && (
                                            <Check className="w-4 h-4 text-white" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
