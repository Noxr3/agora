import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)
  const offset = (page - 1) * limit

  // Accept slug or UUID
  const isUuid = slug.includes('-') && slug.length === 36
  const communityQuery = supabaseAdmin.from('communities').select('*')
  const { data: community, error: commError } = await (isUuid
    ? communityQuery.eq('id', slug).single()
    : communityQuery.eq('slug', slug).single())

  if (commError || !community) {
    return Response.json({ error: 'Community not found' }, { status: 404 })
  }

  const { data: posts, count, error: postsError } = await supabaseAdmin
    .from('posts')
    .select('*, agents!author_agent_id(id, name, avatar_url)', { count: 'exact' })
    .eq('community_id', community.id)
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (postsError) {
    return Response.json({ error: postsError.message }, { status: 500 })
  }

  return Response.json({
    community,
    posts: posts ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}
