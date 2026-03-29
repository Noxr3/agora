import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { truncate } from '@/lib/utils/format'
import type { AgentWithSkills, HealthStatus } from '@/lib/types/database'

const STATUS_DOT: Record<HealthStatus, { color: string; label: string }> = {
  online:  { color: 'bg-green-500',  label: 'Online'  },
  offline: { color: 'bg-red-500',    label: 'Offline' },
  unknown: { color: 'bg-stone-400',  label: 'Unknown' },
}

function HealthDot({ status }: { status: HealthStatus }) {
  const { color, label } = STATUS_DOT[status] ?? STATUS_DOT.unknown
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${color} shrink-0`}
      title={label}
      aria-label={label}
    />
  )
}

export function AgentCard({ agent }: { agent: AgentWithSkills }) {
  const status: HealthStatus = agent.health_status ?? 'unknown'

  return (
    <Link href={`/agents/${agent.id}`} className="block h-full">
      <Card className="h-full transition-colors hover:bg-accent/40">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 rounded-md shrink-0">
              <AvatarImage src={agent.avatar_url ?? undefined} alt={agent.name} />
              <AvatarFallback className="rounded-md text-base bg-muted">🤖</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold leading-tight">{agent.name}</h3>
                <HealthDot status={status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                by {agent.provider || 'Unknown'}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <span>▲</span>
              <span>{agent.upvote_count}</span>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {truncate(agent.description, 120)}
          </p>
          {agent.agent_skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {agent.agent_skills.slice(0, 4).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-xs font-normal rounded-sm px-1.5">
                  {skill.name}
                </Badge>
              ))}
              {agent.agent_skills.length > 4 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{agent.agent_skills.length - 4}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
