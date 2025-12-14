# ✅ Checklist de Passage en Production - Budget AI

Date de préparation : 29 novembre 2025

---

## 🎯 Objectif

Déployer Budget AI en tant que projet portfolio professionnel, accessible en ligne et présentable aux recruteurs.

---

## 📋 PRÉ-DÉPLOIEMENT

### 1. Code Quality

- [ ] **Build réussit sans erreurs**
  ```bash
  npm run build
  # Doit se terminer avec "✓ Compiled successfully"
  ```

- [ ] **Aucune erreur TypeScript**
  ```bash
  npm run type-check
  # OU vérifier dans le build
  ```

- [ ] **Lint propre** (ou erreurs mineures acceptables)
  ```bash
  npm run lint
  ```

- [ ] **Aucune console.log oubliée** dans le code de production
  ```bash
  # Rechercher les console.log/console.error
  grep -r "console\." src/
  ```

### 2. Sécurité

- [ ] **`.env.local` dans `.gitignore`**
  ```bash
  grep ".env.local" .gitignore
  # Doit retourner une ligne
  ```

- [ ] **Aucune clé API dans le code source**
  ```bash
  # Vérifier qu'il n'y a pas de secrets hardcodés
  grep -r "sk-or-v1" src/  # Devrait être vide
  grep -r "postgres://" src/  # Devrait être vide
  ```

- [ ] **NEXTAUTH_SECRET généré** et unique
  ```bash
  openssl rand -base64 32
  # Copier le résultat pour Vercel
  ```

- [ ] **Validation des inputs** (Zod) sur toutes les routes API

- [ ] **Protection des routes** (middleware authentification)

### 3. Configuration Environnement

- [ ] **Fichier `.env.example` à jour**
  ```bash
  # Doit contenir TOUTES les variables nécessaires (sans valeurs)
  cat .env.example
  ```

- [ ] **Variables identifiées** :
  ```
  ✅ DATABASE_URL
  ✅ NEXTAUTH_URL
  ✅ NEXTAUTH_SECRET
  ✅ OPENROUTER_API_KEY
  ```

### 4. Base de Données

- [ ] **Schéma Prisma validé**
  ```bash
  npx prisma validate
  ```

- [ ] **Migrations générées**
  ```bash
  npx prisma migrate status
  ```

- [ ] **Seed script prêt** (données de démo)
  ```bash
  # Vérifier que seed.ts existe
  ls prisma/seed.ts
  ```

### 5. Documentation

- [ ] **README.md à jour** avec :
  - [ ] Description du projet
  - [ ] Technologies utilisées
  - [ ] Instructions d'installation
  - [ ] Lien démo live (sera ajouté après déploiement)
  - [ ] Screenshots/GIFs

- [ ] **DEPLOYMENT.md** créé ✅

- [ ] **PORTFOLIO.md** créé ✅

- [ ] **Commentaires dans le code** pour les parties complexes

### 6. Assets & UI

- [ ] **Favicon** personnalisé (`public/favicon.ico`)

- [ ] **Métadonnées SEO** configurées (`metadata.ts`)

- [ ] **Images optimisées** (format WebP si possible)

- [ ] **Responsive** testé sur mobile/tablet/desktop

- [ ] **Accessibilité** basique (alt tags, labels)

---

## 🗄️ BASE DE DONNÉES CLOUD

### Créer compte Neon

- [ ] **Aller sur [neon.tech](https://neon.tech)**

- [ ] **S'inscrire avec GitHub**

- [ ] **Créer un projet** :
  ```
  Nom : budget-ai-portfolio
  Région : Europe (Frankfurt) - RGPD
  PostgreSQL : Version 15
  ```

- [ ] **Copier la Connection String**
  ```
  postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
  ```

- [ ] **Tester la connexion localement** :
  ```bash
  # Dans .env.local temporairement
  DATABASE_URL="postgresql://..."
  
  npx prisma db push
  # Doit réussir : "Database synchronized"
  ```

- [ ] **Seed la base de données** :
  ```bash
  npx prisma db seed
  # Doit créer l'utilisateur démo et données
  ```

- [ ] **Vérifier les données** :
  ```bash
  npx prisma studio
  # Ouvrir dans le navigateur et vérifier
  ```

---

## 🚀 CONFIGURATION VERCEL

### Créer compte et projet

- [ ] **Aller sur [vercel.com](https://vercel.com)**

- [ ] **S'inscrire avec GitHub**

- [ ] **Cliquer "Add New Project"**

- [ ] **Sélectionner le repo Budget AI**

- [ ] **Vérifier la détection automatique** :
  ```
  Framework Preset: Next.js ✅
  Root Directory: ./ ✅
  Build Command: npm run build ✅
  Output Directory: .next ✅
  ```

### Variables d'Environnement

**⚠️ IMPORTANT : Configurer AVANT le premier déploiement !**

- [ ] **Aller dans Settings > Environment Variables**

- [ ] **Ajouter chaque variable** :

#### DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
Environment: Production, Preview, Development
```

#### NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://votre-app.vercel.app
Environment: Production
```

#### NEXTAUTH_SECRET
```bash
# Générer d'abord :
openssl rand -base64 32

# Puis ajouter :
Name: NEXTAUTH_SECRET
Value: [résultat de la commande ci-dessus]
Environment: Production, Preview, Development
```

#### OPENROUTER_API_KEY
```
Name: OPENROUTER_API_KEY
Value: sk-or-v1-xxxxxxxxxxxxxxxx
Environment: Production
```

- [ ] **Vérifier que toutes les variables sont ajoutées**

### Configuration Build (Optionnel)

- [ ] **Settings > Build & Development Settings** :
  ```
  Build Command: npm run build
  Output Directory: .next
  Install Command: npm install
  Development Command: npm run dev
  ```

---

## 🎬 DÉPLOIEMENT

### Premier Déploiement

- [ ] **Dans Vercel Dashboard, cliquer "Deploy"**

- [ ] **Attendre la fin du build** (2-5 minutes)

- [ ] **Vérifier les logs** :
  - [ ] Build successful ✅
  - [ ] No errors ✅
  - [ ] Deployment URL générée ✅

- [ ] **Noter l'URL de déploiement** :
  ```
  https://budget-ai-xxxxx.vercel.app
  ```

### Vérifications Immédiates

- [ ] **Site accessible** :
  ```bash
  curl -I https://votre-app.vercel.app
  # Status: 200 OK
  ```

- [ ] **HTTPS actif** (cadenas vert dans le navigateur)

- [ ] **Page d'accueil charge** sans erreur

- [ ] **Console navigateur propre** (F12 > Console)

### Tests Fonctionnels

- [ ] **Inscription** : Créer un compte de test
  ```
  Email: test@example.com
  Password: Test123!
  ```

- [ ] **Connexion** : Se connecter avec ce compte

- [ ] **Dashboard** : Vérifier que le dashboard charge

- [ ] **Créer une dépense** : Ajouter une dépense de test

- [ ] **Créer un revenu** : Ajouter un revenu de test

- [ ] **Graphiques** : Vérifier que les graphiques s'affichent

- [ ] **Chat IA** (si activé) : Poser une question

- [ ] **Déconnexion** : Se déconnecter

### Tests Performance

- [ ] **Lighthouse audit** (Chrome DevTools) :
  ```
  Performance > 80 ✅
  Accessibility > 80 ✅
  Best Practices > 90 ✅
  SEO > 90 ✅
  ```

- [ ] **Temps de chargement < 3 secondes**

- [ ] **Mobile responsive** (tester sur téléphone)

---

## 🎨 PERSONNALISATION PORTFOLIO

### Bandeau Démo

- [ ] **Ajouter un bandeau "Projet Portfolio"** sur l'app :

Créer `src/components/layout/demo-banner.tsx` :

```typescript
export function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm">
      📚 <strong>Projet Portfolio</strong> - 
      Développé avec Next.js 14, TypeScript, Prisma & IA - 
      <a href="https://github.com/votre-username/budget-ai" 
         className="underline ml-2" 
         target="_blank">
        Voir le code source →
      </a>
    </div>
  )
}
```

Ajouter dans `src/app/layout.tsx` :

```typescript
import { DemoBanner } from '@/components/layout/demo-banner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {process.env.NODE_ENV === 'production' && <DemoBanner />}
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Commiter et pousser** (déploiement auto)

### Page d'Accueil Portfolio

- [ ] **Améliorer la page d'accueil** (`src/app/page.tsx`) :
  - [ ] Section "À propos du projet"
  - [ ] Technologies utilisées (badges)
  - [ ] Bouton "Essayer la démo"
  - [ ] Lien GitHub
  - [ ] Screenshots

### README avec Screenshots

- [ ] **Prendre des screenshots** de l'app :
  ```
  - Dashboard principal
  - Page des dépenses
  - Graphiques
  - Chat IA
  - Version mobile
  ```

- [ ] **Créer dossier** `screenshots/` dans le repo

- [ ] **Ajouter au README** :
  ```markdown
  ## 📸 Screenshots
  
  ![Dashboard](screenshots/dashboard.png)
  ![Expenses](screenshots/expenses.png)
  ```

---

## 📊 MONITORING & ANALYTICS

### Vercel Analytics (Gratuit)

- [ ] **Installer** :
  ```bash
  npm install @vercel/analytics
  ```

- [ ] **Ajouter dans layout** :
  ```typescript
  import { Analytics } from '@vercel/analytics/react'
  
  <Analytics />
  ```

- [ ] **Activer dans Vercel Dashboard** :
  ```
  Analytics tab > Enable
  ```

### Vercel Speed Insights

- [ ] **Installer** :
  ```bash
  npm install @vercel/speed-insights
  ```

- [ ] **Ajouter dans layout** :
  ```typescript
  import { SpeedInsights } from '@vercel/speed-insights/next'
  
  <SpeedInsights />
  ```

### Logs & Monitoring

- [ ] **Activer les Runtime Logs** dans Vercel

- [ ] **Configurer les alertes** :
  - [ ] Deployment failed
  - [ ] Error rate > 5%

---

## 🌐 DOMAINE PERSONNALISÉ (Optionnel)

### Si vous avez un domaine

- [ ] **Aller dans Vercel > Settings > Domains**

- [ ] **Ajouter domaine** : `budget-ai.votre-domaine.com`

- [ ] **Configurer DNS** selon instructions Vercel

- [ ] **Attendre propagation** (5-30 minutes)

- [ ] **Vérifier HTTPS** actif

- [ ] **Mettre à jour NEXTAUTH_URL** :
  ```
  NEXTAUTH_URL=https://budget-ai.votre-domaine.com
  ```

---

## 📢 COMMUNICATION

### Mise à Jour README

- [ ] **Ajouter le lien démo** en haut :
  ```markdown
  # Budget AI
  
  🚀 **[Démo Live](https://budget-ai-demo.vercel.app)**
  ```

- [ ] **Badge de statut** :
  ```markdown
  ![Deployment](https://img.shields.io/badge/deployment-success-brightgreen)
  ![Next.js](https://img.shields.io/badge/Next.js-14-black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
  ```

### LinkedIn

- [ ] **Créer un post** annonçant le projet :
  ```
  🚀 Fier de partager mon nouveau projet : Budget AI
  
  Une application de gestion budgétaire intelligente avec IA,
  développée avec Next.js 14, TypeScript, Prisma et Claude AI.
  
  ✨ Fonctionnalités :
  - Dashboard financier interactif
  - Projections IA basées sur l'historique
  - Chat conversationnel avec vos finances
  - Graphiques et analytics avancés
  
  🔗 Démo live : [lien]
  💻 Code source : [lien GitHub]
  
  #NextJS #TypeScript #IA #WebDevelopment #Portfolio
  ```

### GitHub

- [ ] **Ajouter topics au repo** :
  ```
  nextjs, typescript, prisma, ai, portfolio, 
  budget-app, fintech, react, tailwindcss
  ```

- [ ] **Épingler le repo** sur votre profil GitHub

- [ ] **Ajouter un README.md de qualité** avec :
  - [ ] Badges
  - [ ] Description
  - [ ] Screenshots
  - [ ] Lien démo
  - [ ] Stack technique
  - [ ] Installation locale

---

## 🔧 MAINTENANCE

### Monitoring Régulier

- [ ] **Vérifier quotidiennement** (première semaine) :
  - [ ] Site accessible
  - [ ] Pas d'erreurs dans Vercel Logs
  - [ ] Performance stable

- [ ] **Vérifier hebdomadairement** :
  - [ ] Analytics (nombre de visiteurs)
  - [ ] Coûts API IA (OpenRouter)
  - [ ] Utilisation BDD (Neon)

### Limites à Surveiller

- [ ] **Vercel** :
  ```
  Bande passante : 100GB/mois
  Build time : 6000 minutes/mois
  Serverless functions : 100GB-Hrs
  ```

- [ ] **Neon** :
  ```
  Stockage : 512MB
  Compute hours : 100h/mois (se pause auto)
  ```

- [ ] **OpenRouter** :
  ```
  Budget : Définir une limite (ex: 10$/mois)
  ```

### Mises à Jour

- [ ] **Dépendances** :
  ```bash
  # Vérifier les updates mensuellement
  npm outdated
  
  # Mettre à jour les mineures
  npm update
  ```

- [ ] **Next.js** :
  ```bash
  # Quand nouvelle version stable
  npm install next@latest
  ```

---

## ⚠️ TROUBLESHOOTING

### Si le déploiement échoue

1. **Lire les logs Vercel** (tout est là !)
2. **Vérifier localement** : `npm run build`
3. **Vérifier variables d'environnement**
4. **Google l'erreur exacte**

### Si la BDD ne se connecte pas

1. **Vérifier `DATABASE_URL` dans Vercel**
2. **Tester depuis local** avec l'URL Neon
3. **Vérifier que `?sslmode=require` est présent**
4. **Regénérer le password Neon** si nécessaire

### Si l'authentification échoue

1. **Vérifier `NEXTAUTH_URL`** = URL Vercel exacte
2. **Vérifier `NEXTAUTH_SECRET`** est défini
3. **Clear cookies** et réessayer

---

## ✅ CHECKLIST FINALE

### Avant de communiquer le projet

- [ ] Site en ligne et accessible
- [ ] Toutes les fonctionnalités testées
- [ ] Aucune erreur visible
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] README à jour avec lien démo
- [ ] Screenshots ajoutés
- [ ] Compte démo fonctionnel :
  ```
  Email: demo@budget-ai.com
  Password: demo123
  ```
- [ ] Bandeau "Portfolio" visible
- [ ] Analytics activés
- [ ] Code source propre (sur GitHub)

### Impression Professionnelle

- [ ] **URL clean** (pas de nom bizarre)
- [ ] **Pas d'erreurs console** (F12)
- [ ] **Responsive** parfait
- [ ] **Rapide** (< 3s)
- [ ] **Sécurisé** (HTTPS, pas de warnings)

---

## 🎉 CÉLÉBRATION

### Vous êtes en PROD ! 🚀

**Félicitations !** Votre projet est maintenant accessible au monde entier.

**Prochaines étapes** :
1. ✅ Partagez sur LinkedIn
2. ✅ Ajoutez à votre CV
3. ✅ Montrez aux recruteurs
4. ✅ Collectez du feedback
5. ✅ Itérez et améliorez

---

**Date de passage en prod** : ____ / ____ / ____  
**URL de production** : ________________________________  
**Première visite** : ____ personnes  
**Premier feedback** : ________________________________

---

> 💡 **Conseil** : Gardez ce document à jour et cochez les cases au fur et à mesure.  
> C'est votre guide de déploiement réutilisable pour tous vos futurs projets !

