import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'

// Figma: "Sign & Sell Now" (§6.7). Final confirmation + signature. UI-only.
export default function SignSell() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(true)

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.tradeInVerify} />

          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-bold text-ink">Sign &amp; sell</h1>
            <p className="text-[13px] font-normal text-muted">Confirm sale</p>
          </div>

          {/* receive amount */}
          <div className="flex items-center justify-between rounded-[16px] bg-pink-subtle px-4 py-4">
            <span className="text-[13px] font-medium text-ink">You receive</span>
            <span className="text-[24px] font-bold text-primary">₹62,999</span>
          </div>

          {/* signature box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-muted">Signature</label>
            <div className="flex h-24 items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-line bg-white">
              <span className="font-sans text-[24px] italic text-ink/70">G. Sharma</span>
            </div>
          </div>

          {/* confirm checkbox */}
          <button
            type="button"
            onClick={() => setAgreed((v) => !v)}
            className="flex items-start gap-3 text-left"
          >
            <span
              className={`mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] ${
                agreed ? 'border-primary bg-primary' : 'border-line bg-white'
              }`}
            >
              {agreed && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12l4 4 10-10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-[13px] font-normal text-muted">
              I confirm the device details are correct and agree to Grest's trade-in terms.
            </span>
          </button>
        </div>

        <PrimaryButton onClick={() => navigate(ROUTES.home, { replace: true })} disabled={!agreed}>
          Sell Now
        </PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
