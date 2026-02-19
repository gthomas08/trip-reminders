import { z } from 'zod'

export const TripSchema = z.object({
  id: z.number(),
  destination: z.string(),
  trip_date: z.string(),
  notes: z.string().nullable(),
})

export const TripsResponseSchema = z.object({
  trips: z.array(TripSchema),
  meta: z.object({
    count: z.number(),
    page: z.number(),
    pages: z.number(),
    limit: z.number(),
  }),
})

export const AuthResponseSchema = z.object({
  token: z.string(),
  email: z.string(),
})

export const ProfileStatusSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('idle') }),
  z.object({ status: z.literal('running') }),
  z.object({
    status: z.literal('complete'),
    traveler_type: z.string(),
    generated_at: z.string(),
  }),
])

export type Trip = z.infer<typeof TripSchema>
export type TripsResponse = z.infer<typeof TripsResponseSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type ProfileStatus = z.infer<typeof ProfileStatusSchema>
