// IVS (IMEI verification) endpoints — Ivs_backend /ivs/*.
import { apiRequest } from './client'

// POST /ivs/verify — checks IMEI(s) against C-DOT's CEIR blocklist. Costs tokens
// (IVS_CHECK) only for a definitive result; 402 if the token balance is short.
// data: { imei1Status, imei2Status, allowTransaction, referenceId, wallet, ... }.
// Statuses: 'CLEAN' | 'BLOCKED' | 'STOLEN' | 'UNKNOWN'.
export const verifyImei = ({ imei1, imei2, deviceModel, customerName } = {}) =>
  apiRequest('/ivs/verify', {
    method: 'POST',
    body: {
      imei1,
      ...(imei2 ? { imei2 } : {}),
      ...(deviceModel ? { deviceModel } : {}),
      ...(customerName ? { customerName } : {}),
    },
  })

// GET /ivs/history — the user's stored IMEI verifications, newest first.
// data: { items:[{ id, referenceId, customerName, imei1, deviceModel,
//   imei1Status, charged, cost, verifiedAt }], page, limit, total, totalPages }.
export const getIvsHistory = ({ page = 1, limit = 20 } = {}) =>
  apiRequest(`/ivs/history?page=${page}&limit=${limit}`)

// Customer Aadhaar OTP for the IMEI flow — verifies the device seller's Aadhaar,
// independent of the logged-in user's own KYC (unlike /user/aadhaar/*, which
// blocks once the account owner is verified). Stateless: send-otp returns a refId
// that verify-otp needs. data: send → { refId }; verify → { verified: true }.
export const sendCustomerAadhaarOtp = (aadhaarNumber) =>
  apiRequest('/ivs/aadhaar/send-otp', { method: 'POST', body: { aadhaarNumber } })

export const verifyCustomerAadhaarOtp = (refId, otp) =>
  apiRequest('/ivs/aadhaar/verify-otp', { method: 'POST', body: { refId, otp } })
