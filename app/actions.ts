"use server"

import prisma from "./lib/prisma";
import { randomBytes } from "crypto";
import { MaterielPdf , Materiel } from "@prisma/client";
//import Materiel from "./components/Materiel";

export async function checkAndAddUser(email:string, name:string) {
    if(!email) return;
    try {
        const existingUser= await prisma.user.findUnique({
            where:{
                email: email
            }
        })
        if(!existingUser && name){
            await prisma.user.create({
                data: {
                    email ,
                    name
                }
            })
        }
    } catch (error) {
        console.error(error)
    }
}

const generateUniqueId = async () => {
    let uniqueId = "";
    let isUnique = false;

    while(!isUnique){
        uniqueId = randomBytes(3).toString('hex')

        const existingMaterielPdf = await prisma.materielPdf.findUnique({
            where:{
                id: uniqueId
            }
        }) 
    
        if(!existingMaterielPdf){
            isUnique= true;
        }
    }

    return uniqueId
}

export async function createEmptyMaterielPdf(email:string, design:string) {
    try {
       const user = await prisma.user.findUnique({
        where:{
            email: email
        }
       }) 

       const materielPdfId = await generateUniqueId() as string

       if(user){
            const newMaterielPdfId = await prisma.materielPdf.create({
                data : {
                    id: materielPdfId,
                    design : design,
                    //userId:user?.id,
                    lieu_depart: "",
                    lieu_arrive: "",
                    date_depart: "",
                    date_arrive: "",
                    userId: user.id
                }
            })
       }
       

    } catch (error) {
        console.error(error)
    }
}

export async function getMaterielPdfByEmail(email:string) {
    if(!email) return;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
            include : {
                materielsPdf : {
                    include : {
                        Materiel: true,
                    }
                }
            }
        })
            //1: Brouillon
            //2: En transit //Le matériel est en cours d’acheminement vers son lieu d’affectation.
            //3: Reçu 
            //4: Endommagé //Le matériel est cassé, inutilisable ou nécessite réparation.
            //5:Perdu //Le matériel est manquant ou introuvable après le scrutin.

        if(user){
            const today = new Date();
            const updatedMaterielsPdf = await Promise.all(
                user.materielsPdf.map(async (materielPdf: any) => {
                const date_arrive = new Date(materielPdf.date_arrive);
                if (date_arrive < today && materielPdf.status === 2) {
                     const updatedMaterielPdf = await prisma.materielPdf.update({
                        where : {id: materielPdf.id},
                        data : {status :5},
                        include : { Materiel : true }
                     })
                     return updatedMaterielPdf
                } 
                return materielPdf   
                })
            )
            return updatedMaterielsPdf
        }
    } catch (error) {
       console.error(error) 
       return [];
    }
}

export async function getMaterielPdfById(materielPdfId:string) {
    try {
        const materielPdf = await prisma.materielPdf.findUnique({
            where: {id:materielPdfId},
            include : {
                Materiel : true
            }
        })
        if(!materielPdf){
            throw new Error ("Document introuvable")
        }
        return materielPdf
    } catch (error) {
        console.error(error)
    }
    
}

export async function updatedMaterielPdf(materielPdf:MaterielPdf) { 
    try {
        const existingMaterielPdf = await prisma.materielPdf.findUnique({
            where: {id : materielPdf.id},
            include : {
                Materiel : true
            }
        })

        if(!existingMaterielPdf){
            throw new Error (`Document  ${materielPdf.id} introuvable`);
        }

        await  prisma.materielPdf.update({
            where : {id : materielPdf.id},
            data : {
                design : materielPdf.design ,     
                lieu_depart : materielPdf.lieu_depart,
                lieu_arrive : materielPdf.lieu_arrive,
                date_depart : materielPdf.date_depart,
                date_arrive : materielPdf.date_arrive,
                status : materielPdf.status,
                nom_emetteur : materielPdf.nom_emetteur,
                adresse_emetteur : materielPdf.adresse_emetteur,
                nom_recepteur  : materielPdf.nom_recepteur,
                adresse_recepteur : materielPdf.adresse_recepteur
            }
        })

    const existingMateriels: Materiel[] = existingMaterielPdf.Materiel || []
    // Accept both Prisma-shaped `Materiel` (capitalized) and client-shaped `materiels` (lowercase)
    const receivedMateriels: Materiel[] = (materielPdf as any).Materiel || (materielPdf as any).materiels || []

        const materielsToDelete = existingMateriels.filter(
            (existingMateriel) => !receivedMateriels.some((r) => r.id === existingMateriel.id )
        )

        if(materielsToDelete.length > 0){
            await prisma.materiel.deleteMany({
                where : {
                    id: { in : materielsToDelete.map((materiel) => materiel.id )}
                }
            })
        }

        for(const r of receivedMateriels){
            const existingMateriel = existingMateriels.find((l) => l.id === r.id )
            if(existingMateriel){
                const hasChanged =
                    r.design !== existingMateriel.design ||
                    r.categorie !== existingMateriel.categorie ||
                    r.description !== existingMateriel.description ||
                    r.quantity !== existingMateriel.quantity ;

                if(hasChanged){
                    await prisma.materiel.update({
                        where : {id : r.id},
                        data : {
                            design : r.design,
                            categorie : r.categorie,
                            description : r.description,
                            quantity : r.quantity,
                        }
                    })
                } 
            }
            else
            {
                // création d'un nouveau matériel
                    await prisma.materiel.create({
                        data : {
                            design : r.design,
                            categorie : r.categorie,
                            description : r.description,
                            quantity : r.quantity,
                            materielPdfId : materielPdf.id
                        }
                    })
            }
        }

    } catch (error) {
        console.error(error)
    }
}

export async function deleteMaterielPdf(materielPdfId: string) {
    try {
        const deleteMaterielPdf = await  prisma.materielPdf.delete ({
            where : {id : materielPdfId}
        })
        if(!deleteMaterielPdf){
            throw new Error ("Erreur lors de la suppression ");
        }
    } catch (error) {
        console.error(error)
    }
}

export async function getMaterielById(materielId: string) {
    try {
        const materiel = await prisma.materiel.findUnique({
            where: { id: materielId },
            include: { pdf: true }
        })
        if(!materiel) throw new Error('Matériel introuvable')
        return materiel
    } catch (error) {
        console.error(error)
    }
}