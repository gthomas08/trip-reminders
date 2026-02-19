import { API_BASE_URL, getAuthToken } from './auth'
import {
  TripSchema,
  TripsResponseSchema,
  type Trip,
  type TripsResponse,
} from '#/lib/schemas'

export type { Trip }

export interface CreateTripData {
  destination: string
  trip_date: string
  notes?: string
}

export type UpdateTripData = CreateTripData

function authHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchTrips(): Promise<TripsResponse> {
  const res = await fetch(`${API_BASE_URL}/trips`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to fetch trips: ${res.status}`)
  return TripsResponseSchema.parse(await res.json())
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
  return TripSchema.parse(await res.json())
}

export async function updateTrip(id: number, data: UpdateTripData): Promise<Trip> {
  const res = await fetch(`${API_BASE_URL}/trips/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ trip: data }),
  })
  if (!res.ok) {
    const error = (await res.json()) as { errors?: string[] }
    throw new Error(error.errors?.join(', ') || 'Failed to update trip')
  }
  return TripSchema.parse(await res.json())
}

export async function deleteTrip(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/trips/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to delete trip: ${res.status}`)
}
