const API_BASE_URL = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000'
const LOCAL_BOOKING_KEY = 'mockBookings'

export function getAuthToken(): string | null {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    localStorage.getItem('jwt') ||
    null
  )
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function buildUrl(path: string) {
  const base = API_BASE_URL.replace(/\/+$|^\s+|\s+$/g, '')
  const normalizedPath = path.replace(/^\/+/, '')
  return `${base}/${normalizedPath}`
}

async function parseResponse(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = buildUrl(path)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  })

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || response.statusText || 'Request failed')
  }
  return payload as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = buildUrl(path)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  })

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || response.statusText || 'Request failed')
  }
  return payload as T
}

export function saveBookingLocally(booking: unknown) {
  const existing = loadLocalBookings()
  existing.push(booking)
  localStorage.setItem(LOCAL_BOOKING_KEY, JSON.stringify(existing))
}

export function loadLocalBookings(): unknown[] {
  const raw = localStorage.getItem(LOCAL_BOOKING_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
