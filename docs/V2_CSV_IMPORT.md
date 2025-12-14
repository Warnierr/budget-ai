# Budget AI V2 - Import CSV avec Classification IA

## Objectif

Permettre aux utilisateurs d'importer leurs releves bancaires (CSV) pour alimenter automatiquement leur budget, avec classification IA des transactions.

## Changelog

### 2025-12-14 - Initialisation

- [x] Creation branche `feature/csv-import` depuis `develop`
- [x] Schema Prisma : tables ImportedTransaction, ImportRule, ImportBatch
- [x] Parsers CSV : generique, Revolut, SG, BNP, Boursorama
- [x] API upload /api/import/csv (POST + GET historique)
- [x] Interface upload drag & drop (/dashboard/import)
- [x] Lien dans la sidebar
- [ ] Parser Revolut
- [ ] Categorisation IA
- [ ] Interface validation
- [ ] Detection recurrences
- [ ] Regles utilisateur

---

## Architecture

```
Upload CSV
    |
    v
+-------------------+
| Detection format  |  <-- Quel parser utiliser ?
+-------------------+
    |
    v
+-------------------+
| Parsing           |  <-- Extraction date/montant/libelle
+-------------------+
    |
    v
+-------------------+
| Deduplication     |  <-- Eviter doublons
+-------------------+
    |
    v
+-------------------+
| Categorisation IA |  <-- OpenRouter classifie
+-------------------+
    |
    v
+-------------------+
| Detection recur.  |  <-- Abonnements, salaires
+-------------------+
    |
    v
+-------------------+
| Validation user   |  <-- Correction si besoin
+-------------------+
    |
    v
+-------------------+
| Import final      |  <-- Sauvegarde en base
+-------------------+
```

## Banques supportees

| Banque | Format | Status |
|--------|--------|--------|
| Generique | CSV avec mapping | A faire |
| Revolut | CSV export | A faire |
| Societe Generale | CSV export | A faire |
| BNP Paribas | CSV export | Prevu |
| Boursorama | CSV export | Prevu |

## Decisions techniques

### Pourquoi pas de PDF ?

L'OCR de PDF est complexe et peu fiable. Les exports CSV sont disponibles sur toutes les banques et garantissent une extraction parfaite.

### Pourquoi categorisation cote serveur ?

- Les regles utilisateur sont en base de donnees
- Le cache des categories evite des appels IA redondants
- Securite : pas d'appel API depuis le client

### Gestion des doublons

Contrainte unique sur : `userId + bankAccountId + rawDate + rawAmount + rawLabel`

Si une transaction identique existe deja, elle est ignoree silencieusement.

---

## Tests

### Fichier CSV de test

```csv
Date,Description,Amount
2024-01-15,CARREFOUR MARKET,-45.67
2024-01-16,SPOTIFY,-9.99
2024-01-17,VIREMENT SALAIRE,2500.00
2024-01-18,AMAZON PRIME,-6.99
```

### Commandes

```bash
# Valider avant push
npm run validate

# Tester en local
npm run dev
# Puis uploader le fichier test via l'interface
```
