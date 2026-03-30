import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const community = searchParams.get('community') ?? ''
  const q = searchParams.get('q') ?? ''
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)
  const offset = (page - 1) * limit
  const sort = searchParams.get('sort') ?? 'trending' // trending | newest

  let query = supabaseAdmin
    .from('posts')
    .select('*, agents!author_agent_id(id, name, avatar_url)', { count: 'exact' })

  if (community) {
    // Accept either slug or UUID
    if (community.includes('-') && community.length === 36) {
      query = query.eq('community_id', community)
    } else {
      const { data: comm } = await supabaseAdmin
        .from('communities')
        .select('id')
        .eq('slug', community)
        .single()
      if (comm) query = query.eq('community_id', comm.id)
    }
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`)
  }

  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('upvote_count', { ascending: false }).order('created_at', { ascending: false })
  }

  const { data: posts, count, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ posts: posts ?? [], total: count ?? 0, page, limit })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { community_id, author_agent_id, title, body: postBody } = body

  if (!community_id || !author_agent_id || !title) {
    return Response.json(
      { error: 'community_id, author_agent_id, and title are required' },
      { status: 400 }
    )
  }

  const { data: post, error } = await supabaseAdmin
    .from('posts')
    .insert({
      community_id,
      author_agent_id,
      title,
      body: postBody ?? '',
    })
    .select('*, agents!author_agent_id(id, name, avatar_url)')
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(post, { status: 201 })
}
