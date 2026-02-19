import { useState } from 'react'
import { format } from 'date-fns'
import { Plane, Pencil, CalendarIcon, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { Textarea } from '#/components/ui/textarea'

export type TripForm = {
  destination: string
  trip_date: string
  notes: string
}

interface Props {
  mode: 'create' | 'edit'
  open: boolean
  form: TripForm
  onChange: (form: TripForm) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  isSubmitting: boolean
  error: string | null
}

export function TripModal({
  mode,
  open,
  form,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
  error,
}: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  const selectedDate = form.trip_date
    ? new Date(form.trip_date + 'T00:00:00')
    : undefined

  const isCreate = mode === 'create'
  const destId = isCreate ? 'destination' : 'edit-destination'
  const notesId = isCreate ? 'notes' : 'edit-notes'

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreate ? (
              <Plane size={16} className="text-muted-foreground" />
            ) : (
              <Pencil size={16} className="text-muted-foreground" />
            )}
            {isCreate ? 'New Trip' : 'Edit Trip'}
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
            <Label htmlFor={destId}>
              Destination <span className="text-destructive">*</span>
            </Label>
            <Input
              id={destId}
              type="text"
              required
              autoFocus
              value={form.destination}
              onChange={(e) => onChange({ ...form, destination: e.target.value })}
              placeholder="e.g. Tokyo, Japan"
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Trip Date <span className="text-destructive">*</span>
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                  data-empty={!form.trip_date}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    onChange({
                      ...form,
                      trip_date: date ? format(date, 'yyyy-MM-dd') : '',
                    })
                    setCalendarOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" name="trip_date" value={form.trip_date} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={notesId}>
              Notes{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id={notesId}
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
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving…
                </>
              ) : isCreate ? (
                'Add Trip'
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
