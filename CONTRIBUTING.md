# Guide de Contribution - Budget AI

## 🌿 Strategie de Branches

Nous utilisons une version simplifiee de Git Flow :

```
main (production)
  └── develop (staging/integration)
        ├── feature/nom-feature
        ├── fix/nom-fix
        └── hotfix/nom-hotfix (depuis main, pour urgences)
```

### Branches principales

| Branche | Description | Deploiement |
|---------|-------------|-------------|
| `main` | Code en production, stable | Production (Vercel) |
| `develop` | Branche d'integration, pre-prod | Preview (Vercel) |

### Branches de travail

| Prefixe | Usage | Exemple |
|---------|-------|---------|
| `feature/` | Nouvelles fonctionnalites | `feature/import-csv` |
| `fix/` | Corrections de bugs | `fix/login-redirect` |
| `hotfix/` | Corrections urgentes en prod | `hotfix/security-patch` |
| `refactor/` | Refactoring sans changement fonctionnel | `refactor/api-structure` |
| `docs/` | Documentation uniquement | `docs/api-readme` |

## 🔄 Workflow de Developpement

### 1. Nouvelle fonctionnalite

```bash
# Partir de develop a jour
git checkout develop
git pull origin develop

# Creer la branche feature
git checkout -b feature/ma-nouvelle-feature

# Developper, commiter...
git add .
git commit -m "feat: description du changement"

# Pousser et creer une PR vers develop
git push -u origin feature/ma-nouvelle-feature
```

### 2. Creer une Pull Request

1. Aller sur GitHub
2. Creer une PR de `feature/xxx` vers `develop`
3. Remplir le template de PR
4. Attendre que la CI passe (lint, typecheck, build)
5. Verifier la preview Vercel
6. Merge apres review

### 3. Release vers Production

```bash
# Quand develop est pret pour prod
git checkout main
git pull origin main
git merge develop
git push origin main

# Optionnel: tagger la version
git tag v1.2.0
git push origin v1.2.0
```

## 📝 Conventions de Commits

Nous suivons [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope?): description

[body optionnel]

[footer optionnel]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalite |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage (pas de changement de code) |
| `refactor` | Refactoring |
| `perf` | Amelioration des performances |
| `test` | Ajout/modification de tests |
| `chore` | Maintenance (deps, CI, etc.) |

### Exemples

```bash
feat(dashboard): add expense heatmap visualization
fix(auth): resolve session expiration issue
docs: update API documentation
chore(deps): upgrade Next.js to 14.2
```

## 🧪 Avant de Commit

```bash
# Verifier que tout passe
npm run validate

# Ou separement :
npm run lint      # ESLint
npm run typecheck # TypeScript
npm run build     # Build Next.js
```

## 🚀 Environnements

| Environnement | Branche | URL |
|---------------|---------|-----|
| Production | `main` | budget-ai.vercel.app |
| Preview | PRs | preview-*.vercel.app |
| Local | - | localhost:3000 |

## 📦 Versioning

Nous utilisons [Semantic Versioning](https://semver.org/) :

- **MAJOR** (v2.0.0) : Breaking changes
- **MINOR** (v1.1.0) : Nouvelles fonctionnalites retrocompatibles
- **PATCH** (v1.0.1) : Bug fixes retrocompatibles

## 🔐 Variables d'Environnement

Ne jamais commiter de secrets ! Utiliser :

- `.env.local` pour le developpement local (gitignore)
- Vercel Environment Variables pour staging/prod

Variables requises :
- `DATABASE_URL` - URL PostgreSQL (Neon)
- `NEXTAUTH_SECRET` - Secret pour les sessions
- `NEXTAUTH_URL` - URL de l'app
- `OPENROUTER_API_KEY` - Cle API OpenRouter

## 🆘 Besoin d'Aide ?

1. Consulter la documentation dans `/docs`
2. Ouvrir une issue sur GitHub
3. Contacter le mainteneur du projet
