import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import {
  Plane,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  StickyNote,
  Loader2,
  AlertCircle,
  User,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import { fetchTrips, createTrip, deleteTrip, type Trip } from '@/api/trips'
import { getAuthToken } from '@/api/auth'
import {
  generateTravelerProfile,
  getTravelerProfileStatus,
} from '@/api/profile'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !getAuthToken()) {
      throw redirect({ to: '/signin' })
    }
  },
  loader: async () => {
    if (typeof window === 'undefined') return { trips: [] }
    const trips = await fetchTrips()
    return { trips }
  },
  errorComponent: LoaderError,
  component: TripsPage,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function isUpcoming(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr + 'T00:00:00') >= today
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil(
    (new Date(dateStr + 'T00:00:00').getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function TripsPage() {
  const { trips } = Route.useLoaderData()
  const router = useRouter()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({ destination: '', trip_date: '', notes: '' })

  const upcomingTrips = trips.filter((t: Trip) => isUpcoming(t.trip_date))
  const nextTrip: Trip | undefined = upcomingTrips[0]

  const openModal = () => {
    setFormError(null)
    setForm({ destination: '', trip_date: '', notes: '' })
    setIsModalOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    try {
      await createTrip({ ...form, notes: form.notes || undefined })
      setIsModalOpen(false)
      await router.invalidate()
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to create trip',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteTrip(id)
      await router.invalidate()
    } catch {
      // TODO: surface delete errors
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left: title + next trip */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg border bg-muted mt-0.5">
                <Plane className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  My Trips
                </h1>
                {nextTrip ? (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Next up:{' '}
                    <span className="text-foreground font-medium">
                      {nextTrip.destination}
                    </span>{' '}
                    —{' '}
                    {daysUntil(nextTrip.trip_date) === 0
                      ? 'today!'
                      : `in ${daysUntil(nextTrip.trip_date)} days`}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    No upcoming trips — time to plan one!
                  </p>
                )}
              </div>
            </div>

            {/* Right: stats + add button */}
            <div className="flex items-center gap-3">
              <StatPill value={trips.length} label="Total" />
              <StatPill value={upcomingTrips.length} label="Upcoming" />
              <Button onClick={openModal} size="sm">
                <Plus />
                Add Trip
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* ── Traveler Profile Panel ─────────────────────────── */}
        <TravelerProfilePanel />

        <Separator />

        {/* ── Trip List ──────────────────────────────────────── */}
        {trips.length === 0 ? (
          <EmptyState onAdd={openModal} />
        ) : (
          <div className="space-y-3">
            {trips.map((trip: Trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={handleDelete}
                isDeleting={deletingId === trip.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Create Modal ─────────────────────────────────────── */}
      <CreateTripModal
        open={isModalOpen}
        form={form}
        onChange={setForm}
        onSubmit={handleCreate}
        onClose={() => setIsModalOpen(false)}
        isSubmitting={isSubmitting}
        error={formError}
      />
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center px-3 py-1.5 rounded-md border bg-muted/50 min-w-[56px]">
      <div className="text-lg font-bold leading-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  )
}

function TripCard({
  trip,
  onDelete,
  isDeleting,
}: {
  trip: Trip
  onDelete: (id: number) => void
  isDeleting: boolean
}) {
  const upcoming = isUpcoming(trip.trip_date)
  const days = daysUntil(trip.trip_date)

  const badgeVariant: 'default' | 'secondary' | 'outline' = !upcoming
    ? 'outline'
    : days === 0 || days <= 7
      ? 'default'
      : 'secondary'

  const badgeLabel = !upcoming
    ? 'Past'
    : days === 0
      ? 'Today!'
      : days === 1
        ? 'Tomorrow'
        : `${days} days`

  return (
    <Card className={!upcoming ? 'opacity-60' : undefined}>
      <CardContent className="flex items-start gap-4 py-4 px-5">
        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-2">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <MapPin size={14} className="text-muted-foreground shrink-0 mt-px" />
              {trip.destination}
            </h3>
            <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
              {badgeLabel}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Calendar size={12} className="shrink-0" />
            <span>{formatDate(trip.trip_date)}</span>
          </div>

          {trip.notes && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1.5">
              <StickyNote size={12} className="shrink-0 mt-0.5" />
              <p className="line-clamp-2 leading-snug">{trip.notes}</p>
            </div>
          )}
        </div>

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(trip.id)}
          disabled={isDeleting}
          aria-label={`Delete trip to ${trip.destination}`}
          className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          {isDeleting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="p-5 rounded-full border bg-muted mb-5">
        <Plane className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No trips yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Start planning your adventures by adding your first trip reminder.
      </p>
      <Button onClick={onAdd}>
        <Plus />
        Add your first trip
      </Button>
    </div>
  )
}

function CreateTripModal({
  open,
  form,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
  error,
}: {
  open: boolean
  form: { destination: string; trip_date: string; notes: string }
  onChange: (form: {
    destination: string
    trip_date: string
    notes: string
  }) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  error: string | null
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane size={16} className="text-muted-foreground" />
            New Trip
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="destination">
              Destination <span className="text-destructive">*</span>
            </Label>
            <Input
              id="destination"
              type="text"
              required
              autoFocus
              value={form.destination}
              onChange={(e) => onChange({ ...form, destination: e.target.value })}
              placeholder="e.g. Tokyo, Japan"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trip_date">
              Trip Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="trip_date"
              type="date"
              required
              value={form.trip_date}
              onChange={(e) => onChange({ ...form, trip_date: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">
              Notes{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
              placeholder="Anything to remember about this trip..."
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-1 gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Add Trip'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Traveler Profile Panel ────────────────────────────────────────────────────

type PanelState = 'idle' | 'running' | 'complete'

function TravelerProfilePanel() {
  const [state, setState] = useState<PanelState>('idle')
  const [travelerType, setTravelerType] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      try {
        const status = await getTravelerProfileStatus()
        if (status.status === 'complete') {
          stopPolling()
          setTravelerType(status.traveler_type)
          setGeneratedAt(status.generated_at)
          setState('complete')
        }
      } catch {
        stopPolling()
        setState('idle')
      }
    }, 1000)
  }

  useEffect(() => {
    getTravelerProfileStatus()
      .then((status) => {
        if (status.status === 'complete') {
          setTravelerType(status.traveler_type)
          setGeneratedAt(status.generated_at)
          setState('complete')
        } else if (status.status === 'running') {
          setState('running')
          startPolling()
        }
      })
      .catch(() => {})
    return () => stopPolling()
  }, [])

  const handleGenerate = async () => {
    setState('running')
    setTravelerType(null)
    setGeneratedAt(null)

    try {
      await generateTravelerProfile()
    } catch {
      setState('idle')
      return
    }

    startPolling()
  }

  const handleRegenerate = () => {
    stopPolling()
    setState('idle')
    setTravelerType(null)
    setGeneratedAt(null)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md border bg-muted">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm">Traveler Profile</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Background job — simulates an external API call
              </CardDescription>
            </div>
          </div>

          {state === 'complete' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              className="h-7 text-xs gap-1.5"
            >
              <RefreshCw size={11} />
              Regenerate
            </Button>
          )}
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-5">
        {state === 'idle' && (
          <div className="flex flex-col items-center py-4 gap-3 text-center">
            <p className="text-sm text-muted-foreground max-w-sm">
              Generate a traveler profile by enqueuing a background job. The job
              simulates an external API call and returns when done.
            </p>
            <Button onClick={handleGenerate} variant="secondary">
              <User />
              Generate Traveler Profile
            </Button>
          </div>
        )}

        {state === 'running' && (
          <div className="flex flex-col items-center py-6 gap-3">
            <Loader2 className="w-7 h-7 text-muted-foreground animate-spin" />
            <p className="text-sm font-medium">Generating profile...</p>
            <p className="text-xs text-muted-foreground">
              Job is running in the background
            </p>
          </div>
        )}

        {state === 'complete' && travelerType && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle size={15} className="text-green-600 dark:text-green-400" />
              <span className="font-medium text-foreground">Profile generated</span>
              {generatedAt && (
                <span className="ml-auto text-xs">
                  {new Date(generatedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="rounded-md border bg-muted/40 px-4 py-4 flex items-center justify-center">
              <span className="text-2xl font-semibold capitalize tracking-wide">
                {travelerType}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Loader error ──────────────────────────────────────────────────────────────

function LoaderError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="p-3 rounded-full border bg-destructive/10 w-fit mx-auto mb-2">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-base">Could not reach the API</CardTitle>
          <CardDescription>
            Make sure the Rails API is running on{' '}
            <code className="text-foreground font-mono text-xs">localhost:3000</code>.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
