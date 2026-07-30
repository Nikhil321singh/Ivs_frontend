// Token-wallet endpoints (Ivs_backend /wallet/*). 1 token = ₹1. Paid features
// (IVS ₹20, Diagnose ₹50) debit tokens; top-ups credit them via Razorpay.
import { apiRequest } from './client'

// GET /wallet — data: { wallet: { balance, totalPurchased, totalBonus, totalSpent } }.
export const getWallet = () => apiRequest('/wallet')

// GET /wallet/transactions — paginated ledger. data: { items/transactions, page, ... }.
export const getTransactions = ({ page = 1, limit = 20 } = {}) =>
  apiRequest(`/wallet/transactions?page=${page}&limit=${limit}`)

// POST /wallet/topup/order — create a Razorpay order (amount in ₹, min 10).
// data: { orderId, amount (paise), currency, tokens, razorpayKeyId }.
export const createTopupOrder = (amount) =>
  apiRequest('/wallet/topup/order', { method: 'POST', body: { amount } })

// POST /wallet/topup/verify — confirm a completed Razorpay payment (fast-path
// credit). data: { payment, balance }.
export const verifyTopup = ({ orderId, paymentId, signature }) =>
  apiRequest('/wallet/topup/verify', {
    method: 'POST',
    body: { orderId, paymentId, signature },
  })
