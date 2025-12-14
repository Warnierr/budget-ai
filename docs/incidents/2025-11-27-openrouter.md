# Incident – Intégration OpenRouter

- **Date** : 27 novembre 2025  
- **Statut** : Résolu  
- **Impact** : Assistant IA inutilisable (`/api/ai/chat` → 401)

## Symptômes
- Réponses API : `{"error":{"message":"No cookie auth credentials found","code":401}}`
- Logs Next : `OPENROUTER_API_KEY is not configured correctement`
- Plusieurs redémarrages `npm run dev` sans effet.

## Analyse des causes
1. **Cache Next.js** : le module `src/lib/openrouter.ts` restait chargé avec l'ancienne valeur `%OPENROUTER_API_KEY%`.
2. **`.env.local` corrompu** : écritures PowerShell injectaient des placeholders ou un encodage invalide.
3. **Pas de fallback** : aucune possibilité de valider la clé hors Next.js.

## Résolution
- Ajout de `src/lib/server-env.ts` (ordre de recherche : env var → `OPENROUTER_API_KEY_FILE` → `config/openrouter.key`, filtrage des placeholders, cache).
- Refactor de `src/lib/openrouter.ts` pour utiliser exclusivement ce helper.
- Nouveau fichier ignoré `config/openrouter.key` + exemple versionné.
- Script `npm run test:ai` (`scripts/test-openrouter.mjs`) pour vérifier la clé en CLI.
- Documentation (README + ce dossier) pour décrire la procédure.

## Résultat
- `npm run test:ai` renvoie `✅ Réponse OpenRouter: pong`.
- Assistant IA opérationnel dès création du fichier `config/openrouter.key`.
- Procédure reproductible, indépendante du cache Next.js.

## Actions futures
- Ajouter un check CI pour s'assurer qu'une clé est fournie avant déploiement.
- Étendre le dossier `docs/incidents/` pour consigner tous les futurs problèmes majeurs.

