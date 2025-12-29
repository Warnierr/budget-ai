'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientAvatar } from '@/components/ui/gradient-avatar';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

interface PrivacyInfo {
    level: string;
    sharedCategories: string[];
}

interface Message {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
    privacyInfo?: PrivacyInfo;
}

export function ChatInterface() {
    const { theme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Bonjour ! Je suis votre assistant Budget AI. Basé sur votre activité récente, j\'ai identifié plusieurs opportunités pour optimiser vos finances. Comment puis-je vous aider aujourd\'hui ?',
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    conversationHistory: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erreur lors de la communication avec l\'IA');
            }

            // Vérifier les infos de transparence
            const privacyHeader = response.headers.get('X-Privacy-Info');
            let privacyInfo: PrivacyInfo | undefined;
            if (privacyHeader) {
                try {
                    privacyInfo = JSON.parse(privacyHeader);
                } catch (e) {
                    console.error("Error parsing privacy header", e);
                }
            }

            // Préparer le message de l'assistant (vide au début)
            const assistantMsgId = (Date.now() + 1).toString();
            const assistantMsg: Message = {
                id: assistantMsgId,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                privacyInfo
            };
            setMessages(prev => [...prev, assistantMsg]);

            // Lire le flux
            if (!response.body) throw new Error("No response body");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });

                if (chunkValue) {
                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantMsgId
                            ? { ...msg, content: msg.content + chunkValue }
                            : msg
                    ));
                }
            }

        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: error instanceof Error
                    ? `Désolé, j'ai rencontré une erreur : ${error.message}`
                    : "Désolé, je rencontre des difficultés techniques.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px]">
            {/* Messages area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto pr-4 mb-4 scrollbar-thin scrollbar-thumb-white/10"
            >
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                                'flex mb-6',
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div className={cn(
                                'flex max-w-[80%]',
                                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                            )}>
                                {msg.role === 'assistant' && (
                                    <GradientAvatar
                                        size="sm"
                                        pulse={isTyping}
                                        className="mr-3 mt-1 flex-shrink-0"
                                    />
                                )}

                                <div>
                                    <div className={cn(
                                        'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                                        msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                                            : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-md'
                                    )}>
                                        {msg.content}
                                    </div>
                                    <div className={cn(
                                        'text-[10px] opacity-40 mt-1',
                                        msg.role === 'user' ? 'text-right' : 'text-left'
                                    )}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.privacyInfo && (
                                            <span className="block mt-1 text-cyan-400/80 font-medium" title={`Catégories partagées: ${msg.privacyInfo.sharedCategories.join(', ')}`}>
                                                🛡️ Données analysées
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start mb-6"
                        >
                            <div className="flex items-center bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none border border-white/10">
                                <div className="flex gap-1">
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input area */}
            <GlassCard variant="compact" className="border-white/20 p-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Posez une question sur votre budget..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm px-3 placeholder:text-gray-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={cn(
                            'p-2 rounded-xl transition-all duration-300',
                            input.trim()
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                : 'bg-white/5 text-gray-600'
                        )}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </GlassCard>
        </div>
    );
}
