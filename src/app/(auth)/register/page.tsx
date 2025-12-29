'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation locale basique
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // Regex additionnelles (doivent matcher avec le backend)
    if (!/[A-Z]/.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins une majuscule');
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins une minuscule');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins un chiffre');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Gérer les erreurs de validation formattées par Zod
        if (data.error && typeof data.error === 'object' && data.error.fieldErrors) {
          const firstFieldError = Object.values(data.error.fieldErrors).flat()[0];
          throw new Error(firstFieldError as string || 'Données invalides');
        }
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // Succès !
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center p-4',
      'bg-gradient-to-br',
      theme.bgGradient
    )}>
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className={cn(theme.textPrimary, 'text-4xl font-bold mb-2 tracking-tight')}>
            Budget AI
          </h1>
          <p className={theme.textSecondary}>
            Commencez à gérer votre budget intelligemment
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard variant="elevated" className="border-white/10">
            <h2 className={cn(theme.textPrimary, 'text-2xl font-bold mb-6')}>
              Créer un compte
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={cn(theme.textSecondary, 'block text-sm font-medium mb-2')}>
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                  placeholder="Jean Dupont"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                    'transition-all duration-300'
                  )}
                />
              </div>

              <div>
                <label className={cn(theme.textSecondary, 'block text-sm font-medium mb-2')}>
                  Adresse email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                  placeholder="votre@email.com"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                    'transition-all duration-300'
                  )}
                />
              </div>

              <div>
                <label className={cn(theme.textSecondary, 'block text-sm font-medium mb-2')}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                    'transition-all duration-300'
                  )}
                />
                <p className="text-[10px] text-gray-500 mt-2 flex gap-2">
                  <span>● 8+ caractères</span>
                  <span>● Majuscule</span>
                  <span>● Chiffre</span>
                </p>
              </div>

              <div>
                <label className={cn(theme.textSecondary, 'block text-sm font-medium mb-2')}>
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                    'transition-all duration-300'
                  )}
                />
              </div>

              <NeonButton
                type="submit"
                disabled={isLoading}
                className="w-full mt-4"
                variant="primary"
              >
                {isLoading ? 'Création en cours...' : 'Créer mon compte'}
              </NeonButton>

              <div className="pt-4 text-center">
                <p className={cn(theme.textSecondary, 'text-sm')}>
                  Déjà membre ?{' '}
                  <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                    Se connecter
                  </a>
                </p>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
