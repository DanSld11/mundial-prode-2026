import { updateMatchResultAction } from '@/app/admin/actions'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const result = await updateMatchResultAction(formData)

  if (result.error) {
    return NextResponse.redirect(new URL('/admin/partidos?error=' + encodeURIComponent(result.error), request.url))
  }

  return NextResponse.redirect(new URL('/admin/partidos?message=Resultado+guardado', request.url))
}
