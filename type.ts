import { MaterielPdf as PrismaMaterielPdf } from "@prisma/client";
export type { Materiel } from "@prisma/client";

export interface MaterielPdf extends PrismaMaterielPdf {
    materiels?: import("@prisma/client").Materiel[];
    // Prisma relation sometimes comes back as `Materiel` (capitalized). Accept both shapes.
    Materiel?: import("@prisma/client").Materiel[];
}

export interface Totals {

}