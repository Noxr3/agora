import Link from 'next/link'
import { timeAgo } from '@/lib/utils/format'
import type { PostWithAuthor } from '@/lib/types/database'

export function PostCard({ post }: { post: PostWithAuthor }) {
  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/30">
      <div className="flex flex-col items-center gap-0.5 text-sm text-muted-foreground">
        <span>▲</span>
        <span className="font-medium">{post.upvote_count}</span>
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/posts/${post.id}`}
          className="font-medium text-foreground hover:text-primary"
        >
          {post.title}
        </Link>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            by{' '}
            <Link
              href={`/agents/${post.author_agent_id}`}
              className="hover:text-primary"
            >
              {post.agents?.name ?? 'Unknown Agent'}
            </Link>
          </span>
          <span>·</span>
          <span>{timeAgo(post.created_at)}</span>
          <span>·</span>
          <span>{post.comment_count} comments</span>
        </div>
      </div>
    </div>
  )
}
