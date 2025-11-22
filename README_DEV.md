# 🚀 Guide de Développement - Budget AI

## 📋 Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **PostgreSQL** 15+ (local ou Supabase)
- **npm** ou **yarn**

## 🛠️ Installation

### 1. Cloner le repository

```bash
git clone https://github.com/Warnierr/budget-ai.git
cd budget-ai
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créer un fichier `.env.local` à la racine (copier `env-example.txt`) :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/budgetai"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere-avec-openssl"

# OpenAI (optionnel pour le MVP)
OPENAI_API_KEY="sk-..."

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

#### Générer NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 4. Configuration de PostgreSQL

#### Option A : PostgreSQL Local

```bash
# Installer PostgreSQL (Windows)
# Télécharger depuis https://www.postgresql.org/download/windows/

# Créer la base de données
psql -U postgres
CREATE DATABASE budgetai;
```

#### Option B : Supabase (Recommandé - Gratuit)

1. Aller sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans `Settings > Database`
4. Copier la `Connection string` (mode `Transaction`)
5. Remplacer `[YOUR-PASSWORD]` par votre mot de passe
6. Coller dans `.env.local` comme `DATABASE_URL`

### 5. Initialiser la base de données avec Prisma

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables (push schema)
npm run db:push

# Ou créer une migration (production)
npm run db:migrate
```

### 6. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
budget-ai/
├── prisma/
│   └── schema.prisma          # Schéma de base de données
├── src/
│   ├── app/                   # Pages et API Routes (Next.js App Router)
│   │   ├── (auth)/           # Pages d'authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/        # Pages du dashboard
│   │   │   ├── expenses/
│   │   │   ├── incomes/
│   │   │   └── subscriptions/
│   │   ├── api/              # API Routes
│   │   │   ├── auth/
│   │   │   ├── expenses/
│   │   │   ├── incomes/
│   │   │   └── subscriptions/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/               # Composants UI (Shadcn)
│   │   └── layout/           # Layout (Sidebar, Header)
│   ├── lib/
│   │   ├── prisma.ts         # Client Prisma
│   │   ├── auth.ts           # Config NextAuth
│   │   ├── utils.ts          # Utilitaires
│   │   └── validations.ts    # Schémas Zod
│   └── types/
│       └── next-auth.d.ts    # Types TypeScript
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev                 # Lancer le serveur de développement

# Base de données
npm run db:generate         # Générer le client Prisma
npm run db:push            # Push le schéma vers la DB (dev)
npm run db:migrate         # Créer une migration (prod)
npm run db:studio          # Ouvrir Prisma Studio (GUI)

# Production
npm run build              # Build pour la production
npm start                  # Démarrer en production

# Qualité du code
npm run lint               # Linter le code
```

## 🗄️ Prisma Studio (Interface graphique DB)

Pour visualiser et éditer les données facilement :

```bash
npm run db:studio
```

Ouvre une interface web sur `http://localhost:5555`

## 🧪 Test du Projet

### 1. Créer un compte

1. Aller sur [http://localhost:3000/register](http://localhost:3000/register)
2. Créer un compte (nom, email, mot de passe)
3. Vous serez automatiquement connecté

### 2. Explorer les fonctionnalités

- **Dashboard** : Vue d'ensemble de vos finances
- **Revenus** : Ajouter vos salaires, revenus freelance, etc.
- **Dépenses** : Suivre vos dépenses quotidiennes
- **Abonnements** : Centraliser tous vos abonnements (Netflix, Spotify, etc.)

## 🐛 Résolution de problèmes

### Erreur : "Can't reach database server"

- Vérifier que PostgreSQL est lancé
- Vérifier la `DATABASE_URL` dans `.env.local`
- Tester la connexion : `psql -U postgres`

### Erreur : "Module not found"

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Erreur Prisma

```bash
npm run db:generate
npx prisma db push
```

### Port 3000 déjà utilisé

```bash
# Tuer le processus sur le port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Ou utiliser un autre port
npm run dev -- -p 3001
```

## 📚 Technologies Utilisées

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : NextAuth.js
- **UI** : Tailwind CSS + Shadcn/ui
- **Validation** : Zod
- **Icônes** : Lucide React

## 🌐 Déploiement (Vercel)

### Configuration

1. Créer un compte sur [Vercel](https://vercel.com)
2. Connecter votre repo GitHub
3. Configurer les variables d'environnement :
   - `DATABASE_URL` (Supabase)
   - `NEXTAUTH_URL` (votre URL Vercel)
   - `NEXTAUTH_SECRET`
   - `OPENAI_API_KEY` (si IA activée)

### Deploy

```bash
# Installer Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📖 Documentation Complète

- [Feuille de route](./ROADMAP.md)
- [Architecture](./ARCHITECTURE.md)
- [Sécurité et RGPD](./SECURITY_RGPD.md)
- [Modèle commercial](./BUSINESS_MODEL.md)

## 💬 Support

- **Issues** : [GitHub Issues](https://github.com/Warnierr/budget-ai/issues)
- **Discussions** : [GitHub Discussions](https://github.com/Warnierr/budget-ai/discussions)

---

**Bon développement ! 🚀**

