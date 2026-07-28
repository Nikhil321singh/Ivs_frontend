// Thin fetch wrapper around the Ivs_backend API.
// - Prefixes VITE_API_BASE_URL and attaches the bearer access token.
// - Unwraps the standard envelope { success, message, errors, data } — resolves
//   to `data` on success, throws ApiError otherwise.
// - On a 401 it transparently refreshes the token pair once (single-flight) and
//   retries; if the refresh fails, it clears the session and surfaces a 401 so
//   the AuthContext can bounce the user to login.
import {
  getAccessToken,
  getRefreshToken,
  getDeviceId,
  setTokens,
  clearSession,
} from '../lib/session'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// Single-flight refresh: concurrent 401s share one refresh request.
let refreshPromise = null

async function refreshTokens() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new ApiError('No refresh token', 401)

  const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, deviceId: getDeviceId() }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body.success) {
    throw new ApiError(body.message || 'Session expired', res.status, body.errors || [])
  }
  setTokens(body.data)
  return body.data.accessToken
}

function ensureRefreshed() {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function apiRequest(
  path,
  { method = 'GET', body, auth = true, isForm = false, _retried = false } = {}
) {
  const headers = {}
  if (!isForm && body != null) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body == null ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 0)
  }

  const payload = await res.json().catch(() => ({}))

  // Access token expired — refresh once and replay the original request.
  if (res.status === 401 && auth && !_retried && getRefreshToken()) {
    try {
      await ensureRefreshed()
    } catch {
      clearSession()
      throw new ApiError('Session expired. Please log in again.', 401)
    }
    return apiRequest(path, { method, body, auth, isForm, _retried: true })
  }

  if (!res.ok || !payload.success) {
    throw new ApiError(
      payload.message || `Request failed (${res.status})`,
      res.status,
      payload.errors || []
    )
  }

  return payload.data
}
