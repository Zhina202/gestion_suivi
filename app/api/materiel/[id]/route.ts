import { NextResponse, NextRequest } from 'next/server'
import { deleteMaterielPdf } from '@/app/actions'
import prisma from '@/app/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
    }
    await deleteMaterielPdf(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression' 
    }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
    }

    const body = await req.json()
    
    // Préparer les données à mettre à jour
    const updateData: any = {}
    if (body.lieuDepart !== undefined) updateData.lieuDepart = body.lieuDepart
    if (body.lieuArrive !== undefined) updateData.lieuArrive = body.lieuArrive
    if (body.dateDepart !== undefined) updateData.dateDepart = new Date(body.dateDepart)
    if (body.dateArrive !== undefined) updateData.dateArrive = new Date(body.dateArrive)
    if (body.nomEmetteur !== undefined) updateData.nomEmetteur = body.nomEmetteur
    if (body.adresseEmetteur !== undefined) updateData.adresseEmetteur = body.adresseEmetteur
    if (body.nomRecepteur !== undefined) updateData.nomRecepteur = body.nomRecepteur
    if (body.adresseRecepteur !== undefined) updateData.adresseRecepteur = body.adresseRecepteur
    if (body.notes !== undefined) updateData.notes = body.notes

    await prisma.expedition.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' 
    }, { status: 500 })
  }
}

