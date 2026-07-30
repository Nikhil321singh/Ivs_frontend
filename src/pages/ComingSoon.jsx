import { useLocation } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BottomNav from '../components/BottomNav'

// Placeholder for features that aren't shipping in this release (Diagnose, Payment,
// Check Device Price). Reached from the Home grid / Services list / Menu. The
// per-feature label is passed via navigation state; falls back to a generic line.
// Figma: "Coming Soon" card 7893:2384 — 267x213 centered card, gray icon chip,
// feature label, big COMING SOON, expected-date line. Full-bleed (real OS status bar).
export default function ComingSoon() {
  const { state } = useLocation()
  const feature = state?.feature || 'This feature'

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 font-spline">
        {/* card — fixed 267x213 to match Figma, centered */}
        <div className="flex w-[267px] flex-col items-center rounded-[24px] bg-white px-5 pb-[26px] pt-[26px] shadow-[0_12px_34px_rgba(23,23,28,0.08)]">
          {/* icon chip 56x56 */}
          <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-field">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 4L3 8m0 0l4 4M3 8h14M17 20l4-4m0 0l-4-4m4 4H7"
                stroke="#EB2652"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          {/* text block — tight ~5px gaps */}
          <div className="mt-[22px] flex flex-col items-center gap-[5px]">
            <span className="text-[12px] font-semibold uppercase leading-none tracking-[0.02em] text-primary">
              {feature}
            </span>
            <h1 className="text-[30px] font-bold uppercase leading-none text-primary">Coming Soon</h1>
            <span className="text-[13px] font-medium uppercase leading-none tracking-[0.02em] text-muted">
              Expected date
            </span>
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </PhoneFrame>
  )
}
