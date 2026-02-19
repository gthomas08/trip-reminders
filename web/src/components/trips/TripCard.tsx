import {
  Pencil,
  Trash2,
  CalendarIcon,
  MapPin,
  StickyNote,
  Loader2,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import type { Trip } from '#/lib/schemas'

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

interface Props {
  trip: Trip
  onDelete: (id: number) => void
  onEdit: (trip: Trip) => void
  isDeleting: boolean
}

export function TripCard({ trip, onDelete, onEdit, isDeleting }: Props) {
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
            <CalendarIcon size={12} className="shrink-0" />
            <span>{formatDate(trip.trip_date)}</span>
          </div>

          {trip.notes && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-1.5">
              <StickyNote size={12} className="shrink-0 mt-0.5" />
              <p className="line-clamp-2 leading-snug">{trip.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(trip)}
            aria-label={`Edit trip to ${trip.destination}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(trip.id)}
            disabled={isDeleting}
            aria-label={`Delete trip to ${trip.destination}`}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            {isDeleting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
