import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'

// Figma: Splash (7648:1985) — hero (logo 138 + title Bold 26 + body Regular 15 muted),
// primary Get Started + caption at the bottom.
// Layout is height-adaptive (NOT a fixed top padding) so the bottom group never hides
// under the home indicator on shorter devices.
export default function Splash() {
  const navigate = useNavigate()

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col px-7 pb-8">
        {/* hero fills available space, vertically centered */}
        <div className="flex flex-1 flex-col items-center justify-center gap-5.5">
          <img src="/assets/grest-logo.svg" alt="Grest" className="h-[138px] w-[138px]" />
          <h1 className="w-full text-center text-title font-bold text-ink">
            Verify &amp; Service Suite
          </h1>
          <p className="max-w-[308px] text-center text-body font-normal text-muted">
            Verify, diagnose and pay for any device one honest, secure workflow.
          </p>
        </div>

        {/* pinned to bottom, above the safe-area inset handled by PhoneFrame */}
        <div className="flex w-full shrink-0 flex-col items-center gap-3.5">
          <PrimaryButton onClick={() => navigate(ROUTES.login)}>Get Started</PrimaryButton>
          <p className="text-caption font-normal text-muted">
            Secure workflow · Trusted by Grest
          </p>
        </div>
      </div>
    </PhoneFrame>
  )
}
