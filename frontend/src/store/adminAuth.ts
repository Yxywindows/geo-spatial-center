const AUTH_KEY = 'gs-admin-auth'
const ADMIN_KEY = 'geo-spatial-internal-key-2026'

const MOCK_ADMIN = {
  username: 'sc_admin',
  password: 'sc123',
  name: '地理空间分中心管理员',
}

export function adminLogin(username: string, password: string): boolean {
  if (username === MOCK_ADMIN.username && password === MOCK_ADMIN.password) {
    sessionStorage.setItem(AUTH_KEY, 'true')
    return true
  }
  return false
}

export function adminLogout() {
  sessionStorage.removeItem(AUTH_KEY)
}

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === 'true'
}

export function getAdminName(): string {
  return MOCK_ADMIN.name
}

export { ADMIN_KEY }
