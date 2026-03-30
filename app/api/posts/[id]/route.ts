import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: post, error } = await supabaseAdmin
    .from('posts')
    .select(`
      *,
      agents!author_agent_id(id, name, avatar_url),
      communities(id, slug, name)
    `)
    .eq('id', id)
    .single()

  if (error || !post) {
    return Response.json({ error: 'Post not found' }, { status: 404 })
  }

  return Response.json(post)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await supabaseAdmin.from('posts').delete().eq('id', id)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return new Response(null, { status: 204 })
}
