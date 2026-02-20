import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plane, LogOut, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { signOut, getAuthEmail, isAuthenticated } from '@/api/auth'
import { useTheme } from '@/routes/__root'

export default function Header() {
  const router = useRouter()
  const { pathname } = useLocation()
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    setEmail(getAuthEmail())
  }, [pathname])

  const handleSignOut = () => {
    signOut()
    void router.navigate({ to: '/signin' })
  }

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

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <Separator orientation="vertical" className="h-5" />

        {/* Auth actions */}
        <div className="flex items-center gap-2 shrink-0">
          {authenticated ? (
            <>
              {email && (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {email}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/signin">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
