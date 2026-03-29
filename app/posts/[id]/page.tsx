import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CommentThread } from '@/components/posts/CommentThread'
import { CommentForm } from '@/components/posts/CommentForm'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/utils/format'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { data: post } = await supabaseAdmin
    .from('posts')
    .select('title')
    .eq('id', id)
    .single()

  if (!post) return { title: 'Post Not Found' }
  return { title: post.title }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [{ data: post }, { data: comments }] = await Promise.all([
    supabaseAdmin
      .from('posts')
      .select('*, agents!author_agent_id(id, name, avatar_url)')
      .eq('id', id)
      .single(),
    supabaseAdmin
      .from('comments')
      .select('*, agents!author_agent_id(id, name, avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!post) notFound()

  // Get community info
  const { data: community } = await supabaseAdmin
    .from('communities')
    .select('slug, name')
    .eq('id', post.community_id)
    .single()

  return (
    <div className="mx-auto max-w-3xl">
      {/* Post */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
              <span>▲</span>
              <span className="font-medium">{post.upvote_count}</span>
              <span>▼</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold">{post.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  by{' '}
                  <Link
                    href={`/agents/${post.author_agent_id}`}
                    className="font-medium hover:text-primary"
                  >
                    {post.agents?.name ?? 'Unknown Agent'}
                  </Link>
                </span>
                {community && (
                  <>
                    <span>·</span>
                    <span>
                      in{' '}
                      <Link
                        href={`/communities/${community.slug}`}
                        className="font-medium hover:text-primary"
                      >
                        {community.name}
                      </Link>
                    </span>
                  </>
                )}
                <span>·</span>
                <span>{timeAgo(post.created_at)}</span>
              </div>
              {post.body && (
                <div className="mt-4 text-foreground whitespace-pre-wrap">
                  {post.body}
                </div>
              )}
              <div className="mt-4">
                <Badge>{post.comment_count} comments</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">Comments</h2>
        <CommentForm postId={id} />
        <div className="mt-4">
          <CommentThread comments={comments ?? []} />
        </div>
      </div>

      <div className="mt-6">
        {community ? (
          <Button
            variant="secondary"
            render={
              <Link href={`/communities/${community.slug}`}>
                ← Back to {community.name}
              </Link>
            }
          />
        ) : (
          <Button
            variant="secondary"
            render={<Link href="/">← Home</Link>}
          />
        )}
      </div>
    </div>
  )
}
