import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import Field from '../components/Field'
import { PrimaryButton } from '../components/Button'
import { ROUTES } from '../constants/routes'
import { sendAadhaarOtp } from '../api/user'
import { toAadhaar } from '../utils/format'

// Figma: "Initiate payment" (§6.6). Links a ₹5 payment to a device + identity
// record: IMEI + Aadhaar. Submitting sends the real UIDAI e-KYC OTP (reusing the
// KYC endpoint) and advances to the OTP screen. The ₹5 charge itself is handled
// by Razorpay (separate — placeholder for now).
const IMEI_LENGTH = 15

export default function Aadhaar() {
  const navigate = useNavigate()
  const [imei, setImei] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const aadhaarDigits = aadhaar.replace(/\D/g, '')
  const valid = imei.length === IMEI_LENGTH && aadhaarDigits.length === 12

  const onSubmit = async () => {
    if (!valid || loading) return
    setError('')
    setLoading(true)
    try {
      await sendAadhaarOtp(aadhaarDigits) // raw 12 digits
      navigate(ROUTES.aadhaarOtp, { state: { imei, aadhaar: aadhaarDigits } })
    } catch (err) {
      setError(err.message || 'Could not send the OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-2 font-spline">
        <div className="flex flex-col gap-5">
          <BackButton to={ROUTES.home} />

          <div className="flex flex-col gap-1">
            <h1 className="text-h1 font-bold text-ink">Initiate payment</h1>
            <p className="text-[13px] font-normal text-muted">Device + identity</p>
          </div>

          <p className="text-[14px] font-normal leading-[1.5] text-muted">
            Link this payment to a device &amp; identity record.
          </p>

          <div className="flex flex-col gap-3">
            <Field
              label="Enter IMEI No."
              value={imei}
              onChange={(e) => setImei(e.target.value.replace(/\D/g, '').slice(0, IMEI_LENGTH))}
              placeholder="351234567890123"
              inputMode="numeric"
            />
            <Field
              label="Enter Aadhaar No."
              value={aadhaar}
              onChange={(e) => setAadhaar(toAadhaar(e.target.value))}
              placeholder="1234 5678 9012"
              inputMode="numeric"
            />
          </div>

          {/* amount row */}
          <div className="flex items-center justify-between rounded-[14px] bg-cream px-4 py-3.5">
            <span className="text-[13px] font-medium text-ink">Amount to pay</span>
            <span className="text-[18px] font-bold text-primary">₹5</span>
          </div>

          {error && (
            <p role="alert" className="text-[13px] font-medium text-primary">
              {error}
            </p>
          )}
        </div>

        <PrimaryButton onClick={onSubmit} disabled={!valid || loading}>
          {loading ? 'Sending OTP…' : 'Submit & Pay ₹5'}
        </PrimaryButton>
      </div>
    </PhoneFrame>
  )
}
