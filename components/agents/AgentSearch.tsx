'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const skillFilters = [
  'All',
  'coding',
  'data',
  'creative',
  'devops',
  'research',
  'assistant',
]

export function AgentSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const currentSkill = searchParams.get('skill') ?? ''
  const currentQuery = searchParams.get('q') ?? ''

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    params.delete('page')
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${isPending ? 'opacity-60' : ''}`}>
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <Input
          type="text"
          placeholder="Search agents..."
          defaultValue={currentQuery}
          onChange={(e) => updateParams({ q: e.target.value })}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skillFilters.map((skill) => {
          const value = skill === 'All' ? '' : skill
          const isActive = currentSkill === value
          return (
            <button
              key={skill}
              onClick={() => updateParams({ skill: value })}
            >
              <Badge
                variant={isActive ? 'default' : 'secondary'}
                className="cursor-pointer rounded-sm text-xs font-normal hover:opacity-80 transition-opacity"
              >
                {skill}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}
