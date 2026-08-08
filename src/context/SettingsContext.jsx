import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getSettings } from '../api/settings'

// Operator-controlled feature switches, read from GET /settings.
//
// FAIL CLOSED: both default to true — the strict behaviour — and stay true if
// the fetch fails or returns a malformed body. A network error must never be
// the reason someone gets to skip verification, so only an explicit `false`
// from the server relaxes anything.
//
// IN MEMORY ONLY: deliberately never written to localStorage/Preferences. An
// operator can flip these at any time and expects the change to land within
// seconds; a persisted copy would strand a user on a stale value across a
// relaunch. The cost of that choice is one request per launch, which is why
// there is also refresh() for re-reading on entry to a KYC flow.
const DEFAULTS = { aadhaarVerificationEnabled: true, kycRequired: true }

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  // Distinguishes "not fetched yet" from "fetched and both are on", so screens
  // can hold off rendering a field they may be about to hide.
  const [loaded, setLoaded] = useState(false)
  // Single-flight: mount + screen-entry refreshes can overlap on a slow link.
  const inflight = useRef(null)
  const alive = useRef(true)

  useEffect(() => () => {
    alive.current = false
  }, [])

  const refresh = useCallback(() => {
    if (inflight.current) return inflight.current
    inflight.current = getSettings()
      .then((data) => {
        if (!alive.current) return
        // Only an explicit false relaxes a switch; a missing or non-boolean
        // field falls back to the strict default.
        setSettings({
          aadhaarVerificationEnabled: data?.aadhaarVerificationEnabled !== false,
          kycRequired: data?.kycRequired !== false,
        })
      })
      .catch(() => {
        if (!alive.current) return
        setSettings(DEFAULTS)
      })
      .finally(() => {
        inflight.current = null
        if (alive.current) setLoaded(true)
      })
    return inflight.current
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = { ...settings, loaded, refresh }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within <SettingsProvider>')
  return ctx
}
