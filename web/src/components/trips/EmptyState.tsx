import { Plane, Plus } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface Props {
  onAdd: () => void
}

export function EmptyState({ onAdd }: Props) {
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
