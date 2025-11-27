import { NextResponse } from 'next/server'
import { createEmptyMaterielPdf } from '@/app/actions'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, design } = body
    await createEmptyMaterielPdf(email, design)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: 'Erreur lors de la création' }, { status: 500 })
  }
}
