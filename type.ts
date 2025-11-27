// Types pour la gestion des matériels électoraux de la CENI Madagascar
import { 
  Expedition as PrismaExpedition,
  Materiel as PrismaMateriel,
  User as PrismaUser,
  Region as PrismaRegion,
  District as PrismaDistrict,
  Commune as PrismaCommune,
  CentreVote as PrismaCentreVote,
  TypeMateriel as PrismaTypeMateriel,
  Mouvement as PrismaMouvement,
  ExpeditionStatus,
  MaterielStatut,
  UserRole,
  MouvementType
} from "@prisma/client";

// Ré-exporter les enums
export { ExpeditionStatus, MaterielStatut, UserRole, MouvementType };

// Types étendus avec relations
export interface Expedition extends PrismaExpedition {
  materiels?: Materiel[];
  user?: User;
  region?: Region;
  district?: District;
  commune?: Commune;
  centreVote?: CentreVote;
  mouvements?: Mouvement[];
}

export interface Materiel extends PrismaMateriel {
  typeMateriel?: TypeMateriel;
  expedition?: Expedition;
  user?: User;
}

export interface User extends PrismaUser {
  expeditions?: Expedition[];
  materiels?: Materiel[];
  mouvements?: Mouvement[];
}

export interface Region extends PrismaRegion {
  districts?: District[];
  expeditions?: Expedition[];
}

export interface District extends PrismaDistrict {
  region?: Region;
  communes?: Commune[];
  expeditions?: Expedition[];
}

export interface Commune extends PrismaCommune {
  district?: District;
  centresVote?: CentreVote[];
  expeditions?: Expedition[];
}

export interface CentreVote extends PrismaCentreVote {
  commune?: Commune;
  expeditions?: Expedition[];
}

export interface TypeMateriel extends PrismaTypeMateriel {
  materiels?: Materiel[];
}

export interface Mouvement extends PrismaMouvement {
  expedition?: Expedition;
  user?: User;
}

// Types pour les formulaires et l'UI
export interface ExpeditionFormData {
  id?: string;
  numero?: string;
  designation: string;
  lieuDepart: string;
  dateDepart?: string;
  nomEmetteur?: string;
  adresseEmetteur?: string;
  lieuArrive: string;
  dateArrive?: string;
  nomRecepteur?: string;
  adresseRecepteur?: string;
  status: ExpeditionStatus;
  regionId?: string;
  districtId?: string;
  communeId?: string;
  centreVoteId?: string;
  notes?: string;
  materiels?: MaterielFormData[];
}

export interface MaterielFormData {
  id?: string;
  designation: string;
  typeMaterielId?: string;
  categorie?: string;
  description?: string;
  quantite: number;
  quantiteRecue?: number;
  quantiteUtilisee?: number;
  statut: MaterielStatut;
}

// Types pour compatibilité avec l'ancien système (temporaire)
export interface MaterielPdf extends Omit<Expedition, 'materiels'> {
  materiels?: Materiel[];
  Materiel?: Materiel[];
}

// Types pour les statistiques et rapports
export interface ExpeditionStats {
  total: number;
  parStatut: Record<ExpeditionStatus, number>;
  parRegion?: Record<string, number>;
  parDistrict?: Record<string, number>;
}

export interface MaterielStats {
  total: number;
  parType?: Record<string, number>;
  parStatut: Record<MaterielStatut, number>;
}

export interface Totals {
  expeditions: number;
  materiels: number;
  enTransit: number;
  recus: number;
  endommages: number;
  perdus: number;
}
