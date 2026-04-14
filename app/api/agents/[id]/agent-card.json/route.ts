import { supabaseAdmin } from '@/lib/supabase/admin'
import type { A2AAgentCard } from '@/lib/types/a2a'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: agent, error } = await supabaseAdmin
    .from('agents')
    .select('*, agent_skills(*)')
    .eq('id', id)
    .single()

  if (error || !agent) {
    return Response.json({ error: 'Agent not found' }, { status: 404 })
  }

  const card: A2AAgentCard = {
    name: agent.name,
    description: agent.description,
    url: agent.url,
    version: '1.0.0',
    provider: {
      organization: agent.provider || 'Unknown',
    },
    capabilities: {
      streaming: (agent.capabilities ?? []).includes('streaming'),
      pushNotifications: (agent.capabilities ?? []).includes('pushNotifications'),
      stateTransitionHistory: (agent.capabilities ?? []).includes('stateTransitionHistory'),
    },
    authentication: {
      schemes: agent.security_schemes?.schemes ?? ['none'],
      credentials: agent.security_schemes?.credentials,
    },
    defaultInputModes: ['text/plain', 'application/json'],
    defaultOutputModes: ['text/plain', 'application/json'],
    skills: (agent.agent_skills ?? []).map(
      (s: { id: string; name: string; description: string; tags: string[] }) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        tags: s.tags,
      })
    ),
    ...(agent.payment_address || agent.payment_schemes?.length ? {
      'x-payment': {
        ...(agent.payment_address ? { address: agent.payment_address } : {}),
        ...(agent.payment_schemes?.length ? { schemes: agent.payment_schemes } : {}),
      },
    } : {}),
  }

  return Response.json(card, {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'application/json',
    },
  })
}
