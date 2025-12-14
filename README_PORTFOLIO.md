# 💼 Budget AI - Projet Portfolio

> Application de gestion budgétaire intelligente avec IA

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-FF6B6B?logo=openai)](https://openrouter.ai/)

---

## 🚀 Démo Live

**[👉 Essayer l'application](https://votre-app.vercel.app)**

**Compte de démonstration** :
- Email : `demo@budget-ai.com`
- Mot de passe : `demo123`

---

## 📋 À Propos

**Budget AI** est une application web full-stack de gestion budgétaire personnelle qui intègre l'intelligence artificielle pour fournir des conseils financiers personnalisés et des projections intelligentes.

### 🎯 Objectif du Projet

Ce projet démontre ma capacité à :
- Architecturer et développer une solution complète
- Intégrer des technologies d'IA générative
- Créer des interfaces utilisateur modernes et intuitives
- Gérer des données complexes avec sécurité
- Déployer et maintenir une application en production

### 🤖 Approche AI-Assisted

**Transparence** : Ce projet a été développé en collaboration avec des agents IA (Cursor AI + Claude Sonnet), démontrant ma maîtrise de l'**AI Engineering** et du **prompt engineering** pour orchestrer efficacement le développement de solutions complexes.

---

## ✨ Fonctionnalités Principales

### 📊 Dashboard Intelligent
- Vue d'ensemble temps réel de votre situation financière
- Graphiques interactifs (Recharts)
- Heatmap de santé financière quotidienne
- Timeline d'activité éditorialisée

### 💰 Gestion Complète
- **Revenus** : Salaires, freelance, revenus passifs
- **Dépenses** : Catégorisation intelligente, suivi en temps réel
- **Abonnements** : Centralisation et optimisation
- **Objectifs** : Suivi d'épargne avec progression visuelle

### 🤖 Intelligence Artificielle
- **Chat conversationnel** : Posez des questions sur vos finances
- **Projections intelligentes** : Prédiction sur 3 mois basée sur vos patterns
- **Conseils personnalisés** : Recommandations d'optimisation
- **Détection d'anomalies** : Alertes sur dépenses inhabituelles

### 📈 Visualisations Avancées
- Évolution du solde (graphiques en aires)
- Répartition des dépenses (camemberts)
- Comparaison mois à mois (barres groupées)
- Heatmap type GitHub Contributions

---

## 🛠️ Stack Technique

### Frontend
```
Next.js 14 (App Router)     # Framework React moderne
TypeScript 5.x              # Type safety
Tailwind CSS                # Styling utility-first
Shadcn/UI                   # Composants UI modernes
Recharts                    # Visualisations de données
React Hook Form + Zod       # Gestion de formulaires
```

### Backend
```
Next.js API Routes          # Backend serverless
Prisma ORM                  # Gestion de base de données
PostgreSQL                  # Base de données relationnelle
NextAuth.js                 # Authentification
```

### IA & Services
```
OpenRouter API              # Accès aux modèles IA
Claude Sonnet 4.5           # LLM pour les conseils
Algorithmes personnalisés   # Projections financières
```

### DevOps & Déploiement
```
Vercel                      # Hosting & CI/CD
Neon                        # PostgreSQL serverless
GitHub Actions              # Automatisation
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐          │
│  │   UI     │  │  Charts  │  │  AI Chat Widget  │          │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘          │
└───────┼─────────────┼─────────────────┼────────────────────┘
        │             │                 │
        └─────────────┴─────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │   Next.js App Router       │
        │  • Server Components       │
        │  • Client Components       │
        │  • API Routes              │
        └─────────────┬──────────────┘
                      │
        ┌─────────────┼──────────────┐
        │  Services   │   Layer      │
        │  • Prisma Client           │
        │  • OpenRouter SDK          │
        │  • Business Logic          │
        └─────────────┬──────────────┘
                      │
        ┌─────────────▼──────────────┐
        │  Data Storage              │
        │  • PostgreSQL (Neon)       │
        └────────────────────────────┘
```

---

## 📸 Screenshots

### Dashboard Principal
![Dashboard](./screenshots/dashboard.png)
*Vue d'ensemble avec graphiques et widgets interactifs*

### Gestion des Dépenses
![Expenses](./screenshots/expenses.png)
*Interface de suivi et catégorisation des dépenses*

### Projections IA
![Projections](./screenshots/projections.png)
*Prédictions intelligentes basées sur l'historique*

### Chat Conversationnel
![AI Chat](./screenshots/ai-chat.png)
*Assistant IA pour répondre à vos questions financières*

---

## 💻 Installation Locale

### Prérequis
- Node.js 18+ installé
- npm ou yarn
- Git

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/budget-ai.git
cd budget-ai
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer .env.local avec vos valeurs
# DATABASE_URL, NEXTAUTH_SECRET, OPENROUTER_API_KEY, etc.
```

4. **Initialiser la base de données**
```bash
# Créer les tables
npx prisma db push

# Seed avec des données de démo (optionnel)
npm run db:seed
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

6. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

---

## 🔐 Sécurité & RGPD

### Mesures Implémentées

✅ **Authentification sécurisée**
- NextAuth.js avec sessions JWT
- Hash bcrypt des mots de passe
- Protection CSRF intégrée

✅ **Protection des données**
- Validation stricte (Zod)
- Sanitization des inputs
- Headers de sécurité (CSP, X-Frame-Options)

✅ **Conformité RGPD**
- Données chiffrées
- Anonymisation pour l'IA
- Export et suppression des données

✅ **API sécurisée**
- Rate limiting
- CORS configuré
- Logs d'audit

---

## 📊 Performance

### Métriques (Lighthouse)

| Métrique | Score |
|----------|-------|
| Performance | 95/100 |
| Accessibility | 92/100 |
| Best Practices | 100/100 |
| SEO | 100/100 |

### Optimisations

- ⚡ Server Components par défaut (moins de JavaScript client)
- 🖼️ Images optimisées avec next/image
- 📦 Code splitting automatique
- 💾 Cache stratégique avec revalidation
- 🎨 Lazy loading des graphiques

---

## 🎓 Compétences Démontrées

### Techniques
- ✅ **Full-Stack Development** (Next.js, TypeScript, Prisma)
- ✅ **AI Engineering** (Intégration LLM, prompt engineering)
- ✅ **UI/UX Design** (Interfaces modernes, responsive)
- ✅ **Architecture** (Clean code, scalabilité)
- ✅ **DevOps** (CI/CD, déploiement, monitoring)
- ✅ **Sécurité** (RGPD, authentification, validation)

### Soft Skills
- 🎯 **Product Thinking** : Conception orientée utilisateur
- 📝 **Documentation** : Code et docs techniques complètes
- 🔄 **Méthodologie Agile** : Itérations, MVP, feedback
- 🤖 **AI-Assisted Development** : Orchestration avec agents IA

---

## 📚 Documentation

- 📖 [Guide de Déploiement](./docs/DEPLOYMENT.md)
- 💼 [Documentation Portfolio](./docs/PORTFOLIO.md)
- 🗺️ [Roadmap](./ROADMAP.md)
- 🏗️ [Architecture](./ARCHITECTURE.md)
- 🔒 [Sécurité & RGPD](./SECURITY_RGPD.md)

---

## 🗺️ Roadmap

### ✅ Phase 1 - MVP (Terminé)
- Dashboard financier
- Gestion revenus/dépenses/abonnements
- Graphiques et visualisations
- Authentification

### ✅ Phase 2 - IA (Terminé)
- Chat conversationnel
- Projections intelligentes
- Conseils personnalisés
- Heatmap quotidienne

### 🔄 Phase 3 - Améliorations (En cours)
- [ ] Connexions bancaires (API Bridge)
- [ ] Application mobile (React Native)
- [ ] Notifications push
- [ ] Export PDF

---

## 👨‍💻 À Propos

**Développé par** : [Votre Nom]  
**Rôle** : Développeur Full-Stack / AI Engineer  
**Date** : Novembre 2025  
**Durée** : 4 semaines

### Contact

- 🌐 Portfolio : [votre-portfolio.com](#)
- 💼 LinkedIn : [linkedin.com/in/votre-profil](#)
- 🐙 GitHub : [github.com/votre-username](#)
- ✉️ Email : votre.email@example.com

---

## 📄 Licence

MIT License - Open Source

Libre d'utilisation pour apprendre et s'inspirer.  
Si vous utilisez ce code, merci de mentionner le projet original.

---

## 🙏 Remerciements

- **Next.js Team** pour ce framework incroyable
- **Vercel** pour l'hébergement gratuit
- **Anthropic** pour Claude (l'IA qui a assisté au développement)
- **Shadcn** pour les composants UI

---

## ⭐ Donnez une Étoile !

Si ce projet vous a plu ou vous a aidé, n'hésitez pas à lui donner une ⭐ sur GitHub !

---

> 💡 **"L'IA a écrit le code, j'ai conçu la solution."**  
> Ce projet démontre qu'en 2025, savoir orchestrer l'IA est aussi important que savoir coder.

