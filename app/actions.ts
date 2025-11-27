"use server"

import prisma from "./lib/prisma";
import { randomBytes } from "crypto";
import { 
  Expedition, 
  Materiel, 
  ExpeditionStatus, 
  MaterielStatut,
  ExpeditionFormData,
  MaterielFormData
} from "@/type";

// ============================================
// GESTION DES UTILISATEURS
// ============================================

export async function checkAndAddUser(email: string, name: string) {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!existingUser && name) {
      await prisma.user.create({
        data: {
          email,
          name
        }
      });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification/ajout de l'utilisateur:", error);
    throw error;
  }
}

// ============================================
// GESTION DES EXPÉDITIONS (remplace MaterielPdf)
// ============================================

/**
 * Génère un numéro d'expédition unique au format EXP-YYYY-XXXXXX
 */
const generateExpeditionNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  let uniqueId = "";
  let isUnique = false;

  while (!isUnique) {
    const randomPart = randomBytes(3).toString('hex').toUpperCase();
    uniqueId = `EXP-${year}-${randomPart}`;

    const existing = await prisma.expedition.findUnique({
      where: { numero: uniqueId }
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return uniqueId;
};

/**
 * Crée une nouvelle expédition vide
 */
export async function createEmptyExpedition(
  email: string, 
  designation: string
): Promise<Expedition> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const numero = await generateExpeditionNumber();

    const expedition = await prisma.expedition.create({
      data: {
        numero,
        designation,
        lieuDepart: "",
        lieuArrive: "",
        status: ExpeditionStatus.BROUILLON,
        userId: user.id
      },
      include: {
        materiels: true,
        user: true,
        region: true,
        district: true,
        commune: true,
        centreVote: true
      }
    });

    return expedition as Expedition;
  } catch (error) {
    console.error("Erreur lors de la création de l'expédition:", error);
    throw error;
  }
}

/**
 * Récupère toutes les expéditions d'un utilisateur
 */
export async function getExpeditionsByEmail(email: string): Promise<Expedition[]> {
  if (!email) return [];
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        expeditions: {
          include: {
            materiels: {
              include: {
                typeMateriel: true
              }
            },
            user: true,
            region: true,
            district: true,
            commune: true,
            centreVote: true,
            mouvements: {
              orderBy: { date: 'desc' },
              take: 10,
              include: { user: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) return [];

    // Mise à jour automatique des statuts si nécessaire
    const today = new Date();
    const updatedExpeditions = await Promise.all(
      user.expeditions.map(async (expedition: any) => {
        // Si l'expédition est en transit et que la date d'arrivée est passée sans réception
        if (
          expedition.status === ExpeditionStatus.EN_TRANSIT &&
          expedition.dateArrive &&
          new Date(expedition.dateArrive) < today
        ) {
          const updated = await prisma.expedition.update({
            where: { id: expedition.id },
            data: { status: ExpeditionStatus.PERDU },
            include: {
              materiels: {
                include: { typeMateriel: true }
              },
              user: true,
              region: true,
              district: true,
              commune: true,
              centreVote: true
            }
          });
          
          // Créer un mouvement pour tracer ce changement
          await prisma.mouvement.create({
            data: {
              expeditionId: expedition.id,
              type: "CHANGEMENT_STATUT",
              statutAvant: ExpeditionStatus.EN_TRANSIT,
              statutApres: ExpeditionStatus.PERDU,
              notes: "Changement automatique: date d'arrivée dépassée sans réception",
              userId: user.id
            }
          });
          
          return updated;
        }
        return expedition;
      })
    );

    return updatedExpeditions as Expedition[];
  } catch (error) {
    console.error("Erreur lors de la récupération des expéditions:", error);
    return [];
  }
}

/**
 * Récupère une expédition par son ID
 */
export async function getExpeditionById(expeditionId: string): Promise<Expedition | null> {
  try {
    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
      include: {
        materiels: {
          include: {
            typeMateriel: true
          }
        },
        user: true,
        region: true,
        district: true,
        commune: true,
        centreVote: true,
        mouvements: {
          orderBy: { date: 'desc' },
          include: { user: true }
        }
      }
    });

    if (!expedition) {
      throw new Error("Expédition introuvable");
    }

    return expedition as Expedition;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'expédition:", error);
    return null;
  }
}

// Fonction utilitaire pour convertir les statuts numériques en enum
function convertStatusToEnum(status: string | number | ExpeditionStatus): ExpeditionStatus {
  if (typeof status === 'string' && Object.values(ExpeditionStatus).includes(status as ExpeditionStatus)) {
    return status as ExpeditionStatus;
  }
  
  if (typeof status === 'number') {
    const statusMap: Record<number, ExpeditionStatus> = {
      1: ExpeditionStatus.BROUILLON,
      2: ExpeditionStatus.EN_TRANSIT,
      3: ExpeditionStatus.RECU,
      4: ExpeditionStatus.ENDOMMAGE,
      5: ExpeditionStatus.PERDU,
      6: ExpeditionStatus.DISTRIBUE,
      7: ExpeditionStatus.RETOURNE,
      8: ExpeditionStatus.ARCHIVE
    };
    return statusMap[status] || ExpeditionStatus.BROUILLON;
  }
  
  return ExpeditionStatus.BROUILLON;
}

/**
 * Met à jour une expédition
 */
export async function updateExpedition(
  expeditionData: ExpeditionFormData,
  userId?: string
): Promise<Expedition> {
  try {
    const existingExpedition = await prisma.expedition.findUnique({
      where: { id: expeditionData.id! },
      include: { materiels: true }
    });

    if (!existingExpedition) {
      throw new Error(`Expédition ${expeditionData.id} introuvable`);
    }

    // Convertir le statut en enum si nécessaire
    const statusEnum = convertStatusToEnum(expeditionData.status);
    
    // Détecter le changement de statut pour créer un mouvement
    const statusChanged = existingExpedition.status !== statusEnum;
    const oldStatus = existingExpedition.status;

    // Convertir les dates string en DateTime si présentes
    const dateDepart = expeditionData.dateDepart 
      ? new Date(expeditionData.dateDepart) 
      : null;
    const dateArrive = expeditionData.dateArrive 
      ? new Date(expeditionData.dateArrive) 
      : null;

    // Mettre à jour l'expédition
    const updatedExpedition = await prisma.expedition.update({
      where: { id: expeditionData.id! },
      data: {
        designation: expeditionData.designation,
        lieuDepart: expeditionData.lieuDepart,
        dateDepart: dateDepart,
        nomEmetteur: expeditionData.nomEmetteur,
        adresseEmetteur: expeditionData.adresseEmetteur,
        lieuArrive: expeditionData.lieuArrive,
        dateArrive: dateArrive,
        nomRecepteur: expeditionData.nomRecepteur,
        adresseRecepteur: expeditionData.adresseRecepteur,
        status: statusEnum,
        regionId: expeditionData.regionId || null,
        districtId: expeditionData.districtId || null,
        communeId: expeditionData.communeId || null,
        centreVoteId: expeditionData.centreVoteId || null,
        notes: expeditionData.notes
      },
      include: {
        materiels: {
          include: { typeMateriel: true }
        },
        user: true,
        region: true,
        district: true,
        commune: true,
        centreVote: true
      }
    });

    // Créer un mouvement si le statut a changé
    if (statusChanged && userId) {
      await prisma.mouvement.create({
        data: {
          expeditionId: expeditionData.id!,
          type: "CHANGEMENT_STATUT",
          statutAvant: oldStatus,
          statutApres: expeditionData.status,
          userId: userId,
          notes: expeditionData.notes || "Changement de statut"
        }
      });
    }

    // Gérer les matériels
    const existingMateriels = existingExpedition.materiels || [];
    const receivedMateriels = expeditionData.materiels || [];

    // Supprimer les matériels retirés
    const materielsToDelete = existingMateriels.filter(
      (existing: any) => !receivedMateriels.some((r: any) => r.id === existing.id)
    );

    if (materielsToDelete.length > 0) {
      await prisma.materiel.deleteMany({
        where: {
          id: { in: materielsToDelete.map((m: any) => m.id) }
        }
      });
    }

    // Mettre à jour ou créer les matériels
    for (const materielData of receivedMateriels) {
      const existingMateriel = existingMateriels.find((m: any) => m.id === materielData.id);

      if (existingMateriel) {
        // Mettre à jour le matériel existant
        const hasChanged =
          materielData.designation !== existingMateriel.designation ||
          materielData.categorie !== existingMateriel.categorie ||
          materielData.description !== existingMateriel.description ||
          materielData.quantite !== existingMateriel.quantite ||
          materielData.statut !== existingMateriel.statut;

        if (hasChanged) {
          await prisma.materiel.update({
            where: { id: materielData.id },
            data: {
              designation: materielData.designation,
              typeMaterielId: materielData.typeMaterielId || null,
              categorie: materielData.categorie,
              description: materielData.description,
              quantite: materielData.quantite,
              quantiteRecue: materielData.quantiteRecue,
              quantiteUtilisee: materielData.quantiteUtilisee,
              statut: materielData.statut
            }
          });
        }
      } else {
        // Créer un nouveau matériel
        await prisma.materiel.create({
          data: {
            designation: materielData.designation,
            typeMaterielId: materielData.typeMaterielId || null,
            categorie: materielData.categorie,
            description: materielData.description,
            quantite: materielData.quantite,
            quantiteRecue: materielData.quantiteRecue,
            quantiteUtilisee: materielData.quantiteUtilisee,
            statut: materielData.statut,
            expeditionId: expeditionData.id!,
            userId: userId || null
          }
        });
      }
    }

    // Récupérer l'expédition mise à jour avec toutes les relations
    const finalExpedition = await prisma.expedition.findUnique({
      where: { id: expeditionData.id! },
      include: {
        materiels: {
          include: { typeMateriel: true }
        },
        user: true,
        region: true,
        district: true,
        commune: true,
        centreVote: true
      }
    });

    return finalExpedition as Expedition;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'expédition:", error);
    throw error;
  }
}

/**
 * Supprime une expédition
 */
export async function deleteExpedition(expeditionId: string): Promise<void> {
  try {
    await prisma.expedition.delete({
      where: { id: expeditionId }
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'expédition:", error);
    throw error;
  }
}

// ============================================
// FONCTIONS DE COMPATIBILITÉ (pour migration progressive)
// ============================================

/**
 * Fonctions de compatibilité avec l'ancien système MaterielPdf
 * Ces fonctions seront supprimées après migration complète
 */

export async function createEmptyMaterielPdf(email: string, design: string) {
  return createEmptyExpedition(email, design);
}

export async function getMaterielPdfByEmail(email: string) {
  const expeditions = await getExpeditionsByEmail(email);
  // Convertir Expedition en MaterielPdf pour compatibilité
  return expeditions.map(exp => ({
    ...exp,
    materiels: exp.materiels,
    Materiel: exp.materiels
  }));
}

export async function getMaterielPdfById(id: string) {
  const expedition = await getExpeditionById(id);
  if (!expedition) return null;
  return {
    ...expedition,
    materiels: expedition.materiels,
    Materiel: expedition.materiels
  };
}

export async function updatedMaterielPdf(materielPdf: any) {
  // Convertir MaterielPdf en ExpeditionFormData
  const expeditionData: ExpeditionFormData = {
    id: materielPdf.id,
    numero: materielPdf.numero,
    designation: materielPdf.designation || materielPdf.design,
    lieuDepart: materielPdf.lieuDepart || materielPdf.lieu_depart || "",
    dateDepart: materielPdf.dateDepart || materielPdf.date_depart || undefined,
    nomEmetteur: materielPdf.nomEmetteur || materielPdf.nom_emetteur || "",
    adresseEmetteur: materielPdf.adresseEmetteur || materielPdf.adresse_emetteur || "",
    lieuArrive: materielPdf.lieuArrive || materielPdf.lieu_arrive || "",
    dateArrive: materielPdf.dateArrive || materielPdf.date_arrive || undefined,
    nomRecepteur: materielPdf.nomRecepteur || materielPdf.nom_recepteur || "",
    adresseRecepteur: materielPdf.adresseRecepteur || materielPdf.adresse_recepteur || "",
    status: convertStatusToEnum(materielPdf.status),
    regionId: materielPdf.regionId,
    districtId: materielPdf.districtId,
    communeId: materielPdf.communeId,
    centreVoteId: materielPdf.centreVoteId,
    notes: materielPdf.notes,
    materiels: (materielPdf.materiels || materielPdf.Materiel || []).map((m: any) => ({
      id: m.id,
      designation: m.designation || m.design,
      categorie: m.categorie,
      description: m.description,
      quantite: m.quantite || m.quantity || 1,
      quantiteRecue: m.quantiteRecue,
      quantiteUtilisee: m.quantiteUtilisee,
      statut: m.statut || MaterielStatut.BON
    }))
  };
  
  return updateExpedition(expeditionData, materielPdf.userId);
}

export async function deleteMaterielPdf(id: string) {
  return deleteExpedition(id);
}

export async function getMaterielById(materielId: string) {
  try {
    const materiel = await prisma.materiel.findUnique({
      where: { id: materielId },
      include: {
        expedition: true,
        typeMateriel: true
      }
    });
    if (!materiel) throw new Error('Matériel introuvable');
    return materiel;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ============================================
// GESTION DES RÉGIONS, DISTRICTS, COMMUNES, CENTRES DE VOTE
// ============================================

export async function getAllRegions() {
  try {
    return await prisma.region.findMany({
      orderBy: { nom: 'asc' },
      include: {
        districts: {
          include: {
            communes: {
              include: {
                centresVote: true
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des régions:", error);
    return [];
  }
}

export async function getDistrictsByRegion(regionId: string) {
  try {
    return await prisma.district.findMany({
      where: { regionId },
      orderBy: { nom: 'asc' },
      include: {
        communes: {
          include: {
            centresVote: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des districts:", error);
    return [];
  }
}

export async function getCommunesByDistrict(districtId: string) {
  try {
    return await prisma.commune.findMany({
      where: { districtId },
      orderBy: { nom: 'asc' },
      include: {
        centresVote: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des communes:", error);
    return [];
  }
}

export async function getCentresVoteByCommune(communeId: string) {
  try {
    return await prisma.centreVote.findMany({
      where: { communeId },
      orderBy: { nom: 'asc' }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des centres de vote:", error);
    return [];
  }
}

// ============================================
// GESTION DES TYPES DE MATÉRIELS
// ============================================

export async function getAllTypeMateriels() {
  try {
    return await prisma.typeMateriel.findMany({
      orderBy: { nom: 'asc' },
      include: {
        materiels: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des types de matériels:", error);
    return [];
  }
}

export async function createTypeMateriel(data: {
  code: string;
  nom: string;
  categorie: string;
  description?: string;
  unite?: string;
}) {
  try {
    return await prisma.typeMateriel.create({
      data
    });
  } catch (error) {
    console.error("Erreur lors de la création du type de matériel:", error);
    throw error;
  }
}

export async function updateTypeMateriel(id: string, data: {
  code?: string;
  nom?: string;
  categorie?: string;
  description?: string;
  unite?: string;
}) {
  try {
    return await prisma.typeMateriel.update({
      where: { id },
      data
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du type de matériel:", error);
    throw error;
  }
}

export async function deleteTypeMateriel(id: string) {
  try {
    return await prisma.typeMateriel.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du type de matériel:", error);
    throw error;
  }
}

// ============================================
// GESTION DES UTILISATEURS
// ============================================

export async function getAllUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { name: 'asc' },
      include: {
        expeditions: true,
        materiels: true,
        mouvements: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return [];
  }
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        expeditions: true,
        materiels: true,
        mouvements: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
}

export async function updateUser(id: string, data: {
  name?: string;
  role?: string;
  phone?: string;
  fonction?: string;
}) {
  try {
    return await prisma.user.update({
      where: { id },
      data
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    return await prisma.user.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    throw error;
  }
}

// ============================================
// GESTION DES RÉGIONS (CRUD complet)
// ============================================

export async function createRegion(data: {
  code: string;
  nom: string;
  chefLieu?: string;
}) {
  try {
    return await prisma.region.create({
      data,
      include: {
        districts: true,
        expeditions: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la création de la région:", error);
    throw error;
  }
}

export async function updateRegion(id: string, data: {
  code?: string;
  nom?: string;
  chefLieu?: string;
}) {
  try {
    return await prisma.region.update({
      where: { id },
      data,
      include: {
        districts: true,
        expeditions: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la région:", error);
    throw error;
  }
}

export async function deleteRegion(id: string) {
  try {
    return await prisma.region.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la région:", error);
    throw error;
  }
}

// ============================================
// GESTION DES DISTRICTS (CRUD complet)
// ============================================

export async function getAllDistricts() {
  try {
    return await prisma.district.findMany({
      orderBy: { nom: 'asc' },
      include: {
        region: true,
        communes: true,
        expeditions: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des districts:", error);
    return [];
  }
}

export async function createDistrict(data: {
  code: string;
  nom: string;
  regionId: string;
  chefLieu?: string;
}) {
  try {
    return await prisma.district.create({
      data,
      include: {
        region: true,
        communes: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la création du district:", error);
    throw error;
  }
}

export async function updateDistrict(id: string, data: {
  code?: string;
  nom?: string;
  regionId?: string;
  chefLieu?: string;
}) {
  try {
    return await prisma.district.update({
      where: { id },
      data,
      include: {
        region: true,
        communes: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du district:", error);
    throw error;
  }
}

export async function deleteDistrict(id: string) {
  try {
    return await prisma.district.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du district:", error);
    throw error;
  }
}

// ============================================
// GESTION DES COMMUNES (CRUD complet)
// ============================================

export async function getAllCommunes() {
  try {
    return await prisma.commune.findMany({
      orderBy: { nom: 'asc' },
      include: {
        district: {
          include: {
            region: true
          }
        },
        centresVote: true,
        expeditions: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des communes:", error);
    return [];
  }
}

export async function createCommune(data: {
  code: string;
  nom: string;
  districtId: string;
}) {
  try {
    return await prisma.commune.create({
      data,
      include: {
        district: true,
        centresVote: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la création de la commune:", error);
    throw error;
  }
}

export async function updateCommune(id: string, data: {
  code?: string;
  nom?: string;
  districtId?: string;
}) {
  try {
    return await prisma.commune.update({
      where: { id },
      data,
      include: {
        district: true,
        centresVote: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commune:", error);
    throw error;
  }
}

export async function deleteCommune(id: string) {
  try {
    return await prisma.commune.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la commune:", error);
    throw error;
  }
}

// ============================================
// GESTION DES CENTRES DE VOTE (CRUD complet)
// ============================================

export async function getAllCentresVote() {
  try {
    return await prisma.centreVote.findMany({
      orderBy: { nom: 'asc' },
      include: {
        commune: {
          include: {
            district: {
              include: {
                region: true
              }
            }
          }
        },
        expeditions: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des centres de vote:", error);
    return [];
  }
}

export async function createCentreVote(data: {
  code: string;
  nom: string;
  communeId: string;
  adresse?: string;
  capacite?: number;
}) {
  try {
    return await prisma.centreVote.create({
      data,
      include: {
        commune: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la création du centre de vote:", error);
    throw error;
  }
}

export async function updateCentreVote(id: string, data: {
  code?: string;
  nom?: string;
  communeId?: string;
  adresse?: string;
  capacite?: number;
}) {
  try {
    return await prisma.centreVote.update({
      where: { id },
      data,
      include: {
        commune: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du centre de vote:", error);
    throw error;
  }
}

export async function deleteCentreVote(id: string) {
  try {
    return await prisma.centreVote.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du centre de vote:", error);
    throw error;
  }
}

// ============================================
// GESTION DES MOUVEMENTS
// ============================================

export async function getAllMouvements() {
  try {
    return await prisma.mouvement.findMany({
      orderBy: { date: 'desc' },
      include: {
        expedition: {
          include: {
            materiels: true
          }
        },
        user: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des mouvements:", error);
    return [];
  }
}

export async function getMouvementsByExpedition(expeditionId: string) {
  try {
    return await prisma.mouvement.findMany({
      where: { expeditionId },
      orderBy: { date: 'desc' },
      include: {
        user: true
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des mouvements:", error);
    return [];
  }
}

// ============================================
// STATISTIQUES ET RAPPORTS
// ============================================

export async function getExpeditionStats(email?: string) {
  try {
    const where = email ? {
      user: { email }
    } : {};

    const expeditions = await prisma.expedition.findMany({
      where,
      include: {
        materiels: true
      }
    });

    const stats = {
      total: expeditions.length,
      parStatut: {
        [ExpeditionStatus.BROUILLON]: 0,
        [ExpeditionStatus.EN_TRANSIT]: 0,
        [ExpeditionStatus.RECU]: 0,
        [ExpeditionStatus.DISTRIBUE]: 0,
        [ExpeditionStatus.RETOURNE]: 0,
        [ExpeditionStatus.ENDOMMAGE]: 0,
        [ExpeditionStatus.PERDU]: 0,
        [ExpeditionStatus.ARCHIVE]: 0
      }
    };

    expeditions.forEach((exp: any) => {
      stats.parStatut[exp.status] = (stats.parStatut[exp.status] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques:", error);
    return null;
  }
}
