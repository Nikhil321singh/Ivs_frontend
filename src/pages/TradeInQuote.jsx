import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'

// Figma: "Trade-in Quote" (§6.7). Device value auto-filled from the diagnosis.
// UI-only prototype (no trade-in backend yet).
export default function TradeInQuote() {
  const navigate = useNavigate()

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.home} />

          <span className="flex items-center gap-1.5 self-start rounded-[8px] bg-indigo-subtle px-2.5 py-[5px] text-[11px] font-semibold text-secondary">
            Report auto-filled · iPhone 14 Pro
          </span>

          <h1 className="text-h1 font-bold text-ink">Trade-in Quote</h1>

          {/* value card */}
          <div className="flex flex-col gap-1.5 rounded-[18px] bg-secondary px-5 py-6 text-white">
            <span className="text-[12px] font-medium text-white/70">Your device value</span>
            <span className="text-[34px] font-bold leading-none">₹62,999</span>
          </div>

          {/* breakdown */}
          <div className="flex flex-col gap-3 rounded-[18px] border-[1.5px] border-line bg-white px-[18px] py-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-normal text-muted">Base offer</span>
              <span className="text-[14px] font-semibold text-ink">₹59,999</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-normal text-muted">Bonus applied</span>
              <span className="text-[14px] font-semibold text-success">+₹3,000</span>
            </div>
            <div className="rounded-[10px] bg-success-subtle px-3 py-2 text-[12px] font-semibold text-success">
              ₹3,000 Grest bonus unlocked
            </div>
          </div>
        </div>

        <PrimaryButton onClick={() => navigate(ROUTES.tradeInDetails)}>Continue</PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
