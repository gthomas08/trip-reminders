import { Link } from '@tanstack/react-router'
import { Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function Header() {
  return (
    <header className="bg-background border-b">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="Trip Reminders home"
        >
          <Plane className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Trip Reminders</span>
        </Link>

        <Separator orientation="vertical" className="h-5" />

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          <Button asChild variant="ghost" size="sm">
            <Link
              to="/"
              activeProps={{ className: 'bg-accent text-accent-foreground' }}
            >
              Trips
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
