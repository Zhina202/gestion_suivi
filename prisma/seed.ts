import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // Créer les types de matériels électoraux standards
  console.log('📦 Création des types de matériels...');
  const typesMateriels = [
    { code: 'URNE', nom: 'Urne électorale', categorie: 'Urne', description: 'Urne pour le dépôt des bulletins de vote' },
    { code: 'ISOLOIR', nom: 'Isoloir', categorie: 'Isoloir', description: 'Cabine d\'isolement pour le vote' },
    { code: 'BULLETIN', nom: 'Bulletin de vote', categorie: 'Document', description: 'Bulletin de vote officiel' },
    { code: 'ENVELOPPE', nom: 'Enveloppe électorale', categorie: 'Document', description: 'Enveloppe pour le bulletin de vote' },
    { code: 'LISTE_ELECTEUR', nom: 'Liste électorale', categorie: 'Document', description: 'Liste des électeurs inscrits' },
    { code: 'CRAYON', nom: 'Crayon de vote', categorie: 'Équipement', description: 'Crayon pour marquer le bulletin' },
    { code: 'TAMPON', nom: 'Tampon encreur', categorie: 'Équipement', description: 'Tampon pour marquer les documents' },
    { code: 'SCELLE', nom: 'Scellé de sécurité', categorie: 'Sécurité', description: 'Scellé pour sécuriser les urnes' },
    { code: 'FICHE_RECENSEMENT', nom: 'Fiche de recensement', categorie: 'Document', description: 'Fiche pour recenser les votes' },
    { code: 'PROCES_VERBAL', nom: 'Procès-verbal', categorie: 'Document', description: 'Procès-verbal de dépouillement' },
  ];

  for (const type of typesMateriels) {
    await prisma.typeMateriel.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    });
  }
  console.log('✅ Types de matériels créés');

  // Créer les 22 régions de Madagascar
  console.log('🗺️  Création des régions de Madagascar...');
  const regions = [
    { code: 'ANT', nom: 'Antananarivo', chefLieu: 'Antananarivo' },
    { code: 'ANT', nom: 'Antsiranana', chefLieu: 'Antsiranana' },
    { code: 'FIA', nom: 'Fianarantsoa', chefLieu: 'Fianarantsoa' },
    { code: 'MAH', nom: 'Mahajanga', chefLieu: 'Mahajanga' },
    { code: 'TOA', nom: 'Toamasina', chefLieu: 'Toamasina' },
    { code: 'TOL', nom: 'Toliara', chefLieu: 'Toliara' },
  ];

  // Note: Pour un système complet, il faudrait ajouter les 22 régions complètes
  // Pour l'instant, on crée quelques régions principales
  for (const region of regions) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: {},
      create: region,
    });
  }
  console.log('✅ Régions créées');

  // Créer quelques districts d'exemple
  console.log('📍 Création de districts d\'exemple...');
  const antananarivo = await prisma.region.findUnique({ where: { code: 'ANT' } });
  
  if (antananarivo) {
    const districts = [
      { code: 'ANT-001', nom: 'Antananarivo-Atsimondrano', regionId: antananarivo.id, chefLieu: 'Antananarivo' },
      { code: 'ANT-002', nom: 'Antananarivo-Avaradrano', regionId: antananarivo.id, chefLieu: 'Antananarivo' },
      { code: 'ANT-003', nom: 'Antananarivo-Renivohitra', regionId: antananarivo.id, chefLieu: 'Antananarivo' },
    ];

    for (const district of districts) {
      await prisma.district.upsert({
        where: { code: district.code },
        update: {},
        create: district,
      });
    }
    console.log('✅ Districts créés');
  }

  console.log('✨ Seed terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

