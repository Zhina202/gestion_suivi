# Guide de Migration vers le Nouveau Schéma CENI

## 🎯 Vue d'ensemble

Ce guide explique comment migrer vers le nouveau schéma de base de données professionnel pour la gestion des matériels électoraux de la CENI Madagascar.

## 📋 Prérequis

1. **Sauvegarder votre base de données actuelle**
   ```bash
   cp prisma/dev.db prisma/dev.db.backup
   ```

2. **Vérifier que vous avez les dépendances nécessaires**
   ```bash
   npm install
   ```

## 🚀 Étapes de Migration

### Étape 1: Générer le nouveau client Prisma

```bash
npm run prisma:generate
```

### Étape 2: Créer la migration

```bash
npm run prisma:migrate -- --name migrate_to_ceni_schema
```

**⚠️ ATTENTION**: Si vous avez des données existantes, vous devrez peut-être créer une migration personnalisée pour préserver les données.

### Étape 3: Exécuter le seed pour les données de base

```bash
npm run prisma:seed
```

Cela va créer:
- Les types de matériels électoraux standards
- Les régions principales de Madagascar
- Des districts d'exemple

### Étape 4: Vérifier la migration

```bash
npm run prisma:studio
```

Ouvrez Prisma Studio pour vérifier que toutes les tables ont été créées correctement.

## 📊 Changements Principaux

### Modèles Renommés/Refactorisés

1. **MaterielPdf → Expedition**
   - `design` → `designation`
   - `lieu_depart` → `lieuDepart`
   - `lieu_arrive` → `lieuArrive`
   - `date_depart` → `dateDepart` (maintenant DateTime)
   - `date_arrive` → `dateArrive` (maintenant DateTime)
   - `status` (Int) → `status` (Enum ExpeditionStatus)
   - Nouveau champ `numero` (format: EXP-YYYY-XXXXXX)

2. **Materiel**
   - `design` → `designation`
   - `quantity` → `quantite`
   - Nouveaux champs: `quantiteRecue`, `quantiteUtilisee`
   - Nouveau champ `statut` (Enum MaterielStatut)
   - Relation avec `TypeMateriel`

### Nouveaux Modèles

1. **Region** - Les 22 régions de Madagascar
2. **District** - Les 119 districts
3. **Commune** - Les communes
4. **CentreVote** - Les centres de vote
5. **TypeMateriel** - Catalogue des types de matériels électoraux
6. **Mouvement** - Historique des mouvements et changements de statut

### Nouveaux Enums

- **ExpeditionStatus**: BROUILLON, EN_TRANSIT, RECU, DISTRIBUE, RETOURNE, ENDOMMAGE, PERDU, ARCHIVE
- **MaterielStatut**: BON, ENDOMMAGE, MANQUANT, PERDU, REPARE
- **UserRole**: ADMIN, DIRECTEUR, RESPONSABLE, AGENT
- **MouvementType**: CREATION, ENVOI, RECEPTION, DISTRIBUTION, RETOUR, CHANGEMENT_STATUT, CORRECTION

## 🔄 Compatibilité

Le code inclut des fonctions de compatibilité pour faciliter la migration progressive:

- `createEmptyMaterielPdf()` → `createEmptyExpedition()`
- `getMaterielPdfByEmail()` → `getExpeditionsByEmail()`
- `getMaterielPdfById()` → `getExpeditionById()`
- `updatedMaterielPdf()` → `updateExpedition()`
- `deleteMaterielPdf()` → `deleteExpedition()`

Ces fonctions continueront de fonctionner pendant la période de transition.

## 📝 Mapping des Statuts

| Ancien (Int) | Nouveau (Enum) |
|--------------|----------------|
| 1            | BROUILLON      |
| 2            | EN_TRANSIT     |
| 3            | RECU           |
| 4            | ENDOMMAGE      |
| 5            | PERDU          |

## 🛠️ Script de Migration des Données (Optionnel)

Si vous avez des données existantes à migrer, vous pouvez créer un script personnalisé:

```typescript
// scripts/migrate-data.ts
import prisma from '../app/lib/prisma';

async function migrateData() {
  // Récupérer tous les MaterielPdf
  const oldMaterielPdfs = await prisma.$queryRaw`
    SELECT * FROM MaterielPdf
  `;

  // Convertir et insérer dans Expedition
  for (const old of oldMaterielPdfs) {
    await prisma.expedition.create({
      data: {
        id: old.id,
        numero: `EXP-2024-${old.id}`,
        designation: old.design,
        // ... mapper les autres champs
      }
    });
  }
}
```

## ✅ Vérification Post-Migration

1. Vérifier que toutes les expéditions ont été migrées
2. Vérifier que tous les matériels sont liés aux bonnes expéditions
3. Tester les fonctionnalités principales:
   - Création d'expédition
   - Modification d'expédition
   - Suppression d'expédition
   - Filtrage et recherche

## 🆘 En cas de problème

1. Restaurer la sauvegarde:
   ```bash
   cp prisma/dev.db.backup prisma/dev.db
   ```

2. Vérifier les logs de migration dans `prisma/migrations/`

3. Consulter la documentation Prisma: https://www.prisma.io/docs

## 📚 Prochaines Étapes

Après la migration réussie:

1. Mettre à jour les composants UI pour utiliser les nouveaux noms
2. Ajouter la gestion des régions/districts dans l'interface
3. Implémenter la traçabilité avec les mouvements
4. Ajouter les rapports et statistiques

