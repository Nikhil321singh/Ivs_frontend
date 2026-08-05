// Device-diagnosis endpoint (Ivs_backend /diagnose). Costs DIAGNOSE tokens (50)
// only on a definitive SUCCESS; ERROR/UNKNOWN are free to retry.
import { apiRequest } from './client'

// POST /diagnose — body { imei, deviceModel? }. 402 if the token balance is short.
// data: { sessionId, resultStatus, result, providerRefId, wallet }.
// resultStatus: 'SUCCESS' | 'ERROR' | 'UNKNOWN'. `result` is the raw provider
// report payload (shape is provider-defined).
export const runDiagnose = ({ imei, deviceModel } = {}) =>
  apiRequest('/diagnose', {
    method: 'POST',
    body: { imei, ...(deviceModel ? { deviceModel } : {}) },
  })
