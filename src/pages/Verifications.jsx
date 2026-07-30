import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'

// Figma: "Verifications" (§6.7). Pre-sale checks — IVS (optional), Aadhaar, and
// device photos. UI-only prototype; statuses are illustrative.
const ROWS = [
  { key: 'ivs', title: 'IVS (IMEI) verification', sub: 'Optional · not mandatory to sell', status: 'Clean', tone: 'success' },
  { key: 'aadhaar', title: 'Aadhaar verification', sub: 'OTP verified', status: 'Verified', tone: 'success' },
  { key: 'photos', title: 'Upload device images', sub: 'Front, back, sides · 4 photos', status: 'Upload', tone: 'action' },
]

export default function Verifications() {
  const navigate = useNavigate()

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.tradeInDetails} />

          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-bold text-ink">Verifications</h1>
            <p className="text-[13px] font-normal text-muted">Verify to sell · IVS optional · Aadhaar · photos</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {ROWS.map((r) => (
              <div
                key={r.key}
                className="flex items-center gap-3.5 rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-[13px]"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="truncate text-[14px] font-semibold text-ink">{r.title}</span>
                  <span className="truncate text-[12px] font-normal text-muted">{r.sub}</span>
                </span>
                <span
                  className={`shrink-0 rounded-[8px] px-2.5 py-[5px] text-[11px] font-semibold ${
                    r.tone === 'success' ? 'bg-success-subtle text-success' : 'bg-indigo-subtle text-secondary'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <PrimaryButton onClick={() => navigate(ROUTES.tradeInSign)}>Continue</PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
