import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import OtpInput from '../components/OtpInput'
import { PrimaryButton } from '../components/Button'
import useCountdown from '../hooks/useCountdown'
import { ROUTES } from '../constants/routes'
import { sendOtp, verifyOtp } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { toPhone } from '../utils/format'

// Figma: OTP Verification 7650:1979. Verifies the OTP via /auth/verify-otp, stores
// the session, then routes new/unverified users to KYC and everyone else Home.
// OTP length matches the backend (MSG91 default: 6 digits).
const OTP_LENGTH = 6

export default function Otp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const mobile = location.state?.mobile
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { seconds, restart } = useCountdown(24)

  // Reached directly without a number to verify — send them back to enter one.
  if (!mobile) return <Navigate to={ROUTES.login} replace />

  const onVerify = async () => {
    if (code.length !== OTP_LENGTH || loading) return
    setError('')
    setLoading(true)
    try {
      const result = await verifyOtp({ mobile, otp: code })
      login(result)
      // New signups (and anyone who hasn't finished KYC) go to Register/KYC.
      navigate(result.user?.kycCompleted ? ROUTES.home : ROUTES.register, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    setError('')
    try {
      await sendOtp(mobile)
      setCode('')
      restart()
    } catch (err) {
      setError(err.message || 'Could not resend the code.')
    }
  }

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-7 pb-10 pt-2">
        <div className="flex flex-col gap-6.5">
          <BackButton to={ROUTES.login} />

          <div className="flex flex-col gap-2.5">
            <h1 className="text-h1 font-bold text-ink">Verify your number</h1>
            <p className="text-body font-normal text-muted">Code sent to +91 {toPhone(mobile)}</p>
          </div>

          <OtpInput length={OTP_LENGTH} value={code} onChange={setCode} />

          {error && (
            <p role="alert" className="text-[13px] font-medium text-primary">
              {error}
            </p>
          )}

          <div className="flex gap-1.5 text-[13px]">
            <span className="font-normal text-muted">Didn't get it?</span>
            {seconds > 0 ? (
              <span className="font-semibold text-primary">Resend in {seconds}s</span>
            ) : (
              <button type="button" onClick={onResend} className="font-semibold text-primary">
                Resend
              </button>
            )}
          </div>
        </div>

        <PrimaryButton onClick={onVerify} disabled={code.length !== OTP_LENGTH || loading}>
          {loading ? 'Verifying…' : 'Verify'}
        </PrimaryButton>

      </div>
    </PhoneFrame>
  )
}
