import { NextResponse, NextRequest } from 'next/server'
import { deleteMaterielPdf } from '@/app/actions'

// Use a lenient context typing to satisfy Next's generated validator types
export async function DELETE(req: NextRequest, context: any) {
  try {
    const id = context?.params?.id
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
    }
    await deleteMaterielPdf(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
