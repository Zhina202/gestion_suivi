# Migration vers le nouveau schéma CENI

## Étapes de migration

1. Sauvegarder la base de données existante
2. Créer les nouvelles tables
3. Migrer les données existantes :
   - `MaterielPdf` → `Expedition`
   - `Materiel` → `Materiel` (avec nouvelles relations)
   - `User` → `User` (avec nouveau champ `role`)

## Commandes à exécuter

```bash
# Générer le client Prisma avec le nouveau schéma
npx prisma generate

# Créer la migration
npx prisma migrate dev --name migrate_to_ceni_schema

# Ou pour production
npx prisma migrate deploy
```

## Mapping des données

### MaterielPdf → Expedition
- `id` → `id`
- `design` → `designation`
- `lieu_depart` → `lieuDepart`
- `lieu_arrive` → `lieuArrive`
- `date_depart` → `dateDepart` (convertir String → DateTime)
- `date_arrive` → `dateArrive` (convertir String → DateTime)
- `status` (Int) → `status` (Enum ExpeditionStatus)
- `nom_emetteur` → `nomEmetteur`
- `adresse_emetteur` → `adresseEmetteur`
- `nom_recepteur` → `nomRecepteur`
- `adresse_recepteur` → `adresseRecepteur`
- Générer `numero` unique (ex: EXP-2024-{id})

### Materiel → Materiel
- `id` → `id`
- `design` → `designation`
- `categorie` → `categorie` (temporaire, migrer vers TypeMateriel plus tard)
- `description` → `description`
- `quantity` → `quantite`
- `materielPdfId` → `expeditionId`

### Statuts
- 1 → BROUILLON
- 2 → EN_TRANSIT
- 3 → RECU
- 4 → ENDOMMAGE
- 5 → PERDU

