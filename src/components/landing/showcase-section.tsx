'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const showcases = [
    {
        title: 'Analyses Visuelles Avancées',
        description: 'Explorez vos finances avec des graphiques interactifs qui révèlent vos tendances de dépenses.',
        image: '/landing/feature-charts.png',
        stats: ['Graphiques en temps réel', 'Comparaisons mensuelles', 'Catégorisation automatique'],
    },
    {
        title: 'Gestion des Abonnements',
        description: 'Centralisez tous vos abonnements et ne perdez plus jamais le contrôle de vos dépenses récurrentes.',
        image: '/landing/feature-subscriptions.png',
        stats: ['Rappels automatiques', 'Calcul des coûts annuels', 'Détection de doublons'],
    },
    {
        title: 'Assistant IA Personnel',
        description: 'Profitez de recommandations intelligentes pour optimiser votre budget et atteindre vos objectifs.',
        image: '/landing/feature-ai.png',
        stats: ['Conseils personnalisés', 'Détection d&apos;anomalies', 'Prévisions budgétaires'],
    },
];

function ShowcaseItem({ showcase, index }: { showcase: typeof showcases[0]; index: number }) {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    const isEven = index % 2 === 0;

    return (
        <motion.div
            key={index}
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}
        >
            {/* Content */}
            <div className={`${!isEven ? 'lg:order-2' : ''}`}>
                <motion.div
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="inline-block px-4 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 mb-4">
                        <span className="text-sm font-medium text-blue-300">
                            Fonctionnalité {index + 1}/3
                        </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {showcase.title}
                    </h3>

                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        {showcase.description}
                    </p>

                    <div className="space-y-3">
                        {showcase.stats.map((stat, statIndex) => (
                            <motion.div
                                key={statIndex}
                                initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                                animate={inView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.4, delay: 0.4 + statIndex * 0.1 }}
                                className="flex items-center gap-3 text-gray-300"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                                <span>{stat}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Image */}
            <motion.div
                initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`${!isEven ? 'lg:order-1' : ''}`}
            >
                <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>

                    {/* Image container */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-sm">
                        <Image
                            src={showcase.image}
                            alt={showcase.title}
                            width={800}
                            height={600}
                            className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function ShowcaseSection() {
    return (
        <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Découvrez Budget AI{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            en action
                        </span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Des outils puissants conçus pour simplifier votre gestion financière
                    </p>
                </motion.div>

                <div className="space-y-32">
                    {showcases.map((showcase, index) => (
                        <ShowcaseItem key={index} showcase={showcase} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
