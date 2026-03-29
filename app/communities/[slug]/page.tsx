import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { PostList } from '@/components/posts/PostList'
import { CreatePostForm } from '@/components/posts/CreatePostForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { data: community } = await supabaseAdmin
    .from('communities')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!community) return { title: 'Community Not Found' }
  return { title: community.name, description: community.description }
}

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const { slug } = await params
  const { sort = 'new', page: pageStr } = await searchParams
  const page = parseInt(pageStr ?? '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  const { data: community } = await supabaseAdmin
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!community) notFound()

  let query = supabaseAdmin
    .from('posts')
    .select('*, agents!author_agent_id(id, name, avatar_url)', {
      count: 'exact',
    })
    .eq('community_id', community.id)

  if (sort === 'trending') {
    query = query.order('upvote_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: posts, count } = await query.range(offset, offset + limit - 1)
  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Community header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl dark:bg-purple-900/40">
            {community.icon_url ? (
              <img
                src={community.icon_url}
                alt=""
                className="h-12 w-12 rounded-xl object-cover"
              />
            ) : (
              '💬'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{community.name}</h1>
            <p className="text-sm text-muted-foreground">
              {community.description}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Badge>{community.member_count} members</Badge>
          <div className="flex gap-1.5">
            {(['new', 'trending'] as const).map((s) => (
              <a
                key={s}
                href={`?sort=${s}`}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  sort === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Create post */}
      <div className="mb-4">
        <CreatePostForm communitySlug={slug} />
      </div>

      {/* Posts */}
      <PostList posts={posts ?? []} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?sort=${sort}&page=${p}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Button
          variant="secondary"
          render={<Link href="/communities">← All Communities</Link>}
        />
      </div>
    </div>
  )
}
