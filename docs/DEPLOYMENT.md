# 🚀 Guide de Déploiement - Budget AI

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Choix des Services](#choix-des-services)
4. [Configuration Base de Données](#configuration-base-de-données)
5. [Configuration Vercel](#configuration-vercel)
6. [Variables d'Environnement](#variables-denvironnement)
7. [Déploiement](#déploiement)
8. [Vérifications Post-Déploiement](#vérifications-post-déploiement)
9. [Optimisations](#optimisations)
10. [Monitoring](#monitoring)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

### Architecture de Déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend + API)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js App │  │  API Routes  │  │  Edge Cache  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
┌──────────────────────┐   ┌──────────────────────┐
│  NEON PostgreSQL     │   │  OPENROUTER API      │
│  (Base de données)   │   │  (Intelligence IA)   │
└──────────────────────┘   └──────────────────────┘
```

### Services Utilisés (100% Gratuit pour Portfolio)

| Service | Utilité | Plan Gratuit | Limites |
|---------|---------|--------------|---------|
| **Vercel** | Hébergement Frontend + API | ✅ Oui | Bande passante 100GB/mois |
| **Neon** | Base de données PostgreSQL | ✅ Oui | 512MB stockage, 1 projet |
| **OpenRouter** | API IA (Claude/GPT) | 💳 Pay-as-you-go | ~5$ de crédit offert |
| **GitHub** | Code source et CI/CD | ✅ Oui | Repos publics illimités |

**Coût total mensuel estimé** : **0-5€** (uniquement API IA si utilisée)

---

## ✅ Prérequis

### 1. Comptes à Créer

- [ ] Compte GitHub (si pas déjà fait)
- [ ] Compte Vercel (connexion avec GitHub)
- [ ] Compte Neon Database
- [ ] Compte OpenRouter (pour l'IA)

### 2. Outils Locaux

```bash
# Vérifier Node.js (version 18+)
node --version  # Doit afficher v18.x.x ou plus

# Vérifier npm
npm --version

# Installer Vercel CLI (optionnel mais recommandé)
npm install -g vercel
```

### 3. Code Prêt

```bash
# Vérifier que le projet compile
npm run build

# Vérifier qu'il n'y a pas d'erreurs critiques
npm run lint
```

---

## 🏢 Choix des Services (Détails)

### Pourquoi Vercel ?

✅ **Avantages** :
- Déploiement automatique depuis GitHub (push = deploy)
- Optimisé pour Next.js (c'est leur framework !)
- SSL automatique (HTTPS)
- CDN mondial (site rapide partout)
- Preview deployments (chaque PR a son URL de test)
- **100% gratuit pour usage personnel/portfolio**

❌ **Limites** :
- 100GB bande passante/mois (largement suffisant pour portfolio)
- Pas de backend long-running (mais on n'en a pas besoin)

**Alternatives** :
- Netlify (similaire, un peu moins Next.js-friendly)
- Railway (plus flexible, mais plus complexe)
- Cloudflare Pages (bon, mais moins de features Next.js)

### Pourquoi Neon PostgreSQL ?

✅ **Avantages** :
- PostgreSQL complet (compatible Prisma)
- Serverless (se met en pause si inutilisé = économies)
- **Gratuit** : 512MB suffisant pour portfolio
- Basé en Europe (RGPD-friendly)
- Interface web pratique

❌ **Limites** :
- 512MB max (suffisant pour ~10-50k transactions)
- Se met en pause après inactivité (redémarre en ~1s)

**Alternatives** :
- Supabase (plus de features : auth, storage, mais plus complexe)
- PlanetScale (MySQL, pas PostgreSQL)
- Vercel Postgres (nouveau, bien intégré)

---

## 🗄️ Configuration Base de Données

### Étape 1 : Créer un compte Neon

1. Aller sur [neon.tech](https://neon.tech)
2. S'inscrire avec GitHub
3. Créer un nouveau projet

**Paramètres recommandés** :
```
Project name: budget-ai-portfolio
Region: Frankfurt (Europe - RGPD)
PostgreSQL version: 15 (dernière stable)
```

### Étape 2 : Récupérer l'URL de connexion

Après création, Neon vous donne une **Connection String** :

```
postgresql://username:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

⚠️ **Important** : Cette URL contient le mot de passe, **ne jamais la commit sur Git !**

### Étape 3 : Configurer Prisma pour Production

Créer un fichier pour tester la connexion :

```bash
# Copier l'URL dans .env.local temporairement
DATABASE_URL="postgresql://..."

# Tester la connexion
npx prisma db push

# Si ça fonctionne, vous verrez :
# ✔ Database synchronized
```

### Étape 4 : Seed Initial (Données de Démo)

Pour un portfolio, ajoutez des données de démonstration :

**Créer** : `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Utilisateur de démo
  const demoPassword = await bcrypt.hash('demo123', 10)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@budget-ai.com' },
    update: {},
    create: {
      email: 'demo@budget-ai.com',
      name: 'Utilisateur Démo',
      password: demoPassword,
    },
  })

  console.log({ demoUser })

  // Ajouter des données de démo (revenus, dépenses, etc.)
  // ...
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Ajouter dans `package.json` :

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Exécuter :

```bash
npx prisma db seed
```

---

## 🚀 Configuration Vercel

### Étape 1 : Connecter GitHub à Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. "Sign up with GitHub"
3. Autoriser l'accès à vos repos

### Étape 2 : Importer le Projet

1. Cliquer "Add New Project"
2. Sélectionner votre repo `Budget-AI` (ou le nom du repo)
3. Vercel détecte automatiquement Next.js ✅

**Configuration Build** :

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build (détecté auto)
Output Directory: .next (détecté auto)
Install Command: npm install
```

### Étape 3 : Ne PAS déployer tout de suite !

❌ Cliquer "Skip" ou "Cancel" - on doit d'abord configurer les variables d'environnement.

---

## 🔐 Variables d'Environnement

### Variables Nécessaires en Production

Créer dans **Vercel Dashboard** > Votre Projet > **Settings** > **Environment Variables** :

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `DATABASE_URL` | `postgresql://user:pass@...` | Production |
| `NEXTAUTH_URL` | `https://votre-app.vercel.app` | Production |
| `NEXTAUTH_SECRET` | (générer) | Production, Preview, Development |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Production |

### Générer NEXTAUTH_SECRET

```bash
# Dans votre terminal local
openssl rand -base64 32
# Copier le résultat dans Vercel
```

### Configuration Complète dans Vercel

```bash
# Production
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://budget-ai-demo.vercel.app
NEXTAUTH_SECRET=votre-secret-généré-de-32-caracteres
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx

# Preview (branches de test) - mêmes valeurs ou BDD séparée
# Development (local) - utilise .env.local
```

### ⚠️ Sécurité

- ✅ Ne JAMAIS commit `.env.local` sur Git
- ✅ `.env.local` doit être dans `.gitignore`
- ✅ Utiliser des secrets différents dev/prod
- ✅ Regénérer les secrets si exposés

---

## 🚢 Déploiement

### Méthode 1 : Déploiement Automatique (Recommandé)

Une fois configuré dans Vercel :

```bash
# Sur votre machine locale
git add .
git commit -m "feat: ready for production deployment"
git push origin main

# Vercel détecte le push et déploie automatiquement !
# Suivez la progression sur vercel.com/dashboard
```

**Temps de déploiement** : 1-3 minutes

### Méthode 2 : Vercel CLI (Manuel)

```bash
# Connexion
vercel login

# Premier déploiement
vercel

# Suivre les prompts :
# ? Set up and deploy? Yes
# ? Which scope? Votre compte
# ? Link to existing project? No
# ? What's your project's name? budget-ai
# ? In which directory is your code located? ./

# Déployer en production
vercel --prod
```

### Méthode 3 : Via Dashboard Vercel

1. Aller dans Vercel Dashboard
2. Sélectionner le projet
3. Onglet "Deployments"
4. Cliquer "Redeploy" sur le dernier deployment
5. Cocher "Use existing Build Cache" (non)
6. Cliquer "Redeploy"

---

## ✅ Vérifications Post-Déploiement

### Checklist Immédiate

```bash
# 1. Le site est accessible
curl https://votre-app.vercel.app
# Doit retourner du HTML

# 2. L'API fonctionne
curl https://votre-app.vercel.app/api/health
# (créer cette route si elle n'existe pas)

# 3. La connexion BDD fonctionne
# Essayer de se connecter via l'interface

# 4. L'authentification fonctionne
# Créer un compte de test

# 5. Les features IA fonctionnent
# Tester l'assistant IA
```

### Créer une Route de Health Check

**Fichier** : `src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test connexion BDD
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

Tester :
```bash
curl https://votre-app.vercel.app/api/health
```

### Vérifications Fonctionnelles

- [ ] Page d'accueil charge
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard affiche les données
- [ ] Création de dépense/revenu fonctionne
- [ ] Graphiques s'affichent
- [ ] Chat IA répond (si activé)
- [ ] Déconnexion fonctionne

### Vérifications Techniques

```bash
# Performance (doit être < 3s)
curl -w "@curl-format.txt" -o /dev/null -s https://votre-app.vercel.app

# SSL (doit être valide)
openssl s_client -connect votre-app.vercel.app:443 -servername votre-app.vercel.app < /dev/null

# Headers de sécurité
curl -I https://votre-app.vercel.app
# Vérifier : X-Frame-Options, X-Content-Type-Options, etc.
```

---

## ⚡ Optimisations

### 1. Performance

**Activer la compression d'images Next.js** :

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  // Optimisations production
  swcMinify: true,
  compress: true,
}

module.exports = nextConfig
```

**Activer le cache Vercel** :

```typescript
// Dans vos API routes
export const revalidate = 60 // Cache 60 secondes
```

### 2. SEO

**Créer** : `src/app/metadata.ts`

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Budget AI - Gestion Budgétaire Intelligente | Portfolio',
  description: 'Application de gestion budgétaire avec IA. Projet portfolio démontrant Next.js 14, TypeScript, Prisma, et intégration IA.',
  keywords: ['budget', 'finance', 'IA', 'Next.js', 'portfolio', 'TypeScript'],
  authors: [{ name: 'Votre Nom' }],
  openGraph: {
    title: 'Budget AI - Portfolio Project',
    description: 'Gestion budgétaire intelligente avec IA',
    type: 'website',
    url: 'https://votre-app.vercel.app',
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### 3. Sécurité

**Headers de sécurité** :

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

### 4. Analytics (Optionnel)

**Installer Vercel Analytics** (gratuit) :

```bash
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## 📊 Monitoring

### Vercel Dashboard

Accéder à :
- **Deployments** : Historique des déploiements
- **Analytics** : Trafic, performance
- **Logs** : Logs en temps réel (Runtime Logs)
- **Speed Insights** : Performance Core Web Vitals

### Monitoring BDD (Neon)

1. Aller sur Neon Dashboard
2. Voir "Monitoring" :
   - Connexions actives
   - Requêtes lentes
   - Utilisation stockage

### Alertes Recommandées

**Créer des alertes pour** :
- ❌ Deployment échoué (email auto Vercel)
- ⚠️ Utilisation BDD > 80% (Neon)
- 📈 Bande passante > 80GB (Vercel)
- 💰 Coûts API IA > 5$ (OpenRouter)

---

## 🐛 Troubleshooting

### Problème 1 : "Error: Database connection failed"

**Causes possibles** :
- URL de connexion incorrecte
- BDD Neon en pause (première requête lente)
- Firewall bloque les connexions

**Solutions** :
```bash
# 1. Vérifier l'URL dans Vercel
# Settings > Environment Variables > DATABASE_URL

# 2. Tester la connexion depuis Vercel
# Dans Runtime Logs, chercher "PrismaClientInitializationError"

# 3. Vérifier que l'URL contient ?sslmode=require
DATABASE_URL=postgresql://...?sslmode=require
```

### Problème 2 : "NEXTAUTH_URL missing"

```bash
# Dans Vercel > Environment Variables
NEXTAUTH_URL=https://votre-app.vercel.app

# Redéployer après ajout
vercel --prod
```

### Problème 3 : "Build failed"

```bash
# Localement, vérifier que le build passe
npm run build

# Erreurs TypeScript
npm run type-check

# Vérifier les logs Vercel pour l'erreur exacte
# Dashboard > Deployments > Cliquer sur le deployment raté > Logs
```

### Problème 4 : "Module not found"

**Cause** : Dépendance manquante ou mauvaise importation

```bash
# Vérifier package.json
npm install

# S'assurer que toutes les deps sont dans "dependencies"
# et pas "devDependencies" si utilisées en runtime
```

### Problème 5 : "API route timeout"

**Cause** : Fonction prend > 10s (limite Vercel gratuit)

```typescript
// Optimiser les requêtes BDD
// Utiliser Prisma Select pour ne récupérer que les champs nécessaires
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true }, // Au lieu de tout récupérer
})
```

### Problème 6 : "Too many requests - Rate limit"

**Cause** : Trop d'appels API IA

```typescript
// Implémenter un cache simple
import { unstable_cache } from 'next/cache'

const getCachedAIResponse = unstable_cache(
  async (prompt: string) => {
    return await callOpenRouter(prompt)
  },
  ['ai-response'],
  { revalidate: 3600 } // Cache 1h
)
```

---

## 📚 Ressources Utiles

### Documentation Officielle

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

### Tutoriels Vidéo

- [Deploying Next.js to Vercel (YouTube)](https://www.youtube.com/results?search_query=deploy+nextjs+to+vercel)
- [Neon Setup Tutorial](https://neon.tech/docs/get-started-with-neon/signing-up)

### Support

- Vercel Support : support@vercel.com
- Neon Discord : https://discord.gg/neon
- Stack Overflow : Tag `vercel` ou `neon`

---

## 🎯 Checklist Finale de Déploiement

### Avant le Déploiement

- [ ] Code fonctionne en local (`npm run dev`)
- [ ] Build réussit (`npm run build`)
- [ ] Pas d'erreurs lint (`npm run lint`)
- [ ] `.env.local` dans `.gitignore`
- [ ] Variables sensibles retirées du code
- [ ] BDD Neon créée et testée
- [ ] Données de démo ajoutées (seed)

### Configuration Vercel

- [ ] Compte Vercel créé
- [ ] Projet importé depuis GitHub
- [ ] Variables d'environnement configurées
- [ ] Build settings validés
- [ ] Domain configuré (optionnel)

### Après le Déploiement

- [ ] Site accessible via HTTPS
- [ ] Health check fonctionne
- [ ] Authentification testée
- [ ] Fonctionnalités principales testées
- [ ] Performance vérifiée (< 3s)
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Analytics activés
- [ ] README mis à jour avec URL live

### Documentation Portfolio

- [ ] README inclut lien démo live
- [ ] Screenshots ajoutés
- [ ] Technologies listées
- [ ] Compte démo documenté
- [ ] Note "AI-Assisted Development"

---

## 🎉 Félicitations !

Votre projet Budget AI est maintenant en ligne ! 

**URL de démo** : `https://votre-app.vercel.app`

**Prochaines étapes** :
1. Partager le lien sur LinkedIn
2. Ajouter au CV / Portfolio
3. Monitorer les performances
4. Itérer selon feedback

---

**Date de création** : 29 novembre 2025  
**Dernière mise à jour** : 29 novembre 2025  
**Statut** : Production Ready ✅

