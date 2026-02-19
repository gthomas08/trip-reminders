import { API_BASE_URL, getAuthToken } from './auth'
import { ProfileStatusSchema, type ProfileStatus } from '#/lib/schemas'

export type { ProfileStatus }

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function generateTravelerProfile(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/traveler_profile/generate`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to trigger profile generation: ${res.status}`)
}

export async function getTravelerProfileStatus(): Promise<ProfileStatus> {
  const res = await fetch(`${API_BASE_URL}/traveler_profile/status`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch profile status: ${res.status}`)
  return ProfileStatusSchema.parse(await res.json())
}
