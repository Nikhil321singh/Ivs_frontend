import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'
import { verifyImei } from '../api/ivs'

// Figma: "IMEI Result" (§6.3). Calls the real POST /ivs/verify on mount with the
// IMEI carried from the Enter screen, then renders Clean / Blocked / Couldn't-
// verify from the CEIR status. Group the 15 digits 2-6-6-1 for display.
const GROUP = (s) =>
  s.replace(/\D/g, '').replace(/(.{2})(.{6})(.{6})(.{1}).*/, '$1 $2 $3 $4').trim()

// Map CEIR status → display variant.
const VARIANTS = {
  CLEAN: { tone: 'success', title: 'Clean', sub: 'Not blacklisted · safe to trade' },
  BLOCKED: { tone: 'danger', title: 'Blocked', sub: 'Reported blocked · do not trade' },
  STOLEN: { tone: 'danger', title: 'Stolen', sub: 'Reported stolen · do not trade' },
  UNKNOWN: { tone: 'muted', title: "Couldn't verify", sub: 'CEIR did not return a result — retry is free' },
}

export default function ImeiResult() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const imei = state?.imei || ''
  const imei2 = state?.imei2
  const deviceModel = state?.deviceModel

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!imei) {
      setError('No IMEI to verify.')
      setLoading(false)
      return
    }
    let alive = true
    verifyImei({ imei1: imei, imei2, deviceModel })
      .then((res) => alive && setData(res))
      .catch((err) => alive && setError(err.message || 'Verification failed.'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [imei, imei2, deviceModel])

  const status = data?.imei1Status || 'UNKNOWN'
  const variant = VARIANTS[status] || VARIANTS.UNKNOWN
  const danger = variant.tone === 'danger'

  const rows = [
    { label: 'IMEI', value: GROUP(imei) },
    { label: 'Reference', value: data?.referenceId || '—' },
    { label: 'Checked', value: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
  ]

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-6">
          <BackButton to={ROUTES.imeiEnter} />

          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 pt-24 text-center">
              <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-primary" />
              <p className="text-[14px] font-medium text-muted">Checking CEIR blocklist…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 pt-16 text-center">
              <h1 className="text-h2 font-bold text-ink">Verification failed</h1>
              <p className="text-[13px] font-normal text-muted">{error}</p>
            </div>
          ) : (
            <>
              {/* status hero */}
              <div className="flex flex-col items-center gap-3 pt-2 text-center">
                <span
                  className={`flex h-[84px] w-[84px] items-center justify-center rounded-full ${
                    danger ? 'bg-danger-subtle' : status === 'CLEAN' ? 'bg-success-subtle' : 'bg-field'
                  }`}
                >
                  {danger ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="#EB2652" strokeWidth="2" />
                      <path d="M8 8l8 8M16 8l-8 8" stroke="#EB2652" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : status === 'CLEAN' ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="#129E5E" strokeWidth="2" />
                      <path d="M8 12l3 3 5-6" stroke="#129E5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="2" />
                      <path d="M12 8v5M12 16h.01" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <h1
                  className={`text-[30px] font-bold ${
                    danger ? 'text-primary' : status === 'CLEAN' ? 'text-success' : 'text-ink'
                  }`}
                >
                  {variant.title}
                </h1>
                <p className="text-[13px] font-normal text-muted">{variant.sub}</p>
              </div>

              {/* details card */}
              <div className="flex flex-col gap-3 rounded-[18px] border-[1.5px] border-line bg-white px-[18px] py-4">
                {rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-4">
                    <span className="shrink-0 text-[13px] font-normal text-muted">{r.label}</span>
                    <span className="truncate text-right text-[14px] font-semibold text-ink">{r.value}</span>
                  </div>
                ))}
                <div className="h-px w-full bg-line" />
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-normal text-muted">Status</span>
                  <span
                    className={`rounded-[8px] px-2.5 py-[5px] text-[11px] font-semibold ${
                      danger
                        ? 'bg-danger-subtle text-primary'
                        : status === 'CLEAN'
                        ? 'bg-success-subtle text-success'
                        : 'bg-field text-muted'
                    }`}
                  >
                    {variant.title}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {!loading && (
          <PrimaryButton onClick={() => navigate(ROUTES.home)}>Back to Home</PrimaryButton>
        )}
      </div>
    </PhoneFrame>
  )
}
