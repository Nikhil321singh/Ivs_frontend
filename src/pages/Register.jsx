import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InAppCamera from '../components/InAppCamera'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import Field from '../components/Field'
import SegmentedToggle from '../components/SegmentedToggle'
import OtpInput from '../components/OtpInput'
import { PrimaryButton } from '../components/Button'
import useCountdown from '../hooks/useCountdown'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { sendAadhaarOtp, verifyAadhaarOtp, completeKyc, skipKyc } from '../api/user'
import { toPan, toGst, toAadhaar, toPhone, toEmail } from '../utils/format'
import { TEST_BYPASS, TEST_AADHAAR, TEST_OTP } from '../constants/testBypass'

const OTP_LEN = 6

// Raw-value validators mirroring the backend regexes (src/validators/user.validator.js).
const rawDigits = (s) => (s || '').replace(/\D/g, '')
const isPhone = (s) => /^[6-9]\d{9}$/.test(rawDigits(s))
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim())
const isPan = (s) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test((s || '').trim())
const isGst = (s) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test((s || '').trim())
const isAadhaar = (s) => /^[2-9][0-9]{11}$/.test(rawDigits(s))

// The API envelope carries per-field validator errors; surface the first one.
const errMsg = (err) =>
  err?.errors?.[0]?.message || err?.message || 'Something went wrong. Please try again.'

// Figma: Register — Individual/Vendor 7673:1979 / 7674:1979.
// Completes KYC against Ivs_backend. All fields are mandatory. Individuals must
// verify their Aadhaar via OTP (send-otp → verify-otp) before "Create account"
// unlocks; vendors submit GST + an owner photo instead of Aadhaar.
export default function Register() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()

  // Operator switches. Re-read on entry (not just at launch) so a toggle made
  // while the app sat on Home is picked up before the form is filled in.
  const { aadhaarVerificationEnabled, kycRequired, refresh: refreshSettings } = useSettings()
  useEffect(() => {
    refreshSettings()
  }, [refreshSettings])

  const [type, setType] = useState('individual')
  const isVendor = type === 'vendor'

  // The contact number is fixed to the OTP-verified login mobile — auto-filled
  // and read-only (never re-typed). Backend stores it as 10 bare digits.
  const loginMobile = rawDigits(user?.mobile || '')

  // name doubles as company name for vendors.
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pan, setPan] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [gst, setGst] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const fileRef = useRef(null)

  // Aadhaar OTP sub-flow: idle → sent → verified.
  const [otpStage, setOtpStage] = useState('idle')
  const [otp, setOtp] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [aadhaarErr, setAadhaarErr] = useState('')
  const { seconds, restart } = useCountdown(30)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const aadhaarVerified = otpStage === 'verified'

  const clearPhoto = () => {
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(null)
    setPhotoFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Switching account type resets the form — the two paths share no identity fields.
  const onType = (t) => {
    if (t === type) return
    setType(t)
    setName('')
    setEmail('')
    setPan('')
    setAadhaar('')
    setGst('')
    clearPhoto()
    setOtpStage('idle')
    setOtp('')
    setAadhaarErr('')
    setError('')
  }

  // Web fallback (desktop browser dev): plain <input type="file">.
  const onPickPhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (photo) URL.revokeObjectURL(photo)
    setPhotoFile(file)
    setPhoto(URL.createObjectURL(file))
  }

  // Live photo capture. We use an in-app camera (InAppCamera / getUserMedia) rather
  // than the native OS camera activity: on this low-memory Redmi MIUI kills — and
  // refuses to restart — the app whenever it's backgrounded for the native camera
  // ("the camera crashes the app"). Staying in-app keeps the process foregrounded.
  // Falls back to a file input only where getUserMedia is unavailable.
  const onChangePhoto = () => {
    setError('')
    if (navigator.mediaDevices?.getUserMedia) {
      setShowCamera(true)
    } else {
      fileRef.current?.click()
    }
  }

  const onCapture = (file, previewUrl) => {
    if (photo) URL.revokeObjectURL(photo)
    setPhotoFile(file)
    setPhoto(previewUrl)
    setShowCamera(false)
  }

  const onSendAadhaarOtp = async () => {
    // Belt and braces: the block is unmounted while the switch is off, but never
    // let a stray call reach /user/aadhaar/* regardless of render state.
    if (!aadhaarVerificationEnabled) return
    if (!isAadhaar(aadhaar) || sendingOtp) return
    setAadhaarErr('')

    // Test bypass: skip the real UIDAI send for the sandbox Aadhaar number.
    if (TEST_BYPASS && rawDigits(aadhaar) === TEST_AADHAAR) {
      setOtpStage('sent')
      setOtp('')
      restart()
      return
    }

    setSendingOtp(true)
    try {
      await sendAadhaarOtp(rawDigits(aadhaar))
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
    if (!aadhaarVerificationEnabled) return
    if (otp.length !== OTP_LEN || verifyingOtp) return
    setAadhaarErr('')

    // Test bypass: accept the fixed OTP for the sandbox Aadhaar number only.
    // setUser is skipped here deliberately — "Create account" still calls
    // completeKyc, which returns the authoritative user record.
    if (TEST_BYPASS && rawDigits(aadhaar) === TEST_AADHAAR && otp === TEST_OTP) {
      setOtpStage('verified')
      return
    }

    setVerifyingOtp(true)
    try {
      const { user } = await verifyAadhaarOtp(otp)
      setUser(user)
      setOtpStage('verified')
    } catch (err) {
      setAadhaarErr(errMsg(err))
    } finally {
      setVerifyingOtp(false)
    }
  }

  // With kycRequired off every field is optional, but anything actually typed is
  // still format-checked — the backend 422s on a malformed value either way, so
  // catching it here keeps the error inline instead of after a round trip.
  const opt = (value, test) => (kycRequired ? test(value) : !value?.trim() || test(value))

  const commonValid =
    (kycRequired ? name.trim().length >= 2 : !name.trim() || name.trim().length >= 2) &&
    (kycRequired ? isPhone(loginMobile) : !loginMobile || isPhone(loginMobile)) &&
    opt(email, isEmail) &&
    opt(pan, isPan)

  // Aadhaar only gates submission while it is both switched on and required.
  const aadhaarGates = aadhaarVerificationEnabled && kycRequired
  const canSubmit = isVendor
    ? commonValid && opt(gst, isGst) && (!kycRequired || !!photoFile)
    : commonValid && (!aadhaarGates || (isAadhaar(aadhaar) && aadhaarVerified))

  // Only offered while kycRequired is off — /user/skip-kyc 403s otherwise.
  const onSkip = async () => {
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      await skipKyc()
      navigate(ROUTES.home, { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmit = async () => {
    if (!canSubmit || submitting) return
    setError('')
    setSubmitting(true)

    // Only send fields that carry a value. With kycRequired off the backend
    // accepts an empty body, and sending "" would fail its format check.
    const fd = new FormData()
    const put = (key, value) => {
      if (value != null && String(value).trim() !== '') fd.append(key, String(value).trim())
    }

    put('userType', type)
    put('phone', loginMobile)
    put('email', email)
    put('panNumber', pan)
    if (isVendor) {
      put('companyName', name)
      put('gstNumber', gst)
      if (photoFile) fd.append('profileImage', photoFile)
    } else {
      put('name', name)
      // Omitted entirely while Aadhaar verification is switched off — the
      // backend completes KYC without it.
      if (aadhaarVerificationEnabled) put('aadhaarNumber', rawDigits(aadhaar))
    }

    try {
      const { user } = await completeKyc(fd)
      setUser(user)
      navigate(ROUTES.home, { replace: true })
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PhoneFrame bg="bg-screen-grad">
      {showCamera && (
        <InAppCamera onCapture={onCapture} onCancel={() => setShowCamera(false)} />
      )}
      <div className="flex flex-1 flex-col justify-between px-6.5 pb-6 pt-1.5">
        <div className="flex flex-col gap-4">
          <BackButton to={ROUTES.otp} />

          <div className="flex flex-col gap-2">
            <h1 className="whitespace-nowrap text-h2 font-bold text-ink">Create your account</h1>
            <p className="text-[13px] font-normal text-muted">Choose account type to continue.</p>
          </div>

          <SegmentedToggle
            value={type}
            onChange={onType}
            options={[
              { value: 'individual', label: 'Individual' },
              { value: 'vendor', label: 'Vendor' },
            ]}
          />

          {/* avatar + photo chip */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[32px] bg-secondary text-[22px] font-bold text-white">
              {photo ? (
                <img src={photo} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                isVendor ? 'GT' : 'GS'
              )}
            </div>
            <div className="flex flex-col gap-[7px]">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickPhoto}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onChangePhoto}
                  className="flex items-center gap-[15px] self-start rounded-[8px] border-[1.5px] border-line bg-white px-2.5 py-[7px] active:bg-field"
                >
                  <span className="text-[12px] font-medium text-ink">Camera</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
                      stroke="#eb2652"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="13" r="3" stroke="#eb2652" strokeWidth="2" />
                  </svg>
                </button>
                {photo && (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="rounded-[8px] border-[1.5px] border-line bg-white px-2.5 py-[7px] text-[12px] font-medium text-muted active:bg-field"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[12px] font-normal text-muted">
                {isVendor ? 'Add a clear business photo (required)' : 'Add a clear profile photo (optional)'}
              </p>
            </div>
          </div>

          {/* fields — all mandatory */}
          <div className="flex flex-col gap-2.5">
            <Field
              label={isVendor ? 'Business name' : 'Name'}
              placeholder={isVendor ? 'Grest Traders' : 'Gaurav Sharma'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Field
              label="Phone (verified)"
              placeholder="98765 43210"
              value={loginMobile ? `+91 ${toPhone(loginMobile)}` : ''}
              readOnly
            />
            <Field
              label="Email"
              placeholder={isVendor ? 'vendor@grest.in' : 'gaurav@email.com'}
              value={email}
              onChange={(e) => setEmail(toEmail(e.target.value))}
              type="email"
            />
            <Field
              label="PAN No."
              placeholder="ABCDE1234F"
              value={pan}
              onChange={(e) => setPan(toPan(e.target.value))}
            />

            {isVendor ? (
              <Field
                label="GST No."
                placeholder="27ABCDE1234F1Z5"
                value={gst}
                onChange={(e) => setGst(toGst(e.target.value))}
              />
            ) : !aadhaarVerificationEnabled ? null : (
              /* Aadhaar + OTP verification — Create account stays locked until verified */
              <div className="flex flex-col gap-2.5">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field
                      label="Aadhaar No."
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
                      Enter the 6-digit OTP sent to your Aadhaar-linked mobile.
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
            )}
          </div>

          {error && (
            <p role="alert" className="text-[13px] font-medium text-primary">
              {error}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <PrimaryButton onClick={onSubmit} disabled={!canSubmit || submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </PrimaryButton>

          {/* Gated on the setting: /user/skip-kyc 403s while KYC is required. */}
          {!kycRequired && (
            <button
              type="button"
              onClick={onSkip}
              disabled={submitting}
              className="py-2 text-[13px] font-semibold text-muted transition active:text-ink disabled:opacity-40"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </PhoneFrame>
  )
}
