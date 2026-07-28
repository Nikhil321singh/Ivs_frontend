// Auth endpoints (Ivs_backend /auth/*). countryCode defaults to +91 to match
// the backend's DEFAULT_COUNTRY_CODE.
import { apiRequest } from './client'
import { getDeviceId } from '../lib/session'

// POST /auth/send-otp — fires a real MSG91 SMS. data: { mobile, countryCode }.
export const sendOtp = (mobile, countryCode = '+91') =>
  apiRequest('/auth/send-otp', {
    method: 'POST',
    auth: false,
    body: { mobile, countryCode },
  })

// POST /auth/verify-otp — data: { user, accessToken, refreshToken }.
// 200 = existing user login, 201 = new account created.
export const verifyOtp = ({ mobile, otp, countryCode = '+91' }) =>
  apiRequest('/auth/verify-otp', {
    method: 'POST',
    auth: false,
    body: { mobile, countryCode, otp, deviceId: getDeviceId() },
  })

// POST /auth/logout — revokes this device's refresh token. data: {}.
export const logout = () =>
  apiRequest('/auth/logout', { method: 'POST', body: { deviceId: getDeviceId() } })

// GET /auth/profile — data: { user }.
export const getProfile = () => apiRequest('/auth/profile')
