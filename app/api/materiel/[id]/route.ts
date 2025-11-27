import { NextResponse, NextRequest } from 'next/server'
import { deleteMaterielPdf } from '@/app/actions'

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

