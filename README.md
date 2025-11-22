# Budget AI - Application de Gestion Budgétaire Intelligente

## 🎯 Vision du Projet

Budget AI est une application web de gestion budgétaire personnelle qui utilise l'intelligence artificielle pour vous aider à mieux gérer vos finances. Elle centralise tous vos abonnements, dépenses prévues et entrées d'argent pour vous donner une vision claire de votre situation financière.

## ✨ Fonctionnalités Principales

### Phase 1 - MVP (Version Minimale Viable)
- 📊 **Dashboard financier** : Vue d'ensemble de votre budget
- 💰 **Suivi des revenus** : Entrées d'argent récurrentes et ponctuelles
- 💳 **Gestion des dépenses** : Dépenses prévues et réalisées
- 🔄 **Abonnements** : Centralisation de tous vos abonnements (YouTube, Revolut, SG, PayPal, etc.)
- 📅 **Projections** : Estimation du budget pour les mois à venir
- 📈 **Analyse** : Graphiques et statistiques de vos dépenses

### Phase 2 - IA et Personnalisation
- 🤖 **Conseils personnalisés** : Recommandations basées sur votre profil
- 💡 **Optimisation budgétaire** : Suggestions d'économies
- 🎯 **Gestion de projets financiers** : Aide à l'épargne pour vos objectifs
- 📝 **Assistant conversationnel** : Posez des questions sur vos finances
- 🔍 **Détection d'anomalies** : Alertes sur les dépenses inhabituelles

### Phase 3 - Automatisation et Intégrations
- 🔗 **Connexions bancaires** : Import automatique des transactions (via APIs)
- 📲 **Notifications intelligentes** : Rappels de paiements
- 📊 **Rapports mensuels** : Bilans automatiques
- 🏷️ **Catégorisation automatique** : IA pour classifier les dépenses

## 🛠️ Stack Technique

### Frontend
- **Framework** : Next.js 14+ (React) avec TypeScript
- **UI** : Tailwind CSS + Shadcn/ui (composants modernes)
- **Graphiques** : Recharts ou Chart.js
- **État** : Zustand (simple et performant)

### Backend
- **Framework** : Next.js API Routes (backend intégré)
- **Alternative** : FastAPI (Python) si séparation backend/frontend
- **Base de données** : PostgreSQL avec Prisma ORM
- **Cache** : Redis (pour les performances)

### IA et RAG
- **LLM** : OpenAI GPT-4 ou Anthropic Claude via API
- **Vector DB** : Pinecone ou Weaviate (pour RAG)
- **Alternative locale** : Ollama (pour données sensibles)

### Sécurité et Infrastructure
- **Authentification** : NextAuth.js ou Clerk
- **Chiffrement** : Données sensibles chiffrées (AES-256)
- **Hosting** : Vercel (frontend) + Supabase ou Railway (backend)
- **Conformité** : RGPD compliant par design

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env.local
# Remplir les variables d'environnement

# Développement
npm run dev

# Production
npm run build
npm start
```

## 📋 Documentation Complète

- [Feuille de route détaillée](./ROADMAP.md)
- [Architecture technique](./ARCHITECTURE.md)
- [Sécurité et RGPD](./SECURITY_RGPD.md)
- [Modèle commercial](./BUSINESS_MODEL.md)

## 🔐 Sécurité et Confidentialité

- Chiffrement de bout en bout pour les données sensibles
- Conformité RGPD totale
- Hébergement en Europe (données françaises/européennes)
- Pas de revente de données
- Transparence totale sur l'utilisation de l'IA

## 📄 Licence

Ce projet est privé. Tous droits réservés.

