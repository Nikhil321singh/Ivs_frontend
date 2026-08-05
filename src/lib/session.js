// Client-side session store. Tokens + the cached user live in localStorage so a
// reload keeps the user logged in; the AuthContext re-validates against the API
// on boot. deviceId is a stable per-install id the backend binds refresh tokens
// to (required by /auth/verify-otp, /auth/refresh-token, /auth/logout).
const ACCESS = 'grest.accessToken'
const REFRESH = 'grest.refreshToken'
const USER = 'grest.user'
const DEVICE = 'grest.deviceId'

export const getAccessToken = () => localStorage.getItem(ACCESS)
export const getRefreshToken = () => localStorage.getItem(REFRESH)

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER))
  } catch {
    return null
  }
}

export const setTokens = ({ accessToken, refreshToken } = {}) => {
  if (accessToken) localStorage.setItem(ACCESS, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH, refreshToken)
}

export const setUser = (user) => {
  if (user) localStorage.setItem(USER, JSON.stringify(user))
}

// Persist the full verify-otp / refresh result: { user?, accessToken, refreshToken }.
export const setSession = ({ user, accessToken, refreshToken } = {}) => {
  setTokens({ accessToken, refreshToken })
  setUser(user)
}

export const clearSession = () => {
  localStorage.removeItem(ACCESS)
  localStorage.removeItem(REFRESH)
  localStorage.removeItem(USER)
}

// Stable device identifier for this browser/install. Generated once and reused.
export const getDeviceId = () => {
  let id = localStorage.getItem(DEVICE)
  if (!id) {
    id =
      globalThis.crypto?.randomUUID?.() ??
      `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`
    localStorage.setItem(DEVICE, id)
  }
  return id
}
