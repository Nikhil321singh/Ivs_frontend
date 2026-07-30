// Public pricing (Ivs_backend /pricing) — per-feature token costs + referral
// rewards. No auth required.
import { apiRequest } from './client'

// GET /pricing — data: { tokenPerInr, features: { IVS_CHECK, DIAGNOSE },
// referral: { REFERRER_BONUS, REFEREE_WELCOME } }.
export const getPricing = () => apiRequest('/pricing', { auth: false })
