import { useState, useEffect, useRef } from 'react'
import {
  Loader2,
  User,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import { generateTravelerProfile, getTravelerProfileStatus } from '#/api/profile'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'

type PanelState = 'idle' | 'running' | 'complete'

export function TravelerProfilePanel() {
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    handleGenerate()
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
