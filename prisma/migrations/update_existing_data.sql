-- Script SQL pour mettre à jour les données existantes avant la migration
-- Ce script doit être exécuté AVANT de faire `prisma db push`

-- Mettre à jour les matériels existants qui n'ont pas de designation
UPDATE "Materiel" 
SET "designation" = COALESCE("description", "categorie", 'Matériel non désigné')
WHERE "designation" IS NULL OR "designation" = '';

-- Mettre à jour les updatedAt pour les matériels existants
UPDATE "Materiel" 
SET "updatedAt" = COALESCE("createdAt", datetime('now'))
WHERE "updatedAt" IS NULL;

-- Mettre à jour les updatedAt pour les utilisateurs existants
UPDATE "User" 
SET "updatedAt" = COALESCE("createdAt", datetime('now'))
WHERE "updatedAt" IS NULL;

