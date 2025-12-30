'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const features = [
    {
        icon: '📊',
        title: 'Dashboard Complet',
        description: 'Visualisez votre situation financière en un coup d\'œil avec des graphiques interactifs et des indicateurs clés.',
    },
    {
        icon: '💰',
        title: 'Suivi des Revenus',
        description: 'Gérez vos revenus récurrents et ponctuels pour une vision précise de vos entrées d\'argent.',
    },
    {
        icon: '💳',
        title: 'Gestion des Dépenses',
        description: 'Catégorisez et suivez toutes vos dépenses pour identifier où va votre argent.',
    },
    {
        icon: '🔄',
        title: 'Abonnements Centralisés',
        description: 'Centralisez tous vos abonnements (Netflix, Spotify, etc.) et ne manquez plus jamais un paiement.',
    },
    {
        icon: '🤖',
        title: 'Intelligence Artificielle',
        description: 'Obtenez des conseils personnalisés et des recommandations pour optimiser votre budget.',
    },
    {
        icon: '📅',
        title: 'Projections Futures',
        description: 'Anticipez votre situation financière avec des prévisions basées sur vos habitudes.',
    },
    {
        icon: '📈',
        title: 'Analyses Détaillées',
        description: 'Explorez vos données avec des graphiques avancés et des statistiques précises.',
    },
    {
        icon: '🎯',
        title: 'Objectifs Financiers',
        description: 'Définissez et suivez vos objectifs d\'épargne avec des outils de planification intelligents.',
    },
    {
        icon: '🔒',
        title: 'Sécurité RGPD',
        description: 'Vos données sont chiffrées et sécurisées. Conformité RGPD totale garantie.',
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
};

export function FeaturesSection() {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Tout ce dont vous avez besoin pour{' '}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            gérer votre budget
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Une suite complète d&apos;outils pour prendre le contrôle de vos finances personnelles
                    </p>
                </motion.div>

                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                        >
                            {/* Gradient background on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative z-10">
                                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-center mt-16"
                >
                    <p className="text-gray-600 mb-4">Et bien plus encore à découvrir...</p>
                    <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold shadow-lg">
                        ✨ 100% Gratuit, 100% Sécurisé
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
