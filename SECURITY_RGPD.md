# 🔐 Sécurité et Conformité RGPD - Budget AI

## 📋 Table des Matières
1. [Vue d'ensemble RGPD](#vue-densemble-rgpd)
2. [Protection des Données Personnelles](#protection-des-données-personnelles)
3. [Sécurité Technique](#sécurité-technique)
4. [IA et Données Sensibles](#ia-et-données-sensibles)
5. [Droits des Utilisateurs](#droits-des-utilisateurs)
6. [Documentation Légale](#documentation-légale)
7. [Audits et Certification](#audits-et-certification)

---

## 🇪🇺 Vue d'ensemble RGPD

### Qu'est-ce que le RGPD ?

Le **Règlement Général sur la Protection des Données** (RGPD) est la loi européenne qui protège les données personnelles des citoyens européens. Pour Budget AI, c'est **CRITIQUE** car on manipule des données financières ultra-sensibles.

### Principes Fondamentaux à Respecter

1. **Licéité** : Avoir une base légale pour traiter les données
2. **Finalité** : Collecter uniquement pour des objectifs précis
3. **Minimisation** : Ne collecter que le strict nécessaire
4. **Exactitude** : Maintenir les données à jour
5. **Conservation limitée** : Ne pas garder éternellement
6. **Intégrité et confidentialité** : Sécuriser les données
7. **Transparence** : Informer clairement les utilisateurs

### Sanctions Possibles

- Jusqu'à **20 millions d'euros** ou **4% du CA mondial**
- Poursuites judiciaires
- Perte de réputation

➡️ **Conformité = Non négociable**

---

## 🛡️ Protection des Données Personnelles

### Classification des Données

#### Données Personnelles (Article 4 RGPD)
- Nom, prénom
- Email
- Adresse IP
- Cookies

#### Données Financières (Sensibles++)
- Revenus
- Dépenses
- Comptes bancaires (si connexion API)
- Abonnements

#### Données "Spéciales" (Article 9 - Interdites sauf exception)
- Santé
- Religion
- Politique

➡️ **Budget AI traite des données financières = Niveau de protection MAXIMUM**

### Bases Légales pour le Traitement

Pour Budget AI, on utilise :

1. **Consentement** (Article 6.1.a)
   - Pour le traitement des données financières
   - Pour l'utilisation de l'IA
   - Pour les cookies analytics
   - ✅ Doit être libre, spécifique, éclairé, univoque
   - ✅ Révocable à tout moment

2. **Exécution d'un contrat** (Article 6.1.b)
   - Pour fournir le service
   - Pour gérer le compte utilisateur

3. **Intérêt légitime** (Article 6.1.f)
   - Pour la sécurité (détection de fraude)
   - Pour l'amélioration du service

### Implémentation du Consentement

```typescript
// src/components/consent-banner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      essential: true,
      analytics: true,
      ai: true,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      essential: true,
      analytics: false,
      ai: false,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="max-w-6xl mx-auto">
        <h3 className="font-bold mb-2">🍪 Gestion des cookies et données</h3>
        <p className="text-sm mb-4">
          Budget AI utilise des cookies essentiels pour le fonctionnement du site,
          et peut utiliser vos données financières pour générer des conseils personnalisés
          via intelligence artificielle. Nous ne revendons JAMAIS vos données.
          <a href="/privacy" className="underline ml-1">En savoir plus</a>
        </p>
        <div className="flex gap-2">
          <Button onClick={acceptAll}>Tout accepter</Button>
          <Button variant="outline" onClick={acceptEssential}>
            Uniquement les essentiels
          </Button>
          <Button variant="ghost" onClick={() => {/* Ouvrir modal détaillé */}}>
            Personnaliser
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Registre des Traitements (Article 30)

| Traitement | Finalité | Base légale | Durée conservation | Destinataires |
|------------|----------|-------------|-------------------|---------------|
| Compte utilisateur | Authentification | Contrat | Tant que compte actif | Aucun |
| Données financières | Gestion budget | Consentement + Contrat | Tant que compte actif | IA (anonymisé) |
| Logs de connexion | Sécurité | Intérêt légitime | 12 mois | Équipe tech |
| Analytics | Amélioration | Consentement | 24 mois | Google Analytics (si activé) |
| Emails marketing | Communication | Consentement | Jusqu'à désinscription | Aucun |

---

## 🔒 Sécurité Technique

### 1. Chiffrement des Données

#### En Transit (HTTPS)
```typescript
// next.config.js
module.exports = {
  // Force HTTPS en production
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://budgetai.app/:path*',
        permanent: true,
      },
    ];
  },
};
```

#### Au Repos (Base de données)
```typescript
// src/lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

interface EncryptedData {
  iv: string;
  authTag: string;
  encrypted: string;
}

/**
 * Chiffre des données sensibles (montants, noms de comptes, etc.)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return JSON.stringify({
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encrypted,
  });
}

/**
 * Déchiffre les données
 */
export function decrypt(encryptedData: string): string {
  const { iv, authTag, encrypted } = JSON.parse(encryptedData) as EncryptedData;
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Hash unidirectionnel pour données non récupérables
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}
```

#### Quelles Données Chiffrer ?

**OUI - Chiffrer** :
- Montants des revenus et dépenses (si très sensible)
- Noms de bénéficiaires
- Notes personnelles
- Tokens API bancaires

**NON - Pas de chiffrement** :
- Dates (besoin de requêtes)
- Catégories (données génériques)
- IDs utilisateurs

### 2. Authentification Sécurisée

```typescript
// src/lib/auth.ts
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Validation stricte
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12), // Minimum 12 caractères
});

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Email/Password
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        // Validation
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) return null;

        const { email, password } = validated.data;

        // Récupérer l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        // Vérifier le mot de passe (bcrypt)
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),

    // Google OAuth (optionnel)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // Sécurité
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};

/**
 * Hash un mot de passe (inscription)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // 12 rounds = équilibre sécu/perfs
}

/**
 * Politique de mot de passe
 */
export const passwordSchema = z.string()
  .min(12, 'Minimum 12 caractères')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[a-z]/, 'Au moins une minuscule')
  .regex(/[0-9]/, 'Au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial');
```

### 3. Protection contre les Attaques

#### Rate Limiting

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? 'anonymous';
  const url = req.nextUrl.pathname;

  // Rate limiting sur les endpoints sensibles
  if (url.startsWith('/api/auth') || url.startsWith('/api/ai')) {
    const key = `rate-limit:${ip}:${url}`;
    const limit = 10; // 10 requêtes
    const window = 60; // par minute

    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, window);
    }

    if (requests > limit) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

#### CSRF Protection

NextAuth.js intègre déjà une protection CSRF via tokens.

#### SQL Injection

Prisma protège automatiquement contre l'injection SQL (requêtes paramétrées).

#### XSS (Cross-Site Scripting)

React échappe automatiquement les variables, mais attention aux `dangerouslySetInnerHTML`.

```typescript
// ❌ DANGEREUX
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SÛR
<div>{userInput}</div>
```

### 4. Validation Systématique

```typescript
// src/lib/validations.ts
import { z } from 'zod';

// Schéma pour les dépenses
export const expenseSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive().max(1000000), // Max 1M€
  date: z.date(),
  categoryId: z.string().cuid().optional(),
  description: z.string().max(500).optional(),
});

// Schéma pour les revenus
export const incomeSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive().max(1000000),
  frequency: z.enum(['monthly', 'once', 'weekly', 'yearly']),
  date: z.date(),
  isRecurring: z.boolean().default(false),
});

// Schéma pour les abonnements
export const subscriptionSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive().max(10000),
  frequency: z.enum(['monthly', 'yearly']),
  billingDate: z.number().min(1).max(31),
  categoryId: z.string().cuid().optional(),
});

// Utilisation dans une API Route
import { expenseSchema } from '@/lib/validations';

export async function POST(req: Request) {
  const body = await req.json();
  
  // Validation
  const result = expenseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    );
  }
  
  // result.data est typé et validé ✅
  const expense = await prisma.expense.create({
    data: result.data,
  });
  
  return NextResponse.json(expense);
}
```

---

## 🤖 IA et Données Sensibles

### Le Problème

Quand on envoie des données à OpenAI, Claude, etc. :
- Les données quittent notre infrastructure
- Elles transitent par les serveurs de l'API
- Risque de non-conformité RGPD

### Solutions

#### Option 1 : Anonymisation avant Envoi (RECOMMANDÉ)

```typescript
// src/services/ai-service.ts

interface UserFinancialData {
  userId: string;
  incomes: { name: string; amount: number }[];
  expenses: { name: string; amount: number; category: string }[];
  subscriptions: { name: string; amount: number }[];
}

/**
 * Anonymise les données avant envoi à l'IA
 */
function anonymizeData(data: UserFinancialData): string {
  // Remplacer les noms par des codes génériques
  const anonymized = {
    totalIncome: data.incomes.reduce((sum, i) => sum + i.amount, 0),
    expensesByCategory: data.expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>),
    subscriptionsCount: data.subscriptions.length,
    subscriptionsTotal: data.subscriptions.reduce((sum, s) => sum + s.amount, 0),
  };

  return `
    Revenus mensuels: ${anonymized.totalIncome}€
    Dépenses par catégorie: ${JSON.stringify(anonymized.expensesByCategory)}
    Nombre d'abonnements: ${anonymized.subscriptionsCount}
    Coût total abonnements: ${anonymized.subscriptionsTotal}€
  `;
}

export async function generateAdvice(userId: string) {
  // 1. Récupérer les données
  const userData = await getUserFinancialData(userId);

  // 2. Anonymiser
  const anonymizedContext = anonymizeData(userData);

  // 3. Envoyer à l'IA (sans données identifiantes)
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Tu es un conseiller financier. Les données sont anonymisées.',
      },
      {
        role: 'user',
        content: `Contexte: ${anonymizedContext}\n\nQuels conseils donnerais-tu?`,
      },
    ],
  });

  return response.choices[0].message.content;
}
```

#### Option 2 : IA Locale (Privacy First)

Utiliser **Ollama** pour exécuter des LLMs en local :

```bash
# Installation
curl -fsSL https://ollama.com/install.sh | sh

# Télécharger un modèle
ollama pull llama2

# Lancer le serveur
ollama serve
```

```typescript
// src/lib/ollama.ts
import axios from 'axios';

const OLLAMA_URL = 'http://localhost:11434';

export async function queryLocalLLM(prompt: string): Promise<string> {
  const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model: 'llama2',
    prompt,
    stream: false,
  });

  return response.data.response;
}

// Avantages:
// ✅ Données ne quittent JAMAIS le serveur
// ✅ Conformité RGPD totale
// ✅ Pas de coûts API
// ❌ Nécessite un serveur puissant (GPU)
// ❌ Qualité inférieure à GPT-4
```

#### Option 3 : DPA avec OpenAI (Data Processing Agreement)

OpenAI propose des contrats DPA pour les entreprises :
- https://openai.com/policies/data-processing-addendum

**Clauses importantes** :
- Pas d'utilisation des données pour entraînement
- Suppression après traitement
- Conformité RGPD

**Comment l'activer** :
1. Passer en compte "Business"
2. Signer le DPA
3. Utiliser l'API avec les paramètres appropriés

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...],
  user: hash(userId), // Identifier l'utilisateur (hash anonyme)
});
```

### Notre Recommandation pour Budget AI

**Phase 1 (MVP)** : Anonymisation + OpenAI avec DPA
- Simple à mettre en place
- Bonne qualité de conseils
- Conformité acceptable

**Phase 2 (Scale)** : Ollama local pour données sensibles
- Confidentialité maximale
- Argument marketing fort
- Investissement infrastructure

---

## 👤 Droits des Utilisateurs (Chapitre 3 RGPD)

### Droits à Implémenter

#### 1. Droit d'accès (Article 15)
L'utilisateur peut demander une copie de toutes ses données.

```typescript
// src/app/api/gdpr/export/route.ts
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Récupérer TOUTES les données de l'utilisateur
  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      incomes: true,
      expenses: true,
      subscriptions: true,
      categories: true,
      budgets: true,
      goals: true,
    },
  });

  // Générer un JSON propre
  const exportData = {
    exportDate: new Date().toISOString(),
    user: userData,
  };

  // Retourner en téléchargement
  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="budget-ai-data-${session.user.id}.json"`,
    },
  });
}
```

#### 2. Droit de rectification (Article 16)
Via l'interface utilisateur (formulaires d'édition).

#### 3. Droit à l'effacement / "Droit à l'oubli" (Article 17)

```typescript
// src/app/api/gdpr/delete/route.ts
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Supprimer TOUTES les données de l'utilisateur
  // Prisma cascade delete s'occupe des relations
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  // Supprimer aussi dans les services externes
  // - Pinecone (embeddings)
  // - Stripe (si abonnement)
  // - etc.

  return new Response('Compte supprimé', { status: 200 });
}
```

#### 4. Droit à la portabilité (Article 20)
Export en JSON (voir droit d'accès) ou CSV.

#### 5. Droit d'opposition (Article 21)
Possibilité de refuser certains traitements (analytics, emails marketing).

```typescript
// src/components/settings/privacy-settings.tsx
'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

export function PrivacySettings() {
  const [settings, setSettings] = useState({
    aiAdvice: true,
    analytics: false,
    marketing: false,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Conseils IA personnalisés</h3>
          <p className="text-sm text-gray-500">
            Autoriser l'IA à analyser vos données pour des conseils
          </p>
        </div>
        <Switch
          checked={settings.aiAdvice}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, aiAdvice: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Analytics</h3>
          <p className="text-sm text-gray-500">
            Nous aider à améliorer l'application
          </p>
        </div>
        <Switch
          checked={settings.analytics}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, analytics: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Emails marketing</h3>
          <p className="text-sm text-gray-500">
            Recevoir des conseils et nouveautés
          </p>
        </div>
        <Switch
          checked={settings.marketing}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, marketing: checked })
          }
        />
      </div>
    </div>
  );
}
```

---

## 📄 Documentation Légale

### 1. Politique de Confidentialité

**Éléments obligatoires** :
- Identité du responsable de traitement
- Finalités des traitements
- Base légale
- Destinataires des données
- Durée de conservation
- Droits des utilisateurs
- Contact DPO (Délégué à la Protection des Données)

**Modèle simplifié** :
```markdown
# Politique de Confidentialité - Budget AI

Dernière mise à jour : [DATE]

## 1. Responsable de traitement
[NOM DE L'ENTREPRISE]
[ADRESSE]
Email : privacy@budgetai.app

## 2. Données collectées

### Données obligatoires
- Email (inscription)
- Mot de passe (hashé)

### Données fonctionnelles
- Revenus et dépenses (que vous ajoutez)
- Abonnements
- Objectifs financiers

### Données techniques
- Logs de connexion
- Adresse IP
- Cookies

## 3. Utilisation des données

| Donnée | Finalité | Base légale | Durée |
|--------|----------|-------------|-------|
| Email | Authentification | Contrat | Durée du compte |
| Données financières | Gestion budget | Consentement | Durée du compte |
| Cookies analytics | Amélioration | Consentement | 24 mois |

## 4. Partage des données

Nous ne vendons JAMAIS vos données.

Données partagées uniquement avec :
- OpenAI (conseils IA, anonymisé)
- Vercel (hébergement, UE)
- Supabase (base de données, UE)

## 5. Vos droits

Vous pouvez :
- Accéder à vos données (export)
- Les rectifier (édition)
- Les supprimer (suppression compte)
- Vous opposer au traitement
- Retirer votre consentement

Contact : privacy@budgetai.app

## 6. Sécurité

- Chiffrement HTTPS
- Mots de passe hashés (bcrypt)
- Données sensibles chiffrées (AES-256)
- Hébergement sécurisé (ISO 27001)

## 7. Cookies

| Cookie | Durée | Finalité |
|--------|-------|----------|
| next-auth.session-token | 7 jours | Authentification |
| cookie-consent | 12 mois | Préférences cookies |

## 8. Contact

Pour toute question : privacy@budgetai.app
```

### 2. Conditions Générales d'Utilisation (CGU)

**Éléments clés** :
- Service fourni
- Conditions d'utilisation
- Responsabilités
- Propriété intellectuelle
- Résiliation

### 3. Mentions Légales

**Obligatoire en France** :
- Identité de l'éditeur
- Hébergeur
- Directeur de publication
- Numéro SIRET

---

## ✅ Audits et Certification

### Checklist de Conformité RGPD

#### Phase 1 - MVP
- [ ] Politique de confidentialité publiée
- [ ] CGU publiées
- [ ] Mentions légales
- [ ] Banner de consentement cookies
- [ ] Formulaires avec consentement explicite
- [ ] Chiffrement HTTPS
- [ ] Mots de passe hashés
- [ ] Export de données possible
- [ ] Suppression de compte possible

#### Phase 2 - Pré-commercialisation
- [ ] Registre des traitements complet
- [ ] DPA signé avec OpenAI
- [ ] Anonymisation des données IA
- [ ] Audit de sécurité externe
- [ ] Tests de pénétration
- [ ] Assurance cyber-risque
- [ ] Nommé un DPO (si > 250 employés)

#### Phase 3 - Scale
- [ ] Certification ISO 27001
- [ ] Audit RGPD annuel
- [ ] Bug bounty program
- [ ] SOC 2 compliance (pour B2B)

### Outils de Vérification

**Gratuits** :
- CNIL : Générateur de mentions légales
- https://www.cnil.fr/fr/modele/generateur-de-mentions-legales

**Payants** :
- **Axeptio** : Gestion des consentements (CMP)
- **iubenda** : Générateur de privacy policy
- **OneTrust** : Suite complète (cher)

### Assurances Recommandées

1. **Responsabilité Civile Professionnelle (RC Pro)**
   - Couvre les erreurs de conseil
   - ~200€/an pour micro-entreprise

2. **Cyber-assurance**
   - Couvre les failles de sécurité
   - ~500€/an pour startup

---

## 🚨 En Cas de Violation de Données (Data Breach)

### Obligations Légales (Article 33)

Si fuite de données personnelles :
1. **Notifier la CNIL sous 72h**
2. **Informer les utilisateurs concernés** (si risque élevé)
3. **Documenter l'incident**

### Procédure d'Urgence

```typescript
// src/lib/security-incident.ts

interface SecurityIncident {
  date: Date;
  description: string;
  affectedUsers: number;
  dataTypes: string[];
  actions: string[];
}

/**
 * À exécuter immédiatement en cas de faille
 */
export async function handleSecurityBreach(incident: SecurityIncident) {
  // 1. Logs
  console.error('[SECURITY BREACH]', incident);

  // 2. Notifier l'équipe (Slack, email, SMS)
  await notifySecurityTeam(incident);

  // 3. Si > 72h, préparer notification CNIL
  if (incident.affectedUsers > 0) {
    await generateCNILReport(incident);
  }

  // 4. Email aux utilisateurs
  if (incident.affectedUsers > 0) {
    await notifyAffectedUsers(incident);
  }

  // 5. Documentation
  await prisma.securityIncident.create({
    data: incident,
  });
}
```

### Contact CNIL

- Site : https://www.cnil.fr/
- Téléphone : 01 53 73 22 22
- Formulaire en ligne : https://www.cnil.fr/fr/plaintes

---

## 🎯 Checklist Finale Pré-Lancement

### Sécurité Technique
- [ ] HTTPS activé partout
- [ ] Headers de sécurité configurés
- [ ] Rate limiting actif
- [ ] Validation stricte des inputs
- [ ] Passwords hashés (bcrypt >= 12 rounds)
- [ ] Données sensibles chiffrées
- [ ] Backups automatiques et chiffrées
- [ ] Logs sécurisés (pas de données perso)

### RGPD
- [ ] Politique de confidentialité complète et accessible
- [ ] CGU publiées
- [ ] Mentions légales
- [ ] Banner de consentement
- [ ] Registre des traitements à jour
- [ ] Export de données fonctionnel
- [ ] Suppression de compte fonctionnelle
- [ ] DPA signé avec fournisseurs

### Documentation
- [ ] FAQ sécurité
- [ ] Contact privacy@ fonctionnel
- [ ] Procédure incident de sécurité
- [ ] Plan de réponse aux demandes RGPD

### Tests
- [ ] Test d'export de données
- [ ] Test de suppression de compte
- [ ] Test de changement de consentement
- [ ] Audit de sécurité (externe si possible)

---

**Budget AI sera conforme RGPD et ultra-sécurisé ! 🔐**

*Disclaimer : Ce document ne constitue pas un conseil juridique. Consulter un avocat spécialisé RGPD pour validation finale.*

