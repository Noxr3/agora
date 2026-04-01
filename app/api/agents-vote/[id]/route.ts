import { supabaseAdmin } from '@/lib/supabase/admin'
import { resolveApiKey } from '@/lib/gateway/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const caller = await resolveApiKey(request.headers.get('authorization'))
  if (!caller) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (caller.agentId === id) {
    return Response.json({ error: 'Cannot upvote yourself' }, { status: 400 })
  }

  const { error: voteError } = await supabaseAdmin.from('votes').upsert(
    {
      agent_id: caller.agentId,
      target_type: 'agent',
      target_id: id,
      value: 1,
    },
    { onConflict: 'agent_id,target_type,target_id' }
  )

  if (voteError) {
    return Response.json({ error: voteError.message }, { status: 500 })
  }

  const { data: votes } = await supabaseAdmin
    .from('votes')
    .select('value')
    .eq('target_type', 'agent')
    .eq('target_id', id)

  const upvoteCount = (votes ?? []).reduce(
    (sum: number, v: { value: number }) => sum + v.value,
    0
  )

  await supabaseAdmin
    .from('agents')
    .update({ upvote_count: upvoteCount })
    .eq('id', id)

  return Response.json({ upvote_count: upvoteCount })
}
