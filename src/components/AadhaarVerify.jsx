import { useState } from 'react'
import Field from './Field'
import OtpInput from './OtpInput'
import useCountdown from '../hooks/useCountdown'
import { sendAadhaarOtp, verifyAadhaarOtp } from '../api/user'
import { sendCustomerAadhaarOtp, verifyCustomerAadhaarOtp } from '../api/ivs'
import { toAadhaar } from '../utils/format'

// Aadhaar + OTP verification block, extracted from Register so the same flow
// (Aadhaar No. → Send OTP → 6-digit OTP → "Aadhaar verified") can be reused on
// the IMEI screen. Self-contained: owns the send/verify sub-flow and reports the
// verified 12-digit number up via onVerified.
//
// `customer` switches the endpoints: the default account-KYC endpoints verify the
// LOGGED-IN user's Aadhaar (and block once they're verified); the customer ones
// (/ivs/aadhaar/*) verify a device seller's Aadhaar every time — stateless, using
// a refId handed back from send-otp.
const OTP_LEN = 6
const rawDigits = (s) => (s || '').replace(/\D/g, '')
const isAadhaar = (s) => /^[2-9][0-9]{11}$/.test(rawDigits(s))
const errMsg = (err) =>
  err?.errors?.[0]?.message || err?.message || 'Something went wrong. Please try again.'

export default function AadhaarVerify({ label = 'Aadhaar No.', onVerified, customer = false }) {
  const [aadhaar, setAadhaar] = useState('')
  const [otpStage, setOtpStage] = useState('idle') // idle → sent → verified
  const [otp, setOtp] = useState('')
  const [refId, setRefId] = useState('') // customer flow: provider ref from send-otp
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [aadhaarErr, setAadhaarErr] = useState('')
  const { seconds, restart } = useCountdown(30)

  const aadhaarVerified = otpStage === 'verified'

  const markVerified = () => {
    setOtpStage('verified')
    onVerified?.(rawDigits(aadhaar))
  }

  const onSendAadhaarOtp = async () => {
    if (!isAadhaar(aadhaar) || sendingOtp) return
    setAadhaarErr('')
    setSendingOtp(true)
    try {
      if (customer) {
        const { refId: id } = await sendCustomerAadhaarOtp(rawDigits(aadhaar))
        setRefId(id)
      } else {
        await sendAadhaarOtp(rawDigits(aadhaar))
      }
      setOtpStage('sent')
      setOtp('')
      restart()
    } catch (err) {
      setAadhaarErr(errMsg(err))
    } finally {
      setSendingOtp(false)
    }
  }

  const onVerifyAadhaarOtp = async () => {
    if (otp.length !== OTP_LEN || verifyingOtp) return
    setAadhaarErr('')
    setVerifyingOtp(true)
    try {
      if (customer) {
        await verifyCustomerAadhaarOtp(refId, otp)
      } else {
        await verifyAadhaarOtp(otp)
      }
      markVerified()
    } catch (err) {
      setAadhaarErr(errMsg(err))
    } finally {
      setVerifyingOtp(false)
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Field
            label={label}
            placeholder="1234 5678 9012"
            value={aadhaar}
            onChange={(e) => setAadhaar(toAadhaar(e.target.value))}
            inputMode="numeric"
            readOnly={aadhaarVerified}
          />
        </div>
        {!aadhaarVerified && (
          <button
            type="button"
            onClick={onSendAadhaarOtp}
            disabled={!isAadhaar(aadhaar) || sendingOtp || (otpStage === 'sent' && seconds > 0)}
            className="mb-[1px] shrink-0 rounded-[11px] border-[1.5px] border-primary bg-white px-3.5 py-3 text-[13px] font-semibold text-primary transition active:bg-danger-subtle disabled:opacity-40"
          >
            {sendingOtp ? 'Sending…' : otpStage === 'idle' ? 'Send OTP' : 'Resend'}
          </button>
        )}
      </div>

      {aadhaarVerified && (
        <span className="flex items-center gap-1.5 self-start rounded-[20px] bg-success-subtle py-1 pl-2.5 pr-3 text-[12px] font-semibold text-success">
          <img src="/assets/icons/ic-kyc-check.svg" alt="" aria-hidden="true" className="h-[13px] w-[13px]" />
          Aadhaar verified
        </span>
      )}

      {otpStage === 'sent' && (
        <div className="flex flex-col gap-3 rounded-[14px] border-[1.5px] border-line bg-white/70 p-3.5">
          <p className="text-[12px] font-medium text-muted">
            Enter the 6-digit OTP sent to the Aadhaar-linked mobile.
          </p>
          <OtpInput length={OTP_LEN} value={otp} onChange={setOtp} />
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-normal text-muted">
              {seconds > 0 ? `Resend available in ${seconds}s` : 'You can resend the OTP now.'}
            </span>
            <button
              type="button"
              onClick={onVerifyAadhaarOtp}
              disabled={otp.length !== OTP_LEN || verifyingOtp}
              className="rounded-[10px] bg-primary px-4 py-2 text-[13px] font-semibold text-white transition active:bg-primary-press disabled:opacity-40"
            >
              {verifyingOtp ? 'Verifying…' : 'Verify OTP'}
            </button>
          </div>
        </div>
      )}

      {aadhaarErr && (
        <p role="alert" className="text-[13px] font-medium text-primary">
          {aadhaarErr}
        </p>
      )}
    </div>
  )
}
