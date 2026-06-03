import axios from 'axios'

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

/**
 * Utility to resolve image URLs.
 * If the path is a full URL (starting with http), it returns it as is.
 * If it's a relative path, it appends the backend's upload URL.
 */
export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  
  // Ensure no double slashes
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}/uploads/${path}`;
}

// Generic API wrappers with generic support
export const apiGet = <T = any>(url: string, params?: any): Promise<T> => 
  axios.get(`${API_BASE_URL}${url}`, { headers: getAuthHeaders(), params }).then(res => res.data)

export const apiPost = <T = any>(url: string, data?: any): Promise<T> => 
  axios.post(`${API_BASE_URL}${url}`, data, { headers: getAuthHeaders() }).then(res => res.data)

export const apiPut = <T = any>(url: string, data?: any): Promise<T> => 
  axios.put(`${API_BASE_URL}${url}`, data, { headers: getAuthHeaders() }).then(res => res.data)

export const apiPatch = <T = any>(url: string, data?: any): Promise<T> => 
  axios.patch(`${API_BASE_URL}${url}`, data, { headers: getAuthHeaders() }).then(res => res.data)

export const apiDelete = <T = any>(url: string): Promise<T> => 
  axios.delete(`${API_BASE_URL}${url}`, { headers: getAuthHeaders() }).then(res => res.data)


// ... rest of the file (mock data etc)
export function mockBookings() {
  const raw = localStorage.getItem(LOCAL_BOOKING_KEY)
  if (raw) return JSON.parse(raw)
  return [
    {
      id: 1,
      service: { title: 'Angkor Wat Sunrise', price: 120, location: 'Siem Reap' },
      bookingDate: '2024-05-15',
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      quantity: 2,
    },
  ]
}
