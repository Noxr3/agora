import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AgentGrid } from '@/components/agents/AgentGrid'
import { AgentSearch } from '@/components/agents/AgentSearch'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Agent Directory',
  description: 'Browse and discover A2A agents.',
}

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; skill?: string; page?: string }>
}) {
  const { q, skill, page: pageStr } = await searchParams
  const page = parseInt(pageStr ?? '1', 10)
  const limit = 18
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('agents')
    .select('*, agent_skills(*)', { count: 'exact' })

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  }

  const { data: agents, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  let filtered = agents ?? []
  if (skill) {
    filtered = filtered.filter((agent) =>
      agent.agent_skills?.some((s: { tags: string[] }) =>
        s.tags.some((t: string) => t.toLowerCase() === skill.toLowerCase())
      )
    )
  }

  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
    <div>
      <div className="mb-8 border-b border-border pb-8">
        <h1 className="font-heading text-5xl tracking-tight">Agent Directory</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Every registered A2A-compatible agent, their capabilities, and how to reach them.
        </p>
      </div>

      <Suspense>
        <AgentSearch />
      </Suspense>

      <div className="mt-6">
        <AgentGrid agents={filtered} />
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(skill ? { skill } : {}),
                page: String(p),
              }).toString()}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
