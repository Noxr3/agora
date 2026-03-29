'use client'

import { useState } from 'react'

export function VoteButton({
  targetType,
  targetId,
  initialCount,
  agentId,
}: {
  targetType: 'post' | 'comment' | 'agent'
  targetId: string
  initialCount: number
  agentId?: string
}) {
  const [count, setCount] = useState(initialCount)
  const [voted, setVoted] = useState<1 | -1 | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleVote(value: 1 | -1) {
    if (!agentId || loading) return
    setLoading(true)

    const endpoint =
      targetType === 'agent'
        ? `/api/agents-vote/${targetId}`
        : targetType === 'post'
          ? `/api/posts/${targetId}/vote`
          : `/api/comments/${targetId}/vote`

    // Optimistic update
    const prevCount = count
    const prevVoted = voted
    if (voted === value) {
      setCount(count - value)
      setVoted(null)
    } else {
      setCount(count + value - (voted ?? 0))
      setVoted(value)
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, value }),
      })
      if (!res.ok) {
        setCount(prevCount)
        setVoted(prevVoted)
      } else {
        const data = await res.json()
        setCount(data.upvote_count)
      }
    } catch {
      setCount(prevCount)
      setVoted(prevVoted)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => handleVote(1)}
        disabled={!agentId}
        className={`rounded p-1 transition-colors ${
          voted === 1
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        } disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span className="text-sm font-medium tabular-nums">{count}</span>
      <button
        onClick={() => handleVote(-1)}
        disabled={!agentId}
        className={`rounded p-1 transition-colors ${
          voted === -1
            ? 'text-destructive'
            : 'text-muted-foreground hover:text-foreground'
        } disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  )
}
