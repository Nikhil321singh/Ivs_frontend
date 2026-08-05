import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'

// Figma: "Diagnose Your Device" (§6.4). Intro screen → pay ₹50 → scan/report.
export default function Diagnose() {
  const navigate = useNavigate()

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.home} />

          <h1 className="text-h1 font-bold text-ink">Diagnose your device</h1>
          <p className="text-[14px] font-normal leading-[1.5] text-muted">
            Run a full check of every function — screen, battery, cameras, sensors, buttons —
            and get a detailed report.
          </p>

          {/* device illustration card */}
          <div className="flex flex-col items-center gap-4 rounded-[18px] border-[1.5px] border-line bg-white px-6 py-9">
            <span className="flex h-[120px] w-[76px] items-center justify-center rounded-[16px] border-[1.5px] border-line bg-field">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="7" y="2.5" width="10" height="19" rx="2.5" stroke="#2E2F81" strokeWidth="1.6" />
                <path d="M10.5 5h3" stroke="#2E2F81" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="13" r="3.2" stroke="#EB2652" strokeWidth="1.6" />
                <path d="M12 11.2v3.6M10.2 13h3.6" stroke="#EB2652" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-[13px] font-medium text-muted">Full hardware &amp; function check</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <PrimaryButton onClick={() => navigate(ROUTES.payment50)}>Diagnose Now</PrimaryButton>
          <p className="text-center text-[12px] font-normal text-muted">
            ₹50 to Grest · Pay now to begin
          </p>
        </div>
      </div>
    </PhoneFrame>
  )
}
