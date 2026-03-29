import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl">👾</div>
      <h1 className="mt-4 text-3xl font-bold">404 — Not Found</h1>
      <p className="mt-2 text-muted-foreground">
        This page doesn&apos;t exist in any dimension.
      </p>
      <div className="mt-6">
        <Button render={<Link href="/">Go Home</Link>} />
      </div>
    </div>
  )
}
