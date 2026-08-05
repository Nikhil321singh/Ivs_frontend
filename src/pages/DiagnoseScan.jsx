import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { OutlineButton } from '../components/Button'
import { ROUTES } from '../constants/routes'

// Figma: "Scan QR → Get the App" (§6.4). After payment, show a QR to install the
// companion Grest Diagnose app; it opens automatically and auto-fills the report.
// The QR image comes from the backend QR API (endpoint TBD — see TODO), keyed on
// the diagnose session created at payment success.
export default function DiagnoseScan() {
  const navigate = useNavigate()

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.diagnose} />

          <div className="flex items-center gap-2.5">
            <h1 className="text-h1 font-bold text-ink">Scan &amp; download</h1>
            <span className="rounded-[8px] bg-success-subtle px-2.5 py-[5px] text-[11px] font-semibold text-success">
              ₹50 paid
            </span>
          </div>

          <p className="text-[14px] font-normal leading-[1.5] text-muted">
            Scan this QR to install the Grest Diagnose app, then it opens automatically and
            fills in your report.
          </p>

          {/* QR card — image served by the backend QR API (TODO: wire endpoint) */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-[18px] border-[1.5px] border-dashed border-line bg-white">
              {/* TODO: <img src={qrUrl} /> from the backend QR endpoint once available */}
              <span className="text-[12px] font-medium text-muted">QR loads from backend</span>
            </div>
            <span className="flex items-center gap-1.5 rounded-[20px] bg-indigo-subtle px-3 py-[6px] text-[12px] font-semibold text-secondary">
              Waiting for scan…
            </span>
          </div>

          {/* store buttons */}
          <div className="flex gap-3">
            <StoreButton label="App Store" />
            <StoreButton label="Google Play" />
          </div>
        </div>

        {/* Real flow auto-advances when the companion app finishes; for the prototype
            let the tester open the (stubbed) report directly. */}
        <OutlineButton onClick={() => navigate(ROUTES.diagnoseReport)}>
          View report
        </OutlineButton>
      </div>
    </PhoneFrame>
  )
}

function StoreButton({ label }) {
  return (
    <button
      type="button"
      className="flex flex-1 items-center justify-center rounded-[12px] border-[1.5px] border-line bg-white py-3 text-[13px] font-semibold text-ink transition active:scale-[0.98] active:bg-field"
    >
      {label}
    </button>
  )
}
