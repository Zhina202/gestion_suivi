# Guide de Migration - Mise à jour du schéma Prisma

## Problème rencontré

Lors de l'exécution de `prisma db push`, vous avez rencontré cette erreur :
```
• Added the required column designation to the Materiel table without a default value
• Added the required column updatedAt to the Materiel table without a default value
• Added the required column updatedAt to the User table without a default value
```

## Solution

Le schéma a été corrigé avec des valeurs par défaut. Vous avez maintenant **deux options** :

### Option 1 : Réinitialiser la base de données (RECOMMANDÉ si les données ne sont pas importantes)

Si les données existantes ne sont pas importantes (données de test), vous pouvez réinitialiser la base :

```bash
yarn run prisma:push --force-reset
```

⚠️ **ATTENTION** : Cette commande supprimera toutes les données existantes !

### Option 2 : Préserver les données existantes

Si vous souhaitez conserver vos données, suivez ces étapes :

1. **Mettre à jour les données existantes manuellement** :

```bash
# Ouvrir la base de données SQLite
sqlite3 prisma/dev.db
```

2. **Exécuter ces commandes SQL dans SQLite** :

```sql
-- Mettre à jour les matériels existants
UPDATE "Materiel" 
SET "designation" = COALESCE("description", "categorie", 'Matériel non désigné')
WHERE "designation" IS NULL OR "designation" = '';

-- Mettre à jour les updatedAt pour les matériels
UPDATE "Materiel" 
SET "updatedAt" = COALESCE("createdAt", datetime('now'))
WHERE "updatedAt" IS NULL;

-- Mettre à jour les updatedAt pour les utilisateurs
UPDATE "User" 
SET "updatedAt" = COALESCE("createdAt", datetime('now'))
WHERE "updatedAt" IS NULL;

-- Vérifier les modifications
SELECT COUNT(*) FROM "Materiel";
SELECT COUNT(*) FROM "User";

-- Quitter SQLite
.quit
```

3. **Appliquer le nouveau schéma** :

```bash
yarn run prisma:push
```

4. **Générer le client Prisma** (si nécessaire) :

```bash
yarn run prisma:generate
```

## Vérification

Après la migration, vérifiez que tout fonctionne :

```bash
# Générer le client Prisma
yarn run prisma:generate

# Démarrer l'application
yarn dev
```

## Notes importantes

- Les colonnes `designation` dans `Materiel` ont maintenant une valeur par défaut : `"Matériel non désigné"`
- Les colonnes `updatedAt` ont maintenant `@default(now())` en plus de `@updatedAt`
- Si vous avez des données importantes, utilisez l'Option 2
- Si vous êtes en développement et que les données sont des tests, l'Option 1 est plus simple

