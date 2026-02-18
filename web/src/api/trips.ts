import { getAuthToken } from './auth'

const API_BASE_URL = 'http://localhost:3000'

export interface Trip {
  id: number
  destination: string
  trip_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateTripData {
  destination: string
  trip_date: string
  notes?: string
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchTrips(): Promise<Trip[]> {
  const res = await fetch(`${API_BASE_URL}/trips`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch trips: ${res.status}`)
  return res.json() as Promise<Trip[]>
}

export async function createTrip(data: CreateTripData): Promise<Trip> {
  const res = await fetch(`${API_BASE_URL}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ trip: data }),
  })
  if (!res.ok) {
    const error = (await res.json()) as { errors?: string[] }
    throw new Error(error.errors?.join(', ') || 'Failed to create trip')
  }
  return res.json() as Promise<Trip>
}

export async function deleteTrip(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/trips/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to delete trip: ${res.status}`)
}
