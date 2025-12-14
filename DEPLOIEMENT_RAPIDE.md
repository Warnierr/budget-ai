# ⚡ Déploiement Rapide - Budget AI

> Guide ultra-condensé pour mettre en ligne en 30 minutes

---

## 🎯 Checklist Expresse

### 1. Prérequis (5 minutes)

- [ ] Compte GitHub existant
- [ ] Code sur GitHub (public ou privé)
- [ ] Créer compte [Vercel](https://vercel.com) (avec GitHub)
- [ ] Créer compte [Neon](https://neon.tech) (avec GitHub)
- [ ] Créer compte [OpenRouter](https://openrouter.ai)

### 2. Base de Données Neon (5 minutes)

1. Sur [console.neon.tech](https://console.neon.tech) :
   - **Create Project** → `budget-ai-portfolio`
   - **Region** → `Europe (Frankfurt)`
   - **Copy** la connection string

2. Tester localement :
```bash
# Dans .env.local
DATABASE_URL="postgresql://user:pass@....neon.tech/neondb?sslmode=require"

# Initialiser
npx prisma db push
npm run db:seed

# Si ça marche ✅, passer à l'étape suivante
```

### 3. Variables d'Environnement (5 minutes)

Générer le secret NextAuth :
```bash
openssl rand -base64 32
# Copier le résultat
```

Préparer ces 4 variables :

```bash
# 1. DATABASE_URL (copié depuis Neon)
DATABASE_URL="postgresql://xxx@xxx.neon.tech/neondb?sslmode=require"

# 2. NEXTAUTH_URL (sera l'URL Vercel, mettre temporairement)
NEXTAUTH_URL="https://budget-ai-xxx.vercel.app"

# 3. NEXTAUTH_SECRET (généré ci-dessus)
NEXTAUTH_SECRET="votre-secret-de-32-caracteres"

# 4. OPENROUTER_API_KEY (de openrouter.ai)
OPENROUTER_API_KEY="sk-or-v1-xxxxxxxxxx"
```

### 4. Déploiement Vercel (10 minutes)

1. Sur [vercel.com/new](https://vercel.com/new) :
   - **Import Git Repository**
   - Sélectionner votre repo `Budget AI`

2. **Avant de cliquer Deploy** :
   - Cliquer **Environment Variables**
   - Ajouter les 4 variables ci-dessus
   - ⚠️ Pour `NEXTAUTH_URL`, mettre d'abord `https://budget-ai.vercel.app`

3. **Deploy** → Attendre 2-3 minutes

4. **Après déploiement** :
   - Copier l'URL réelle (ex: `budget-ai-abc123.vercel.app`)
   - Retourner dans **Settings** > **Environment Variables**
   - **Modifier** `NEXTAUTH_URL` avec la vraie URL
   - **Redeploy** depuis l'onglet Deployments

### 5. Vérifications (5 minutes)

Tester ces pages :

```bash
# Health check
curl https://votre-app.vercel.app/api/health
# Doit retourner: {"status":"ok","database":"connected"}

# Page d'accueil
https://votre-app.vercel.app
# Doit charger

# Connexion
Email: demo@budget-ai.com
Password: demo123
# Doit fonctionner
```

---

## 🚨 Résolution Express de Problèmes

### ❌ "Database connection failed"

```bash
# Vérifier dans Vercel > Settings > Environment Variables
# Que DATABASE_URL contient bien ?sslmode=require à la fin

# Si non, ajouter manuellement :
postgresql://xxx?sslmode=require

# Puis Redeploy
```

### ❌ "NextAuth URL mismatch"

```bash
# Dans Vercel > Settings > Environment Variables
# NEXTAUTH_URL doit être EXACTEMENT l'URL de prod

# Exemple :
NEXTAUTH_URL=https://budget-ai-abc123.vercel.app

# PAS de / à la fin !
# Puis Redeploy
```

### ❌ "Build failed"

```bash
# Tester localement :
npm run build

# Si ça échoue localement, corriger l'erreur
# Si ça marche localement, vérifier les logs Vercel
```

### ❌ "AI not working"

```bash
# Vérifier dans Vercel > Environment Variables
# Que OPENROUTER_API_KEY existe et commence par sk-or-v1-

# Vérifier le crédit sur openrouter.ai
```

---

## ✅ C'est Fini !

**Votre app est en ligne** 🎉

### Prochaines étapes :

1. **Mettre à jour le README** avec l'URL live
2. **Tester toutes les fonctionnalités**
3. **Partager sur LinkedIn**
4. **Ajouter au portfolio**

---

## 📞 Besoin d'Aide ?

**Documentation complète** : [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

**Erreurs communes** :
- 90% des erreurs = variables d'environnement mal configurées
- Toujours vérifier les logs Vercel (onglet Deployments > Logs)
- Tester localement d'abord avec `npm run build`

---

**Temps total** : ~30 minutes ⏱️  
**Coût** : 0€ (tout gratuit) 💰  
**Complexité** : ⭐⭐☆☆☆ (Facile)

