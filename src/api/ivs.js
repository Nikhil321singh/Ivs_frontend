// IVS (IMEI verification) endpoints — Ivs_backend /ivs/*.
import { apiRequest } from './client'

// POST /ivs/verify — checks IMEI(s) against C-DOT's CEIR blocklist. Costs tokens
// (IVS_CHECK) only for a definitive result; 402 if the token balance is short.
// data: { imei1Status, imei2Status, allowTransaction, referenceId, wallet, ... }.
// Statuses: 'CLEAN' | 'BLOCKED' | 'STOLEN' | 'UNKNOWN'.
export const verifyImei = ({ imei1, imei2, deviceModel } = {}) =>
  apiRequest('/ivs/verify', {
    method: 'POST',
    body: { imei1, ...(imei2 ? { imei2 } : {}), ...(deviceModel ? { deviceModel } : {}) },
  })
