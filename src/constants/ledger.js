// Maps a wallet transaction (GET /wallet/transactions) to display metadata.
// Backend enums: TXN_TYPE CREDIT|DEBIT · TXN_REASON TOPUP|FEATURE_CHARGE|
// REFERRAL_BONUS|WELCOME_BONUS|REFUND|ADJUSTMENT · TXN_REF_TYPE IVS_CHECK|
// DIAGNOSE|PAYMENT|REFERRAL.

// Prefer the specific feature (referenceType) over the generic reason.
const LABELS = {
  IVS_CHECK: { title: 'IMEI verification', icon: 'ic-rec-theft' },
  DIAGNOSE: { title: 'Device diagnosis', icon: 'ic-rec-diagnose' },
  TOPUP: { title: 'Token top-up', icon: 'ic-rec-payment' },
  REFERRAL_BONUS: { title: 'Referral bonus', icon: 'ic-rec-price' },
  WELCOME_BONUS: { title: 'Welcome bonus', icon: 'ic-rec-price' },
  REFUND: { title: 'Refund', icon: 'ic-rec-payment' },
  ADJUSTMENT: { title: 'Adjustment', icon: 'ic-rec-payment' },
}

export function txnMeta(txn) {
  const key = txn.referenceType === 'IVS_CHECK' || txn.referenceType === 'DIAGNOSE'
    ? txn.referenceType
    : txn.reason
  const base = LABELS[key] || LABELS[txn.reason] || { title: 'Transaction', icon: 'ic-rec-payment' }
  const credit = txn.type === 'CREDIT'
  return {
    ...base,
    credit,
    amountLabel: `${credit ? '+' : '−'}${Math.abs(txn.amount)} ${Math.abs(txn.amount) === 1 ? 'token' : 'tokens'}`,
  }
}

export function txnDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return ''
  }
}
