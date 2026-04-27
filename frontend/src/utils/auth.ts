export type UserRole = 'admin' | 'provider' | 'customer'

const AUTH_ROLE_KEY = 'auth_role'

export function getCurrentUserRole(): UserRole | null {
  const directRole = localStorage.getItem(AUTH_ROLE_KEY)
  if (isUserRole(directRole)) {
    return directRole
  }

  const commonRoleKeys = ['role', 'userRole']
  for (const key of commonRoleKeys) {
    const role = localStorage.getItem(key)
    if (isUserRole(role)) {
      return role
    }
  }

  const rawUser = localStorage.getItem('user')
  if (!rawUser) {
    return null
  }

  try {
    const parsed = JSON.parse(rawUser) as { role?: unknown }
    if (isUserRole(parsed.role)) {
      return parsed.role
    }
  } catch {
    return null
  } 

  return null
}

export function setCurrentUserRole(role: UserRole): void {
  localStorage.setItem(AUTH_ROLE_KEY, role)
}

export function clearCurrentUserRole(): void {
  localStorage.removeItem(AUTH_ROLE_KEY)
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'provider' || value === 'customer'
}
