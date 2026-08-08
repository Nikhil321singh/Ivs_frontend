// Operator-controlled feature switches (Ivs_backend /settings).
import { apiRequest } from './client'

// GET /settings — public, no auth. data: { aadhaarVerificationEnabled, kycRequired }.
// Toggled live from the admin console, so the response must never be cached to
// storage — see SettingsContext.
export const getSettings = () => apiRequest('/settings', { auth: false })
