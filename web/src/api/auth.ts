const API_BASE_URL = 'http://localhost:3000'

export interface AuthResponse {
  token: string
  email: string
}

export interface AuthError {
  error?: string
  errors?: string[]
}

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

  const data = (await res.json()) as AuthResponse & AuthError
  if (!res.ok) {
    const message =
      data.errors?.join(', ') ?? data.error ?? 'Sign up failed'
    throw new Error(message)
  }

  localStorage.setItem('auth_token', data.token)
  localStorage.setItem('auth_email', data.email)
  return { token: data.token, email: data.email }
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

  const data = (await res.json()) as AuthResponse & AuthError
  if (!res.ok) {
    throw new Error(data.error ?? 'Sign in failed')
  }

  localStorage.setItem('auth_token', data.token)
  localStorage.setItem('auth_email', data.email)
  return { token: data.token, email: data.email }
}

export function signOut(): void {
  if (typeof window === 'undefined') return
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
