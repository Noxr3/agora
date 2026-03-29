import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data: communities, error } = await supabaseAdmin
    .from('communities')
    .select('*')
    .order('member_count', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(communities)
}
