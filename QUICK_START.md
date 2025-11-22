# 🚀 Guide de Démarrage Rapide - Budget AI

## ⚡ Lancement en 3 Commandes

```bash
# 1. Installer
npm install

# 2. Créer la base de données
npm run db:generate && npm run db:push

# 3. Lancer
npm run dev
```

**URL** : http://localhost:3000

---

## 🔑 Connexion Rapide

### Compte de Test Disponible
- **Email** : `test@gmail.com`
- **Password** : `Password123!`

### Ou Créer Votre Propre Compte
1. Aller sur http://localhost:3000/register
2. Remplir le formulaire
3. Se connecter ensuite

---

## 📊 Stack Technique

| Composant | Technologie | Pourquoi |
|-----------|-------------|----------|
| **Framework** | Next.js 14 | Full-stack, moderne, performant |
| **Langage** | TypeScript | Sécurité du code, autocomplétion |
| **Base de données** | SQLite (dev) | Simple, zéro config |
| **ORM** | Prisma | Type-safe, excellent avec TypeScript |
| **Auth** | API maison | Simplifié pour MVP |
| **UI** | Tailwind CSS | Rapide, moderne, responsive |
| **Hash** | bcrypt | Standard industrie pour passwords |

---

## 🗄️ Structure de la BDD

```
User (utilisateurs)
├── Income (revenus)
├── Expense (dépenses)
├── Subscription (abonnements)
├── Category (catégories)
├── Budget (budgets par catégorie)
└── Goal (objectifs financiers)
```

---

## 🛠️ Commandes Utiles

### Développement
```bash
npm run dev              # Serveur de dev (port 3000)
npm run db:studio        # Interface graphique BDD (port 5555)
npm run lint             # Vérifier le code
```

### Base de Données
```bash
npm run db:generate      # Générer le client Prisma
npm run db:push          # Créer/MAJ la BDD (dev)
npm run db:migrate       # Créer une migration (prod)
```

### Scripts Utiles
```bash
node check-users.js      # Voir tous les utilisateurs
node reset-password.js   # Réinitialiser un mot de passe
node test-login.js       # Tester un login
```

### En Cas de Problème
```bash
# Nettoyer le cache Next.js
Remove-Item -Path ".next" -Recurse -Force
npm run dev

# Réinitialiser la BDD
Remove-Item dev.db
npm run db:push
```

---

## 📍 Pages Disponibles

### Publiques
- **/** - Page d'accueil
- **/register** - Inscription
- **/login** - Connexion

### Dashboard (connecté)
- **/dashboard** - Vue d'ensemble ✅ FONCTIONNEL
- **/dashboard/incomes** - Revenus ⏳ À tester
- **/dashboard/expenses** - Dépenses ⏳ À tester
- **/dashboard/subscriptions** - Abonnements ⏳ À tester

---

## 🐛 Problèmes Connus et Solutions

### Problème : Erreur 401 à la connexion
**Solution** : Réinitialiser le mot de passe
```bash
node reset-password.js
```

### Problème : Erreur EPERM au lancement
**Solution** : Nettoyer le cache
```bash
Remove-Item -Path ".next" -Recurse -Force
npm run dev
```

### Problème : Page reste sur /login après connexion
**Solution** : Cliquer sur le bouton "Accéder au Dashboard"
(La redirection automatique JavaScript est bloquée par la sécurité)

### Problème : Les pages revenus/dépenses/abonnements ne fonctionnent pas
**Solution** : Elles utilisent des composants complexes, il faudra les simplifier
(À faire dans la prochaine session)

---

## ✅ Checklist de Vérification

Avant chaque session, vérifier que :
- [ ] Node.js est installé
- [ ] Le serveur n'est pas déjà lancé (port 3000 libre)
- [ ] Le fichier `.env` ou `.env.local` existe
- [ ] La base de données `dev.db` existe
- [ ] Les `node_modules` sont installés

---

## 📖 Documentation Complète

Pour plus de détails, voir :
- **SESSION_LOG.md** - Journal complet de cette session
- **ARCHITECTURE.md** - Architecture technique
- **ROADMAP.md** - Feuille de route
- **README_DEV.md** - Guide développeur complet

---

## 🎯 Prochaines Actions

### Cette Semaine
1. Tester les pages revenus/dépenses/abonnements
2. Simplifier celles qui ne fonctionnent pas
3. Connecter le dashboard aux vraies données
4. Ajouter quelques données de test

### Semaine Prochaine
1. Ajouter les graphiques (Recharts)
2. Créer la page des objectifs
3. Améliorer l'UX
4. Préparer le déploiement sur Vercel

---

**Budget AI est lancé ! 🚀💰**

*Dernière mise à jour : 22 Novembre 2024*

