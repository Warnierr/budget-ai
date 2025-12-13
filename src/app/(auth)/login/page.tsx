'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setError('');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Utiliser NextAuth signIn pour créer une vraie session
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false, // On gère la redirection nous-mêmes
      });

      if (result?.error) {
        console.error('Erreur de connexion:', result.error);
        setError('Email ou mot de passe incorrect');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        console.log('✅ Connexion réussie via NextAuth!');
        // Rediriger vers le dashboard
        router.push('/dashboard');
        router.refresh(); // Forcer le refresh pour mettre à jour la session
      }
    } catch (error) {
      console.error('Erreur exception:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Budget AI</h1>
          <p className="text-gray-600 mt-2">Gérez votre budget intelligemment</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">Connexion</h2>
          <p className="text-gray-600 mb-6">Connectez-vous à votre compte</p>
          
          {searchParams.get('registered') === 'true' && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">
              ✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
              ❌ {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? '🔄 Connexion en cours...' : 'Se connecter'}
            </button>

            <p className="text-sm text-center text-gray-600 mt-4">
              Pas encore de compte ?{' '}
              <a href="/register" className="text-blue-600 hover:underline">
                Créer un compte
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
          <div className="text-center text-gray-600">Chargement de la page de connexion...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
