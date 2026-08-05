// Referral endpoint (Ivs_backend /referral) — my code + earnings.
import { apiRequest } from './client'

// GET /referral — data: { referralCode, referralsCount, rewardedCount, ... }.
export const getReferral = () => apiRequest('/referral')
