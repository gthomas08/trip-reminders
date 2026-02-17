import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import {
  Plane,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  StickyNote,
  X,
  Loader2,
  AlertCircle,
  User,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import { fetchTrips, createTrip, deleteTrip, type Trip } from '@/api/trips'
import {
  generateTravelerProfile,
  getTravelerProfileStatus,
} from '@/api/profile'

export const Route = createFileRoute('/')({
  loader: async () => {
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
    <div className="min-h-screen bg-slate-900">
      {/* ── Hero Bar ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-800 to-slate-900 border-b border-slate-700/60">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left: title + next trip */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/20">
                  <Plane className="w-6 h-6 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Trip Reminders
                </h1>
              </div>
              {nextTrip ? (
                <p className="text-slate-400 text-sm mt-1 pl-1">
                  Next up:{' '}
                  <span className="text-blue-300 font-medium">
                    {nextTrip.destination}
                  </span>{' '}
                  —{' '}
                  <span className="text-slate-300">
                    {daysUntil(nextTrip.trip_date) === 0
                      ? 'today!'
                      : `in ${daysUntil(nextTrip.trip_date)} days`}
                  </span>
                </p>
              ) : (
                <p className="text-slate-500 text-sm mt-1 pl-1">
                  No upcoming trips — time to plan one!
                </p>
              )}
            </div>

            {/* Right: stats + add button */}
            <div className="flex items-center gap-3">
              <StatBadge
                value={trips.length}
                label="Total"
                color="neutral"
              />
              <StatBadge
                value={upcomingTrips.length}
                label="Upcoming"
                color="blue"
              />
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Plus size={18} />
                <span>Add Trip</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Traveler Profile Panel ───────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <TravelerProfilePanel />
      </div>

      {/* ── Trip List ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8">
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
      {isModalOpen && (
        <CreateTripModal
          form={form}
          onChange={setForm}
          onSubmit={handleCreate}
          onClose={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
          error={formError}
        />
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatBadge({
  value,
  label,
  color,
}: {
  value: number
  label: string
  color: 'neutral' | 'blue'
}) {
  const styles =
    color === 'blue'
      ? 'bg-blue-500/10 border-blue-500/25 text-blue-400'
      : 'bg-slate-800 border-slate-700 text-white'
  return (
    <div
      className={`rounded-xl px-4 py-2.5 text-center border min-w-[64px] ${styles}`}
    >
      <div className="text-xl font-bold leading-tight">{value}</div>
      <div
        className={`text-[11px] uppercase tracking-wider ${color === 'blue' ? 'text-blue-300/60' : 'text-slate-500'}`}
      >
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

  const badgeStyle =
    !upcoming
      ? 'bg-slate-700/60 text-slate-400 border-slate-600'
      : days === 0
        ? 'bg-green-500/15 text-green-400 border-green-500/30'
        : days <= 7
          ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'

  const badgeLabel = !upcoming
    ? 'Past'
    : days === 0
      ? 'Today!'
      : days === 1
        ? 'Tomorrow'
        : `${days} days`

  return (
    <div
      className={`relative flex items-start gap-0 bg-slate-800 rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-lg group ${
        upcoming
          ? 'border-slate-700 hover:border-blue-500/40 hover:shadow-blue-500/5'
          : 'border-slate-700/50 opacity-70 hover:opacity-90'
      }`}
    >
      {/* Accent stripe */}
      <div
        className={`shrink-0 w-1 self-stretch ${upcoming ? 'bg-blue-500' : 'bg-slate-600'}`}
      />

      <div className="flex-1 flex items-start gap-4 px-5 py-4 min-w-0">
        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-2">
            <h3 className="flex items-center gap-1.5 text-base font-semibold text-white">
              <MapPin
                size={15}
                className="text-blue-400 shrink-0 mt-px"
              />
              {trip.destination}
            </h3>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyle}`}
            >
              {badgeLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-1.5">
            <Calendar size={13} className="text-slate-500 shrink-0" />
            <span>{formatDate(trip.trip_date)}</span>
          </div>

          {trip.notes && (
            <div className="flex items-start gap-1.5 text-sm text-slate-500">
              <StickyNote size={13} className="shrink-0 mt-0.5" />
              <p className="line-clamp-2 leading-snug">{trip.notes}</p>
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(trip.id)}
          disabled={isDeleting}
          className="p-2 mt-0.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
          aria-label={`Delete trip to ${trip.destination}`}
        >
          {isDeleting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-700">
        <Plane className="w-9 h-9 text-slate-600" />
      </div>
      <h3 className="text-xl font-semibold text-slate-300 mb-2">
        No trips yet
      </h3>
      <p className="text-slate-500 text-sm max-w-xs mb-7">
        Start planning your adventures by adding your first trip reminder.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors cursor-pointer"
      >
        <Plus size={18} />
        Add your first trip
      </button>
    </div>
  )
}

function CreateTripModal({
  form,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
  error,
}: {
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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Plane size={18} className="text-blue-400" />
            New Trip
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3">
              <AlertCircle
                size={16}
                className="text-red-400 shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Destination <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={form.destination}
              onChange={(e) => onChange({ ...form, destination: e.target.value })}
              placeholder="e.g. Tokyo, Japan"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Trip Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              required
              value={form.trip_date}
              onChange={(e) => onChange({ ...form, trip_date: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Notes{' '}
              <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
              placeholder="Anything to remember about this trip..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors resize-none text-sm"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl font-medium transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Add Trip'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Traveler Profile Panel ────────────────────────────────────────────────────

type PanelState = 'idle' | 'running' | 'complete'

function TravelerProfilePanel() {
  const [state, setState] = useState<PanelState>('idle')
  const [profile, setProfile] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  const handleGenerate = async () => {
    setState('running')
    setProfile(null)
    setGeneratedAt(null)

    try {
      await generateTravelerProfile()
    } catch {
      setState('idle')
      return
    }

    pollRef.current = setInterval(async () => {
      try {
        const status = await getTravelerProfileStatus()
        if (status.status === 'complete') {
          stopPolling()
          setProfile(status.profile)
          setGeneratedAt(status.generated_at)
          setState('complete')
        }
      } catch {
        stopPolling()
        setState('idle')
      }
    }, 1000)
  }

  const handleRegenerate = () => {
    stopPolling()
    setState('idle')
    setProfile(null)
    setGeneratedAt(null)
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden mb-2">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-violet-500/15 rounded-lg border border-violet-500/20">
            <User className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Traveler Profile
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Background job — simulates an external API call
            </p>
          </div>
        </div>

        {state === 'complete' && (
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={12} />
            Regenerate
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        {state === 'idle' && (
          <div className="flex flex-col items-center py-4 gap-3 text-center">
            <p className="text-sm text-slate-400 max-w-sm">
              Generate a traveler profile by enqueuing a background job. The
              job simulates an external API call and returns when done.
            </p>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-violet-600/20 cursor-pointer"
            >
              <User size={15} />
              Generate Traveler Profile
            </button>
          </div>
        )}

        {state === 'running' && (
          <div className="flex flex-col items-center py-6 gap-3">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-sm font-medium text-slate-300">
              Generating profile...
            </p>
            <p className="text-xs text-slate-500">
              Job is running in the background
            </p>
          </div>
        )}

        {state === 'complete' && profile && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Profile generated</span>
              {generatedAt && (
                <span className="text-xs text-slate-500 ml-auto">
                  {new Date(generatedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 px-4 py-4 space-y-3">
              {profile.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-sm text-slate-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Loader error ──────────────────────────────────────────────────────────────

function LoaderError() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Could not reach the API
        </h2>
        <p className="text-slate-400 text-sm">
          Make sure the Rails API is running on{' '}
          <code className="text-blue-400">localhost:3000</code>.
        </p>
      </div>
    </div>
  )
}
