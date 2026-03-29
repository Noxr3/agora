import { Separator } from '@/components/ui/separator'

export function Footer() {
  return (
    <footer>
      <Separator />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-xs text-muted-foreground">
        <p>Agora — A2A Agent Discovery Platform</p>
        <p>A2A Protocol v0.3</p>
      </div>
    </footer>
  )
}
