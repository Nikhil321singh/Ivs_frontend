import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { ROUTES } from '../constants/routes'

// Static Help & support screen (reached from Profile → Help & support).
const FAQS = [
  { q: 'How does IMEI verification work?', a: 'We check the 15-digit IMEI against C-DOT’s CEIR blocklist and show Clean, Blocked or Stolen. It costs 20 tokens (₹20).' },
  { q: 'What are tokens?', a: '1 token = ₹1. Top up from Credits, then paid checks (IMEI ₹20, Diagnose ₹50) draw from your balance.' },
  { q: 'A check failed — was I charged?', a: 'No. You’re only charged for a definitive result. Errors and “couldn’t verify” are free to retry.' },
  { q: 'A payment was deducted but not credited', a: 'It confirms automatically within a few minutes. If it doesn’t, contact us with your payment ID.' },
]

export default function Help() {
  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-8 pt-2 font-spline">
        <BackButton to={ROUTES.profile} />
        <h1 className="text-h1 font-bold text-ink">Help &amp; support</h1>

        {/* contact card */}
        <a
          href="mailto:support@grest.in"
          className="flex items-center gap-3.5 rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-[13px] transition active:scale-[0.98] active:bg-field"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-indigo-subtle">
            <img src="/assets/icons/ic-help.svg" alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="text-[14px] font-semibold text-ink">Email support</span>
            <span className="text-[12px] font-normal text-muted">support@grest.in</span>
          </span>
        </a>

        <div className="flex flex-col gap-4">
          <h2 className="text-[15px] font-semibold text-ink">FAQs</h2>
          {FAQS.map((f) => (
            <div key={f.q} className="flex flex-col gap-1.5">
              <h3 className="text-[14px] font-semibold text-ink">{f.q}</h3>
              <p className="text-[13px] font-normal leading-[1.6] text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  )
}
