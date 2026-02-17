const API_BASE_URL = 'http://localhost:3000'

export type ProfileStatus =
  | { status: 'idle' }
  | { status: 'running'; started_at: string }
  | { status: 'complete'; profile: string; generated_at: string }

export async function generateTravelerProfile(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/traveler_profile/generate`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`Failed to trigger profile generation: ${res.status}`)
}

export async function getTravelerProfileStatus(): Promise<ProfileStatus> {
  const res = await fetch(`${API_BASE_URL}/traveler_profile/status`)
  if (!res.ok) throw new Error(`Failed to fetch profile status: ${res.status}`)
  return res.json() as Promise<ProfileStatus>
}
