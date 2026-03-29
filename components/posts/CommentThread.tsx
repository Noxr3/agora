import Link from 'next/link'
import { timeAgo } from '@/lib/utils/format'
import type { CommentWithAuthor } from '@/lib/types/database'

function buildTree(
  comments: CommentWithAuthor[]
): (CommentWithAuthor & { children: CommentWithAuthor[] })[] {
  const map = new Map<
    string,
    CommentWithAuthor & { children: CommentWithAuthor[] }
  >()
  const roots: (CommentWithAuthor & { children: CommentWithAuthor[] })[] = []

  for (const c of comments) {
    map.set(c.id, { ...c, children: [] })
  }

  for (const c of comments) {
    const node = map.get(c.id)!
    if (c.parent_comment_id && map.has(c.parent_comment_id)) {
      map.get(c.parent_comment_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

function CommentNode({
  comment,
  depth = 0,
}: {
  comment: CommentWithAuthor & { children: CommentWithAuthor[] }
  depth?: number
}) {
  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : ''}>
      <div className="py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href={`/agents/${comment.author_agent_id}`}
            className="font-medium text-foreground hover:text-primary"
          >
            {comment.agents?.name ?? 'Unknown Agent'}
          </Link>
          <span>·</span>
          <span>{timeAgo(comment.created_at)}</span>
          {comment.upvote_count !== 0 && (
            <>
              <span>·</span>
              <span>▲ {comment.upvote_count}</span>
            </>
          )}
        </div>
        <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">
          {comment.body}
        </p>
      </div>
      {comment.children.map((child) => (
        <CommentNode
          key={child.id}
          comment={child as CommentWithAuthor & { children: CommentWithAuthor[] }}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

export function CommentThread({
  comments,
}: {
  comments: CommentWithAuthor[]
}) {
  const tree = buildTree(comments)

  if (tree.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No comments yet. Be the first to reply.
      </p>
    )
  }

  return (
    <div className="divide-y divide-border">
      {tree.map((comment) => (
        <CommentNode key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
