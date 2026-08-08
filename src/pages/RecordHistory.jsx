import { useEffect, useState } from 'react'
import PhoneFrame from '../components/PhoneFrame'
import BottomNav from '../components/BottomNav'
import { getIvsHistory } from '../api/ivs'
import { downloadCertificate } from '../lib/pdf'
import { statusBadge, groupImei, recordDate } from '../constants/records'

// "Theft · Records" — the user's stored IMEI verifications, fetched live from
// GET /ivs/history. View-only (the check was already paid at verification time);
// each CLEAN record offers its Grest certificate as a PDF download.
const BADGE_TONE = {
  success: 'bg-success-subtle text-success',
  danger: 'bg-danger-subtle text-primary',
  muted: 'bg-field text-muted',
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-[13px] font-normal text-muted">{label}</span>
      <span className="truncate text-right text-[14px] font-semibold text-ink">{value}</span>
    </div>
  )
}

function RecordCard({ item }) {
  const badge = statusBadge(item.imei1Status)
  const isClean = item.imei1Status === 'CLEAN'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onDownload = async () => {
    if (busy) return
    setError('')
    setBusy(true)
    try {
      await downloadCertificate({
        verify: { imei1Status: item.imei1Status, verifiedAt: item.verifiedAt },
        imei1: item.imei1,
        deviceModel: item.deviceModel,
      })
    } catch (err) {
      if (err?.message !== 'Share canceled') setError('Could not create the certificate. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border-[1.5px] border-line bg-white px-[18px] py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[16px] font-bold text-ink">{item.referenceId}</span>
        <span
          className={`flex items-center gap-1 rounded-[8px] px-2.5 py-[5px] text-[11px] font-semibold ${
            BADGE_TONE[badge.tone]
          }`}
        >
          {badge.tone === 'success' && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l4 4 10-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {badge.label}
        </span>
      </div>

      <div className="h-px w-full bg-line" />

      <div className="flex flex-col gap-2.5">
        <Row label="Name" value={item.customerName} />
        <Row label="IMEI" value={groupImei(item.imei1)} />
        <Row label="Device" value={item.deviceModel} />
        <Row label="Checked" value={recordDate(item.verifiedAt)} />
      </div>

      <div className="flex items-center justify-between gap-3 pt-0.5">
        <span
          className={`flex items-center gap-1.5 text-[13px] font-semibold ${
            item.charged ? 'text-success' : 'text-muted'
          }`}
        >
          {item.charged ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12l4 4 10-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Paid ₹{item.cost}
            </>
          ) : (
            'No charge'
          )}
        </span>

        {isClean && (
          <button
            type="button"
            onClick={onDownload}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-[10px] bg-indigo-subtle px-3 py-2 text-[12px] font-bold text-secondary transition active:scale-[0.97] disabled:opacity-60"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {busy ? 'Preparing…' : 'Certificate'}
          </button>
        )}
      </div>

      {error && <p className="text-[12px] font-medium text-primary">{error}</p>}
    </div>
  )
}

export default function RecordHistory() {
  const [state, setState] = useState({ loading: true, error: '', items: [] })

  useEffect(() => {
    let alive = true
    getIvsHistory({ page: 1, limit: 50 })
      .then((res) => alive && setState({ loading: false, error: '', items: res.items || [] }))
      .catch(
        (err) =>
          alive && setState({ loading: false, error: err.message || 'Could not load records.', items: [] })
      )
    return () => {
      alive = false
    }
  }, [])

  return (
    <PhoneFrame scroll={false} bg="bg-screen-grad">
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6 pt-3 font-spline">
        <header className="flex flex-col gap-[3px]">
          <h1 className="text-[24px] font-bold text-ink">Theft · Records</h1>
          <p className="text-[13px] font-normal text-muted">Stored data · view only</p>
        </header>

        <div className="flex items-center gap-2.5 rounded-[12px] bg-indigo-subtle px-3.5 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
            <circle cx="12" cy="12" r="9" stroke="#2E2F81" strokeWidth="1.8" />
            <path d="M12 11v5" stroke="#2E2F81" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="#2E2F81" />
          </svg>
          <p className="text-[12.5px] font-medium text-secondary">Viewing existing records — no payment.</p>
        </div>

        {state.loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 pt-24">
            <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-primary" />
            <p className="text-[13px] font-medium text-muted">Loading your records…</p>
          </div>
        ) : state.error ? (
          <p className="rounded-[12px] bg-danger-subtle px-4 py-3 text-[13px] font-medium text-primary">
            {state.error}
          </p>
        ) : state.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 pt-24 text-center">
            <p className="text-[15px] font-semibold text-ink">No records yet</p>
            <p className="max-w-[260px] text-[13px] font-normal text-muted">
              Your IMEI verifications will show up here once you check a device.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {state.items.map((item) => (
              <RecordCard key={item.id || item.referenceId} item={item} />
            ))}
          </div>
        )}
      </div>

      <BottomNav active="records" />
    </PhoneFrame>
  )
}
