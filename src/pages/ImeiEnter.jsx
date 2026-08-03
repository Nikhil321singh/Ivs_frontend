import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BackButton from '../components/BackButton'
import AadhaarVerify from '../components/AadhaarVerify'
import { ROUTES } from '../constants/routes'
import { scanImei } from '../lib/scanner'

// Figma "IMEI Verification" (node 7683:2006). A short intake form — customer
// name, Aadhaar (verified via OTP, same flow as account creation), device detail
// and up to two IMEIs — each IMEI scannable with the in-field camera. CTA enables
// once IMEI No. 1 is a full 15 digits and the customer's Aadhaar is verified.
const IMEI_LENGTH = 15

// 15-digit field label (Figma: Spline Sans Medium 12 / #6b7280).
function FieldLabel({ children }) {
  return <label className="font-spline text-[12px] font-medium text-muted">{children}</label>
}

// White input box (Figma: bg-white, 1.5px #ece7ec border, radius 11, px14/py12).
const BOX =
  'flex w-full items-center rounded-[11px] border-[1.5px] border-line bg-white px-[14px] py-[12px]'

export default function ImeiEnter() {
  const navigate = useNavigate()

  const [customerName, setCustomerName] = useState('')
  const [aadhaar, setAadhaar] = useState('') // set once the customer's Aadhaar is OTP-verified
  const [deviceDetail, setDeviceDetail] = useState('')
  const [imei1, setImei1] = useState('')
  const [imei2, setImei2] = useState('')
  const [scanError, setScanError] = useState('')

  const onImei = (set) => (e) =>
    set(e.target.value.replace(/\D/g, '').slice(0, IMEI_LENGTH))

  const complete = imei1.length === IMEI_LENGTH && !!aadhaar

  const onScan = async (set) => {
    setScanError('')
    try {
      const imei = await scanImei()
      set(imei)
    } catch (err) {
      if (err.message === 'CANCELLED') return // user backed out — no error
      const map = {
        WEB_UNSUPPORTED: 'Scanning works on the phone app — type the IMEI here.',
        CAMERA_DENIED: 'Camera access is off. Enable it in Settings to scan.',
        NO_IMEI: "Couldn't read a barcode in that photo — retake it or type the IMEI.",
      }
      setScanError(map[err.message] || 'Could not scan. Type the IMEI instead.')
    }
  }

  const submit = () =>
    navigate(ROUTES.payment20, {
      state: {
        imei: imei1,
        imei2: imei2 || undefined,
        deviceModel: deviceDetail || undefined,
        customerName: customerName || undefined,
        aadhaar: aadhaar || undefined,
      },
    })

  return (
    <PhoneFrame bg="bg-screen-grad">
      <div className="flex flex-1 flex-col justify-between px-[26px] pb-[24px] pt-[9px] font-spline">
        {/* top */}
        <div className="flex flex-col gap-[27px]">
          <BackButton to={ROUTES.home} />

          {/* title + subtitle */}
          <div className="flex flex-col gap-[10px]">
            <div className="flex items-center gap-[10px]">
              <h1 className="text-[24px] font-bold text-ink">IMEI Verification</h1>
              <span className="rounded-[20px] bg-pink-subtle px-[10px] py-[5px] font-sans text-[11px] font-semibold text-primary">
                IVS · ₹20
              </span>
            </div>
            <p className="text-[15px] font-normal leading-[1.5] text-muted">
              Type the 15-digit IMEI, or scan it with the camera.
            </p>
          </div>

          {/* fields */}
          <div className="flex flex-col gap-[11px]">
            {/* Customer name */}
            <div className="flex flex-col gap-[6px]">
              <FieldLabel>Customer name</FieldLabel>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Grest Traders"
                className={`${BOX} text-[14px] font-medium text-ink outline-none placeholder:text-muted focus:border-primary`}
              />
            </div>

            {/* Aadhaar — OTP verification, same flow as account creation. Pay
                stays locked until the customer's Aadhaar is verified. */}
            <AadhaarVerify onVerified={setAadhaar} />

            {/* Device detail */}
            <div className="flex flex-col gap-[6px]">
              <FieldLabel>Device Detail.</FieldLabel>
              <input
                value={deviceDetail}
                onChange={(e) => setDeviceDetail(e.target.value)}
                placeholder="27ABCDE1234F1Z5"
                className={`${BOX} text-[14px] font-medium text-ink outline-none placeholder:text-muted focus:border-primary`}
              />
            </div>

            {/* IMEI No. 1 */}
            <ImeiField
              label="IMEI No. 1"
              value={imei1}
              onChange={onImei(setImei1)}
              onScan={() => onScan(setImei1)}
            />

            {/* IMEI No. 2 */}
            <ImeiField
              label="IMEI No. 2"
              value={imei2}
              onChange={onImei(setImei2)}
              onScan={() => onScan(setImei2)}
            />

            {scanError && (
              <p className="text-[12px] font-medium text-primary">{scanError}</p>
            )}

            {/* Re-check disclaimer — the verification is only as accurate as the
                IMEI submitted, so nudge the user to confirm every digit. */}
            <div className="mt-[4px] flex items-start gap-[8px] rounded-[11px] border-[1.5px] border-warning/25 bg-warning-subtle px-[12px] py-[10px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-[1px] shrink-0">
                <path d="M12 3l9 16H3l9-16z" stroke="#B26B00" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M12 10v4" stroke="#B26B00" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="17" r="1" fill="#B26B00" />
              </svg>
              <p className="text-[12px] font-medium leading-[1.5] text-warning">
                Double-check the IMEI. Re-scan or re-read every digit and confirm it
                matches the number on the device (dial <span className="font-semibold">*#06#</span>) before
                you pay — the result is only as accurate as the IMEI you enter.
              </p>
            </div>
          </div>
        </div>

        {/* bottom */}
        <div className="flex flex-col items-center gap-[12px]">
          <button
            type="button"
            onClick={submit}
            disabled={!complete}
            className="flex w-full items-center justify-center rounded-[14px] bg-primary py-[16px] text-[16px] font-semibold text-white transition active:scale-[0.98] active:bg-primary-press disabled:opacity-40 disabled:active:scale-100"
          >
            Verify &amp; Pay ₹20
          </button>
          <p className="text-[12px] font-normal text-muted">
            Pays ₹20 to Grest via secure gateway
          </p>
        </div>
      </div>
    </PhoneFrame>
  )
}

// IMEI input row: value + in-field pink camera button, with a live digit counter.
function ImeiField({ label, value, onChange, onScan }) {
  const complete = value.length === IMEI_LENGTH
  return (
    <div className="flex flex-col gap-[6px]">
      <FieldLabel>{label}</FieldLabel>
      <div className={`${BOX} gap-[10px]`}>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={onChange}
          placeholder="27ABCDE1234F1Z5"
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium tracking-[0.3px] text-ink outline-none placeholder:tracking-normal placeholder:text-muted"
        />
        <button
          type="button"
          aria-label={`Scan ${label} with camera`}
          onClick={onScan}
          className="flex size-[40px] shrink-0 items-center justify-center rounded-[10px] bg-pink-subtle transition active:scale-90"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 8V7a2 2 0 0 1 2-2h.5l.8-1.2A1 1 0 0 1 8.1 3h3.8a1 1 0 0 1 .8.4L13.5 5H16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z"
              stroke="#EB2652"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="11" r="3" stroke="#EB2652" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex items-center gap-[6px]">
          {complete ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#129E5E" />
              <path d="M7 12.5l3 3 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span className="size-[14px] rounded-full border-[1.5px] border-line" />
          )}
          <span className={`text-[12px] font-medium ${complete ? 'text-success' : 'text-muted'}`}>
            {value.length} / {IMEI_LENGTH} digits
          </span>
        </div>
      )}
    </div>
  )
}
