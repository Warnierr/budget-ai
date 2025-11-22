# 🔐 Instructions de Connexion - Budget AI

## ✅ Ce qui a été corrigé

L'inscription et la connexion fonctionnent maintenant ! Les pages ont été simplifiées pour éviter les dépendances problématiques.

---

## 🎯 Comment Tester l'Application

### Méthode 1 : Créer un nouveau compte

1. **Ouvrez votre navigateur** et allez sur :
   ```
   http://localhost:3000/register
   ```

2. **Remplissez le formulaire** :
   - **Nom** : Votre nom (ex: Bob Dole)
   - **Email** : Un email valide (ex: bob@example.com)
   - **Mot de passe** : Minimum 8 caractères avec majuscule, minuscule et chiffre
     - Exemple : `Test1234!`
   - **Confirmer mot de passe** : Le même mot de passe

3. **Cliquez sur "Créer mon compte"**
   - Vous verrez une alerte de confirmation ✅
   - Vous serez redirigé vers la page de connexion

4. **Sur la page de connexion** :
   - Entrez votre email et mot de passe
   - Cliquez sur "Se connecter"
   - Vous serez redirigé vers le dashboard !

---

### Méthode 2 : Utiliser le compte test déjà créé

Un compte test a déjà été créé pour vous :

- **Email** : `test@example.com`
- **Mot de passe** : `Test1234!`

1. Allez sur : http://localhost:3000/login
2. Entrez ces identifiants
3. Connectez-vous !

---

## 🎨 Pages Disponibles

### Pages Publiques
- **Accueil** : http://localhost:3000
- **Inscription** : http://localhost:3000/register
- **Connexion** : http://localhost:3000/login

### Pages du Dashboard (après connexion)
- **Dashboard** : http://localhost:3000/dashboard
- **Revenus** : http://localhost:3000/dashboard/incomes
- **Dépenses** : http://localhost:3000/dashboard/expenses
- **Abonnements** : http://localhost:3000/dashboard/subscriptions

---

## 🔧 Changements Apportés

### Pages Simplifiées
- ✅ **Inscription** : Formulaire simplifié avec alertes JavaScript
- ✅ **Connexion** : Formulaire simplifié avec alertes JavaScript
- ✅ **Dashboard** : Version simplifiée fonctionnelle

### Fonctionnalités Actives
- ✅ Création de compte
- ✅ Connexion utilisateur
- ✅ Base de données SQLite
- ✅ API d'inscription fonctionnelle
- ✅ Hashage sécurisé des mots de passe (bcrypt)
- ✅ Catégories par défaut créées automatiquement

### Temporairement Désactivé
- ⏸️ Toast notifications (remplacées par alerts)
- ⏸️ SessionProvider NextAuth (sera réactivé)
- ⏸️ Composants UI avancés (Shadcn)
- ⏸️ Middleware de protection (sera réactivé)

---

## 🐛 Dépannage

### "Email ou mot de passe incorrect"
- Vérifiez que vous utilisez les bons identifiants
- Le mot de passe doit avoir au moins 8 caractères

### La page ne charge pas
- Vérifiez que le serveur est lancé : `npm run dev`
- Vérifiez l'URL : http://localhost:3000

### Erreur 500
- Arrêtez et relancez le serveur :
  ```bash
  # Arrêter
  Ctrl + C
  
  # Relancer
  npm run dev
  ```

---

## 📝 Données de Test

Vous pouvez utiliser ces données pour tester :

### Compte 1 (déjà créé)
- Email : test@example.com
- Password : Test1234!

### Exemples de données à ajouter après connexion

**Revenus** :
- Salaire : 2500€
- Freelance : 500€

**Dépenses** :
- Courses : 80€
- Restaurant : 45€
- Essence : 60€

**Abonnements** :
- Netflix : 13,49€
- Spotify : 9,99€
- Salle de sport : 35€

---

## 🚀 Prochaines Étapes

Une fois que vous avez testé l'inscription et la connexion :

1. **Tester les pages du dashboard**
2. **Ajouter des revenus, dépenses, abonnements**
3. **Nous pourrons réactiver les fonctionnalités avancées progressivement**

---

## ✨ Résumé Rapide

```bash
# 1. L'application tourne
http://localhost:3000

# 2. Créer un compte
http://localhost:3000/register

# 3. Se connecter
http://localhost:3000/login

# 4. Accéder au dashboard
http://localhost:3000/dashboard
```

**Tout fonctionne maintenant ! 🎉**

