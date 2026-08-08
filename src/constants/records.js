// Presentation helpers for the "Theft · Records" screen. The rows themselves are
// real, fetched live from GET /ivs/history (see src/api/ivs.js) — this file only
// maps a verification's status/date/IMEI into what the card renders.

// CEIR status → badge tone + label. A certificate is only meaningful for a CLEAN
// (safe-to-trade) device, so the page keys the download button off `CLEAN`.
export const STATUS_BADGE = {
  CLEAN: { label: 'Clean', tone: 'success' },
  BLOCKED: { label: 'Blocked', tone: 'danger' },
  STOLEN: { label: 'Stolen', tone: 'danger' },
  UNKNOWN: { label: 'Not verified', tone: 'muted' },
}

export const statusBadge = (status) => STATUS_BADGE[status] || STATUS_BADGE.UNKNOWN

// Group a bare 15-digit IMEI into the readable "35 471203 889541 2" layout.
export const groupImei = (s) =>
  String(s || '')
    .replace(/\D/g, '')
    .replace(/(.{2})(.{6})(.{6})(.{1}).*/, '$1 $2 $3 $4')
    .trim() || '—'

// "12 Jun 2026 · 14:32" — matches the Checked line in the Figma card.
export const recordDate = (iso) => {
  try {
    return new Date(iso)
      .toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(',', ' ·')
  } catch {
    return '—'
  }
}
