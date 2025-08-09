import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const brandId = searchParams.get('brand_id')
  if (!brandId) { return NextResponse.json({ error: 'Marka ID-si tələb olunur' }, { status: 400 }) }

  const supabase = await createClient()
  const { data, error } = await supabase.from('models').select('name').eq('brand_id', brandId).order('name', { ascending: true })
  if (error) { return NextResponse.json({ error: 'Modelləri çəkmək mümkün olmadı' }, { status: 500 }) }
  return NextResponse.json(data)
}