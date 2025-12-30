# 🚀 Budget AI - Présentation du Projet

**🔴 Live Demo :** [https://budget-ai-portfolio.vercel.app](https://budget-ai-portfolio.vercel.app)

Ce document résume l'ensemble du projet **Budget AI**. Utilisez-le comme base pour vos entretiens, présentations clients ou pitchs.

---

## 💡 Le Pitch (En 30 secondes)
"Budget AI n'est pas juste un tableau de bord financier. C'est un **assistant personnel intelligent** qui transforme des lignes de dépenses brutes en conseils stratégiques.
Contrairement aux applications bancaires classiques qui regardent le passé, Budget AI se concentre sur **le futur** : il prédit votre solde de fin de mois, identifie vos abonnements inutiles et vous coache en temps réel via une IA conversationnelle, le tout dans une interface ultra-moderne et entièrement sécurisée."

---

## 🛠️ Stack Technique (L'Architecture)

Le projet est construit sur une architecture **Moderne, Type-Safe et Serverless**.

### 🎨 Frontend (Expérience Utilisateur)
*   **Framework** : **Next.js 14** (App Router) pour le rendu hybride (SSR/CSR) et la rapidité.
*   **Langage** : **TypeScript** pour la robustesse et la maintenance.
*   **Styling** : **Tailwind CSS** combiné à une architecture de **Variables CSS sémantiques** pour le système de thèmes (Neon, Ocean, Light...).
*   **UI Library** : **Shadcn/UI** (base Radix) pour des composants accessibles et customisables.
*   **Animations** : **Framer Motion** pour les transitions fluides et l'effet "premium".
*   **Data Viz** : **Recharts** pour les graphiques financiers interactifs.

### ⚙️ Backend & Data (Logique & Stockage)
*   **API** : **Next.js API Routes** (Serverless functions). Pas de serveur à gérer, scaling infini.
*   **Base de données** : **PostgreSQL**, hébergée sur **Neon.tech** (Serverless Postgres).
*   **ORM** : **Prisma** pour l'interaction typée avec la base de données et les migrations.
*   **Auth** : **NextAuth.js (V5)** avec Google Provider et Email/Password.

### 🧠 Intelligence Artificielle (Le Cœur)
*   **Fournisseur** : **OpenRouter API** (Agrégateur de modèles) permettant de changer de modèle à la volée (Claude 3.5 Sonnet, GPT-4o, Llama 3).
*   **Streaming** : Implémentation du **Server-Sent Events (SSE)** pour des réponses IA mot-à-mot en temps réel.
*   **Privacy Layer** : Une couche logicielle personnalisée (`ai-privacy.ts`) qui **anonymise** toutes les données financières (suppression des noms, comptes, lieux) AVANT l'envoi à l'IA.

---

## ✨ Fonctionnalités Clés (Ce que ça fait)

### 1. 🤖 Assistant Financier Contextuel (La "Killer Feature")
*   **Chat en temps réel** : Discutez avec vos finances ("Combien j'ai dépensé en Uber ce mois-ci ?").
*   **Contexte Automatique** : L'IA "voit" vos dépenses (anonymisées) sans qu'on ait besoin de lui copier-coller.
*   **Conseiller Proactif** : Analyse automatique selon la règle 50/30/20 (Besoins/Envies/Épargne) et alerte en cas de dérive.
*   **Transparence** : Badges "Données utilisées" pour rassurer l'utilisateur sur ce que l'IA sait.

### 2. 🔮 Prédictions & Intelligence
*   **Projection de Solde** : Calcule le "Reste à Vivre" réel en déduisant les factures à venir (Loyer, Netflix...) du solde actuel.
*   **Détection d'Abonnements** : Algorithme qui repère les paiements récurrents et les isole pour mieux les gérer.
*   **Heatmap de Dépenses** : Visualisation type "GitHub" de vos jours de dépenses intenses.

### 3. 🎨 Expérience Utilisateur (UX) "Wow"
*   **Design Glassmorphism** : Interface translucide, flous (blur), dégradés néons.
*   **Thèmes Dynamiques** : L'utilisateur peut changer l'ambiance instantanément (Neon Pulse, Ocean Deep, Forest Zen...).
*   **Import Intelligent** : Drag & Drop de fichiers CSV bancaires avec détection automatique des colonnes.

---

## 🏆 Défis Techniques Relevés (Pour briller en entretien)

1.  **Le Streaming IA & Next.js** : *"J'ai dû configurer manuellement la gestion des `ReadableStream` entre le serveur et le client pour obtenir cet effet 'machine à écrire' fluide sans bloquer l'interface."*
2.  **Confidentialité des Données (Privacy)** : *"Le plus gros défi était d'utiliser des LLMs publics sans compromettre les données bancaires. J'ai créé un middleware d'anonymisation qui remplace les noms propres par des tokens génériques avant l'envoi à l'API."*
3.  **Système de Thèmes CSS** : *"Au lieu d'utiliser de simples classes, j'ai architecturé le CSS autour de variables CSS globales injectées par un Context React, ce qui permet de changer tout le 'look & feel' (couleurs, ombres, lueurs) sans recharger la page."*

---

## 📈 Potentiel d'Évolution (Roadmap)
*   [ ] **Connexion Bancaire Directe** (via GoCardless/Plaid) pour ne plus importer de CSV.
*   [ ] **Mode Multi-Worskapce** (Budget Perso / Budget Pro).
*   [ ] **Application Mobile** (via React Native ou PWA).
