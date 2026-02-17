import { Link } from '@tanstack/react-router'
import { Plane } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800 shadow-md">
      <Link
        to="/"
        className="flex items-center gap-2.5 group"
        aria-label="Trip Reminders home"
      >
        <div className="p-1.5 bg-blue-500/15 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/25 transition-colors">
          <Plane className="w-5 h-5 text-blue-400" />
        </div>
        <span className="text-white font-semibold text-base tracking-tight">
          Trip Reminders
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        <Link
          to="/"
          className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          activeProps={{ className: 'px-3 py-1.5 text-sm text-blue-400 bg-blue-500/10 rounded-lg' }}
        >
          Trips
        </Link>
      </nav>
    </header>
  )
}
