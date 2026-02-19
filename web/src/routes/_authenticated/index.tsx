import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plane, Plus } from 'lucide-react'
import { fetchTrips, createTrip, updateTrip, deleteTrip } from '#/api/trips'
import type { Trip } from '#/lib/schemas'
import { TripCard } from '#/components/trips/TripCard'
import { TripModal, type TripForm } from '#/components/trips/TripModal'
import { TravelerProfilePanel } from '#/components/trips/TravelerProfilePanel'
import { EmptyState } from '#/components/trips/EmptyState'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_authenticated/')({
  component: TripsPage,
})

const EMPTY_FORM: TripForm = { destination: '', trip_date: '', notes: '' }

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil(
    (new Date(dateStr + 'T00:00:00').getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  )
}

function isUpcoming(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr + 'T00:00:00') >= today
}

function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    fetchTrips().then(({ trips }) => setTrips(trips)).catch(() => {})
  }, [])

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<TripForm>(EMPTY_FORM)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [editForm, setEditForm] = useState<TripForm>(EMPTY_FORM)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [deletingId, setDeletingId] = useState<number | null>(null)

  const upcomingTrips = trips.filter((t) => isUpcoming(t.trip_date))
  const nextTrip = upcomingTrips[0]

  const openCreate = () => {
    setCreateError(null)
    setCreateForm(EMPTY_FORM)
    setCreateOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateSubmitting(true)
    setCreateError(null)
    try {
      await createTrip({ ...createForm, notes: createForm.notes || undefined })
      const { trips: updated } = await fetchTrips()
      setTrips(updated)
      setCreateOpen(false)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create trip')
    } finally {
      setCreateSubmitting(false)
    }
  }

  const openEdit = (trip: Trip) => {
    setEditError(null)
    setEditForm({ destination: trip.destination, trip_date: trip.trip_date, notes: trip.notes ?? '' })
    setEditingTrip(trip)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTrip) return
    setEditSubmitting(true)
    setEditError(null)
    try {
      const updated = await updateTrip(editingTrip.id, { ...editForm, notes: editForm.notes || undefined })
      setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setEditingTrip(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update trip')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteTrip(id)
      setTrips((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg border bg-muted mt-0.5">
                <Plane className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">My Trips</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {trips.length > 0 ? (
                    <>
                      {trips.length} trip{trips.length !== 1 ? 's' : ''} &middot;{' '}
                      {upcomingTrips.length} upcoming
                      {nextTrip && (
                        <>
                          {' '}— next:{' '}
                          <span className="text-foreground font-medium">
                            {nextTrip.destination}
                          </span>{' '}
                          {daysUntil(nextTrip.trip_date) === 0
                            ? 'today!'
                            : `in ${daysUntil(nextTrip.trip_date)} days`}
                        </>
                      )}
                    </>
                  ) : (
                    'No trips yet — time to plan one!'
                  )}
                </p>
              </div>
            </div>

            <Button onClick={openCreate} size="sm" className="shrink-0">
              <Plus />
              Add Trip
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          <TravelerProfilePanel />

          <div>
            {trips.length === 0 ? (
              <EmptyState onAdd={openCreate} />
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onDelete={handleDelete}
                    onEdit={openEdit}
                    isDeleting={deletingId === trip.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TripModal
        mode="create"
        open={createOpen}
        form={createForm}
        onChange={setCreateForm}
        onSubmit={handleCreate}
        onClose={() => setCreateOpen(false)}
        isSubmitting={createSubmitting}
        error={createError}
      />

      <TripModal
        mode="edit"
        open={editingTrip !== null}
        form={editForm}
        onChange={setEditForm}
        onSubmit={handleEdit}
        onClose={() => setEditingTrip(null)}
        isSubmitting={editSubmitting}
        error={editError}
      />
    </div>
  )
}

