import { AuthResponseSchema, type AuthResponse } from '#/lib/schemas'

export const API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3000'

export async function signUp(
  email: string,
  password: string,
  passwordConfirmation: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: { email, password, password_confirmation: passwordConfirmation },
    }),
  })

  const data = (await res.json()) as unknown
  if (!res.ok) {
    const err = data as { errors?: string[] }
    throw new Error(err.errors?.join(', ') ?? 'Sign up failed')
  }

  const parsed = AuthResponseSchema.parse(data)
  localStorage.setItem('auth_token', parsed.token)
  localStorage.setItem('auth_email', parsed.email)
  return parsed
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = (await res.json()) as unknown
  if (!res.ok) {
    const err = data as { errors?: string[] }
    throw new Error(err.errors?.[0] ?? 'Sign in failed')
  }

  const parsed = AuthResponseSchema.parse(data)
  localStorage.setItem('auth_token', parsed.token)
  localStorage.setItem('auth_email', parsed.email)
  return parsed
}

export async function signOut(): Promise<void> {
  if (typeof window === 'undefined') return
  const token = localStorage.getItem('auth_token')
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/signout`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // Clear locally even if the request fails
    }
  }
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_email')
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function getAuthEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_email')
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}
