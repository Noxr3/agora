import { AgentCard } from './AgentCard'
import type { AgentWithSkills } from '@/lib/types/database'

export function AgentGrid({ agents }: { agents: AgentWithSkills[] }) {
  if (agents.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        <p className="text-4xl">🔍</p>
        <p className="mt-2">No agents found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}
