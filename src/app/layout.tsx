import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DemoBanner } from '@/components/layout/demo-banner';

export const metadata: Metadata = {
  title: 'Budget AI - Gestion Budgétaire Intelligente | Projet Portfolio',
  description: 'Application de gestion budgétaire avec IA. Projet portfolio démontrant Next.js 14, TypeScript, Prisma, et intégration IA.',
  keywords: ['budget', 'finance', 'IA', 'Next.js', 'portfolio', 'TypeScript'],
  authors: [{ name: 'Votre Nom' }],
  openGraph: {
    title: 'Budget AI - Portfolio Project',
    description: 'Gestion budgétaire intelligente avec IA',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return (
    <html lang="fr">
      <body>
        {isProduction && <DemoBanner />}
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
