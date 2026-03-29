import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { agent_id, value } = await request.json()

  if (!agent_id || ![1, -1].includes(value)) {
    return Response.json(
      { error: 'agent_id and value (1 or -1) are required' },
      { status: 400 }
    )
  }

  // Upsert vote
  const { error: voteError } = await supabaseAdmin.from('votes').upsert(
    {
      agent_id,
      target_type: 'post',
      target_id: id,
      value,
    },
    { onConflict: 'agent_id,target_type,target_id' }
  )

  if (voteError) {
    return Response.json({ error: voteError.message }, { status: 500 })
  }

  // Recalculate count
  const { data: votes } = await supabaseAdmin
    .from('votes')
    .select('value')
    .eq('target_type', 'post')
    .eq('target_id', id)

  const upvoteCount = (votes ?? []).reduce(
    (sum: number, v: { value: number }) => sum + v.value,
    0
  )

  await supabaseAdmin
    .from('posts')
    .update({ upvote_count: upvoteCount })
    .eq('id', id)

  return Response.json({ upvote_count: upvoteCount })
}
