import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import OtpInput from '../components/OtpInput'
import { PrimaryButton } from '../components/Button'
import useCountdown from '../hooks/useCountdown'
import { ROUTES } from '../constants/routes'
import { sendAadhaarOtp, verifyAadhaarOtp } from '../api/user'
import { useSettings } from '../context/SettingsContext'
import { TEST_BYPASS, TEST_AADHAAR, TEST_OTP } from '../constants/testBypass'

const errMsg = (err) =>
  err?.errors?.[0]?.message || err?.message || 'Something went wrong. Please try again.'

// Figma: "Verify & pay" (§6.6). Confirms the UIDAI e-KYC OTP (real endpoint,
// 6 digits) sent to the Aadhaar-registered mobile, then completes the ₹5 record.
// The ₹5 charge is Razorpay (separate). On success, back to Home for now.
const OTP_LENGTH = 6

export default function AadhaarOtp() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { aadhaarVerificationEnabled } = useSettings()
  const aadhaar = state?.aadhaar

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { seconds, restart } = useCountdown(30)

  // Reached without an initiated request — send them back to enter details.
  if (!aadhaar) return <Navigate to={ROUTES.aadhaar} replace />

  // Switched off mid-flow (or reached by a stale back-stack entry): leave rather
  // than render an OTP screen whose endpoints we must not call.
  if (!aadhaarVerificationEnabled) return <Navigate to={ROUTES.home} replace />

  const onSubmit = async () => {
    if (code.length !== OTP_LENGTH || loading) return
    setError('')

    // Test bypass: accept the fixed OTP for the sandbox Aadhaar number only.
    if (TEST_BYPASS && aadhaar === TEST_AADHAAR && code === TEST_OTP) {
      navigate(ROUTES.home, { replace: true })
      return
    }

    setLoading(true)
    try {
      await verifyAadhaarOtp(code)
      navigate(ROUTES.home, { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    setError('')
    try {
      await sendAadhaarOtp(aadhaar)
      setCode('')
      restart()
    } catch (err) {
      setError(errMsg(err))
    }
  }

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.aadhaar} />

          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-bold text-ink">Verify &amp; pay</h1>
            <p className="text-[13px] font-normal text-muted">Confirm &amp; pay</p>
          </div>

          <p className="text-[14px] font-normal text-muted">
            Enter the OTP sent to your Aadhaar-registered mobile.
          </p>

          {/* amount row */}
          <div className="flex items-center justify-between rounded-[14px] bg-cream px-4 py-3.5">
            <span className="text-[13px] font-medium text-ink">Amount</span>
            <span className="text-[18px] font-bold text-primary">₹5</span>
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

        <PrimaryButton onClick={onSubmit} disabled={code.length !== OTP_LENGTH || loading}>
          {loading ? 'Verifying…' : 'Submit'}
        </PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
