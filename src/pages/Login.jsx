import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'
import { sendOtp } from '../api/auth'

// Figma: Login (OTP) 7649:1979 — warm gradient, back chevron, large translucent "G"
// watermark, bottom white sheet with title/sub, mobile input (+91), pill Send Code,
// Terms footer. Send Code fires a real OTP via /auth/send-otp (MSG91 SMS).
export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const valid = phone.length === 10

  const onSend = async () => {
    if (!valid || loading) return
    setError('')
    setLoading(true)
    try {
      await sendOtp(phone)
      navigate(ROUTES.otp, { state: { mobile: phone } })
    } catch (err) {
      setError(err.message || 'Could not send the code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PhoneFrame
      bg=""
      style={{
        backgroundImage:
          'linear-gradient(to bottom, #fdf6f1 5.569%, #fdf1f4 30.552%, #fbe5eb 44.334%, #fbe5eb 100%)',
      }}
    >
      <div className="flex flex-1 flex-col">
        {/* back */}
        <div className="px-5 pt-3">
          <BackButton to={ROUTES.splash} />
        </div>

        {/* translucent G watermark fills the space above the sheet */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          <img
            src="/assets/login-g.svg"
            alt=""
            aria-hidden="true"
            className="w-[184px] max-w-none rotate-[0.67deg] opacity-90"
          />
        </div>

        {/* bottom sheet */}
        <div className="flex flex-col gap-4 rounded-t-[30px] bg-white px-5 pb-8 pt-10 shadow-sheet">
          <div>
            <h1 className="text-[20px] font-bold leading-[26px] text-ink">
              Log in or sign up
            </h1>
            <p className="mt-2 text-[12px] leading-[1.35] text-muted">
              Enter your mobile number. We'll send a one-time code no passwords, no spam.
            </p>
          </div>

          {/* mobile number field */}
          <div>
            <label htmlFor="phone" className="mb-1 block text-[16px] font-medium text-[#6d6d6d]">
              Mobile Number
            </label>
            <div className="flex items-center gap-2 rounded-[8px] border border-[#ebebeb] bg-[#fdf6f1] px-4 py-4">
              <img src="/assets/in-flag.png" alt="India" className="h-5 w-[30px] rounded-[2px] object-cover" />
              <span className="text-[20px] font-bold text-black">+91</span>
              <span className="h-[25px] w-px bg-[#ebebeb]" />
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="98XXXXXXXXX"
                className="min-w-0 flex-1 bg-transparent text-[20px] font-semibold text-black outline-none placeholder:text-[#6d6d6d]"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[12px] font-medium text-primary">
              {error}
            </p>
          )}

          <PrimaryButton pill onClick={onSend} disabled={!valid || loading}>
            {loading ? 'Sending…' : 'Send Code'}
          </PrimaryButton>

          <p className="text-[12px] text-[#6d6d6d]">
            By counting you agree to Grest,s <span className="text-primary">Terms &amp; Privacy</span>
          </p>
        </div>
      </div>
    </PhoneFrame>
  )
}
