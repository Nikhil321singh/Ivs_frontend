import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import {
  clearSession,
  getAccessToken,
  getUser,
  setSession,
  setUser as persistUser,
} from '../lib/session'

// App-wide auth state. Seeds from the cached user for an instant render, then
// re-validates against /auth/profile on boot (which also silently refreshes an
// expired access token via the api client).
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser())
  const [loading, setLoading] = useState(() => !!getAccessToken())

  useEffect(() => {
    let active = true
    if (!getAccessToken()) return undefined
    ;(async () => {
      try {
        const { user: fresh } = await authApi.getProfile()
        if (!active) return
        persistUser(fresh)
        setUserState(fresh)
      } catch {
        if (!active) return
        clearSession()
        setUserState(null)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // Store the verify-otp result: { user, accessToken, refreshToken }.
  const login = useCallback((result) => {
    setSession(result)
    setUserState(result.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Revoke best-effort — clear locally regardless.
    }
    clearSession()
    setUserState(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const { user: fresh } = await authApi.getProfile()
    persistUser(fresh)
    setUserState(fresh)
    return fresh
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    refreshUser,
    setUser: (u) => {
      persistUser(u)
      setUserState(u)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
