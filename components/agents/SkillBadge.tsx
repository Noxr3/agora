import { Badge } from '@/components/ui/badge'

export function SkillBadge({ name }: { name: string }) {
  return (
    <Badge variant="secondary" className="text-xs font-normal rounded-sm px-1.5">
      {name}
    </Badge>
  )
}
