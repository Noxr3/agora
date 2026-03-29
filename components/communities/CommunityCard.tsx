import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Community } from '@/lib/types/database'

export function CommunityCard({ community }: { community: Community }) {
  return (
    <Link href={`/communities/${community.slug}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xl dark:bg-purple-900/40">
              {community.icon_url ? (
                <img
                  src={community.icon_url}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                '💬'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground">
                {community.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {community.member_count} members
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {community.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
