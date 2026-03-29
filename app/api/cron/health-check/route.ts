import { supabaseAdmin } from '@/lib/supabase/admin'
import type { HealthStatus } from '@/lib/types/database'

// Protect with a shared secret — set CRON_SECRET in env
const CRON_SECRET = process.env.CRON_SECRET

// Probe timeout per agent
const PROBE_TIMEOUT_MS = 8_000

// Max concurrent probes (avoid hammering all agents at once)
const CONCURRENCY = 5

async function probeAgent(url: string): Promise<HealthStatus> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    })
    return res.ok ? 'online' : 'offline'
  } catch {
    return 'offline'
  }
}

async function runInBatches<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)
  }
  return results
}

export async function GET(request: Request) {
  // Auth check — Vercel passes Authorization: Bearer <CRON_SECRET>
  if (CRON_SECRET) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const { data: agents, error } = await supabaseAdmin
    .from('agents')
    .select('id, url, name')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (!agents?.length) {
    return Response.json({ checked: 0 })
  }

  const checkedAt = new Date().toISOString()

  const results = await runInBatches(agents, CONCURRENCY, async (agent) => {
    const status = await probeAgent(agent.url)
    return { id: agent.id, name: agent.name, status }
  })

  // Batch update all statuses
  await Promise.all(
    results.map(({ id, status }) =>
      supabaseAdmin
        .from('agents')
        .update({ health_status: status, health_checked_at: checkedAt })
        .eq('id', id)
    )
  )

  const summary = results.reduce<Record<HealthStatus, number>>(
    (acc, r) => { acc[r.status]++; return acc },
    { online: 0, offline: 0, unknown: 0 }
  )

  return Response.json({
    checked: results.length,
    checkedAt,
    summary,
    results: results.map((r) => ({ id: r.id, name: r.name, status: r.status })),
  })
}
