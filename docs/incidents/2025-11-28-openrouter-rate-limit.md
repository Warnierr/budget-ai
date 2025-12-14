# Incident – Saturation modèle OpenRouter gratuit

- **Date** : 28 novembre 2025  
- **Statut** : Surveillance  
- **Impact** : `/api/ai/chat` retourne 502 avec erreur 429 côté OpenRouter (`meta-llama/llama-3.2-3b-instruct:free`)

## Symptômes
- Logs serveur : `OpenRouter API error: {"message":"Provider returned error","code":429,"metadata":{"raw":"meta-llama/llama-3.2-3b-instruct:free is temporarily rate-limited upstream."}}`
- UI : impossibilité d’obtenir une réponse de l’assistant IA tant que le modèle gratuit est saturé.

## Analyse
- Les modèles “free” passent par un pool partagé (“provider_name: Venice”). Aux heures de pointe, OpenRouter renvoie 429 (rate limit global) même si notre clé est correcte.
- Aucun souci côté code ou auth : le script `npm run test:ai` fonctionne avec un modèle moins saturé.

## Résolution/contournement
1. Sélectionner un autre modèle via le sélecteur (ex. `openai/gpt-4o-mini`, `anthropic/claude-3.5-sonnet`).
2. Réessayer quelques minutes plus tard quand le quota externe se libère.
3. Ajouter une clé personnelle payante (OpenRouter > Settings > Integrations) pour bénéficier d’un quota dédié et éviter les limitations globales.

## Actions futures
- Surveiller les retours utilisateurs et envisager un fallback automatique vers un autre modèle si 429 répétés.
- Documenter ce comportement dans l’onboarding IA afin d’expliquer les limites des modèles gratuits.

