import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { ROUTES } from '../constants/routes'

// Static Privacy Policy screen (reached from Profile → Privacy Policy).
const SECTIONS = [
  {
    h: 'What we collect',
    p: 'Your mobile number, name, email, and — for KYC — Aadhaar and PAN/GST. Device IMEIs you verify and diagnosis results are stored against your account.',
  },
  {
    h: 'How we use it',
    p: 'To verify devices against CEIR, run diagnostics, process payments, and maintain your records. We do not sell your personal data.',
  },
  {
    h: 'Identity checks',
    p: 'Aadhaar e-KYC is performed via UIDAI-authorised providers. We store a hashed reference, not your raw Aadhaar number.',
  },
  {
    h: 'Your choices',
    p: 'You can request account deletion by contacting support@grest.in. Some records may be retained where required by law.',
  },
]

export default function Privacy() {
  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-8 pt-2 font-spline">
        <BackButton to={ROUTES.profile} />
        <h1 className="text-h1 font-bold text-ink">Privacy Policy</h1>
        <p className="text-[12px] font-normal text-muted">Last updated · July 2026</p>

        <div className="flex flex-col gap-5">
          {SECTIONS.map((s) => (
            <div key={s.h} className="flex flex-col gap-1.5">
              <h2 className="text-[15px] font-semibold text-ink">{s.h}</h2>
              <p className="text-[13px] font-normal leading-[1.6] text-muted">{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  )
}
